import {
  setupSupabaseWithUser,
  setupSupabaseWithServiceRole,
} from "@/shared/setup-supabase.ts";
import { validateAuth } from "@/shared/validate-auth.ts";
import { trueRandomShuffle } from "@/shared/shuffles/true-random-shuffle.ts";
import { getAllTrackIds } from "@/shared/spotify-data-fetchers/get-all-track-ids.ts";
import { HTTPException } from "@hono/http-exception";
import { BlankEnv, H, HandlerResponse } from "@hono/hono/types";
import { Schema } from "@/shared/schema.ts";
import { Database } from "@/shared/database.gen.ts";

type StatusCode = ConstructorParameters<typeof HTTPException>[0];

export const RunModule: H<
  BlankEnv,
  Schema["RunModule"]["path"],
  {
    in: Schema["RunModule"]["request"];
    out: Schema["RunModule"]["request"];
    outputFormat: "json";
  },
  HandlerResponse<Schema["RunModule"]["response"]>
> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { user } = await setupSupabaseWithUser({ authHeader });
  const { serviceRoleSupabaseClient } = setupSupabaseWithServiceRole();
  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  await serviceRoleSupabaseClient
    .schema("public")
    .from("modules")
    .update({
      is_running: true,
    })
    .eq("id", moduleId);

  try {
    const { data, error } = await serviceRoleSupabaseClient
      .schema("public")
      .rpc("GetModuleRunData", { moduleId, callerUserId: user.id });

    if (error) {
      const errorCode = parseInt(error.code, 10);

      // Validate the errorCode to ensure it's a valid HTTP status code
      const httpStatus = errorCode >= 100 && errorCode < 600 ? errorCode : 500;

      throw new HTTPException(httpStatus as StatusCode, {
        message: error.message,
      });
    }

    const moduleData: Database["public"]["Functions"]["GetModuleRunData"]["Returns"] =
      data;

    if (!moduleData) {
      throw new HTTPException(500, {
        message: "Module data not found",
      });
    }

    let workingTrackIds = await getAllTrackIds({
      userId: user.id,
      sources: moduleData.moduleSources ?? [],
      supabaseClient: serviceRoleSupabaseClient,
    });

    // Run through actions
    moduleData.moduleActions?.forEach(async (action) => {
      switch (action.type) {
        case "LIMIT":
          workingTrackIds = workingTrackIds.slice(
            0,
            moduleData.limitConfigs?.find((config) => config.id === action.id)
              ?.limit ?? undefined,
          );
          break;
        case "COMBINE":
          workingTrackIds = workingTrackIds.concat(
            await getAllTrackIds({
              sources:
                moduleData.combineSources
                  ?.filter((source) => source.action_id === action.id)
                  .map((source) => ({
                    ...source,
                    type: source.source_type,
                  })) ?? [],
              supabaseClient: serviceRoleSupabaseClient,
              userId: user.id,
            }),
          );
          break;
        case "FILTER": {
          const trackIdsToRemove = await getAllTrackIds({
            sources:
              moduleData.filterSources
                ?.filter((source) => source.action_id === action.id)
                .map((source) => ({
                  ...source,
                  type: source.source_type,
                })) ?? [],
            supabaseClient: serviceRoleSupabaseClient,
            userId: user.id,
          });
          workingTrackIds = workingTrackIds.filter(
            (trackId) => !trackIdsToRemove.includes(trackId),
          );
          break;
        }
        case "SHUFFLE":
          workingTrackIds = trueRandomShuffle(workingTrackIds);
          break;
      }
    });

    // TODO: write result to outputs
  } finally {
    await serviceRoleSupabaseClient
      .schema("public")
      .from("modules")
      .update({ is_running: false })
      .eq("id", moduleId);
  }
};
