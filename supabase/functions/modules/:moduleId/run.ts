import {
  setupSupabaseWithUser,
  setupSupabaseWithServiceRole,
} from "../../_shared/setup-supabase.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { getAllTrackIds } from "../../_shared/spotify-data-fetchers/get-all-track-ids.ts";
import { HTTPException } from "@hono/http-exception";
import { BlankEnv, H, HandlerResponse } from "@hono/hono/types";
import { Schema } from "../../_shared/schema.ts";

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

  const { data, error } = await serviceRoleSupabaseClient
    .schema("public")
    .rpc("GetModuleRunData", { moduleId, callerUserId: user.id })
    .single();

  if (error) {
    const errorCode = parseInt(error.code, 10);

    // Validate the errorCode to ensure it's a valid HTTP status code
    const httpStatus = errorCode >= 100 && errorCode < 600 ? errorCode : 500;

    throw new HTTPException(httpStatus as StatusCode, {
      message: error.message,
    });
  }

  const trackIdsFromSources = await getAllTrackIds({
    userId: user.id,
    sources: data.moduleSources,
    supabaseClient: serviceRoleSupabaseClient,
  });

  // TODO: implement actions and output
};
