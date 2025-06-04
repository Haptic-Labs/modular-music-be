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
import {
  addItemsToPlaylist,
  removePlaylistItems,
} from "npm:@soundify/web-api@1.1.5";
import { setupSpotifyClientWithoutTokens } from "@/shared/setup-spotify-client.ts";
import { chunkArray } from "@/shared/chunk-array.ts";
import { getPlaylistData } from "@/shared/spotify-data-fetchers/get-playlist-data.ts";

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
    const { data: moduleData, error } = await serviceRoleSupabaseClient
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

    const spotifyClient = await setupSpotifyClientWithoutTokens({
      supabaseClient: serviceRoleSupabaseClient,
      userId: user.id,
    });

    const trackIdBatches = chunkArray(workingTrackIds, 100);

    moduleData.moduleOutputs?.forEach(async (output) => {
      switch (output.type) {
        case "PLAYLIST": {
          switch (output.mode) {
            case "APPEND": {
              trackIdBatches.forEach(async (batch) => {
                await addItemsToPlaylist(
                  spotifyClient,
                  output.spotify_id,
                  batch.map((id) => `spotify:track:${id}`),
                );
              });
              return;
            }
            case "PREPEND": {
              trackIdBatches.toReversed().forEach(async (batch) => {
                await addItemsToPlaylist(
                  spotifyClient,
                  output.spotify_id,
                  batch.map((id) => `spotify:track:${id}`),
                  0,
                );
              });
              return;
            }
            case "REPLACE": {
              const { data: playlist } = await getPlaylistData({
                spotifyId: output.spotify_id,
                supabaseClient: serviceRoleSupabaseClient,
                userId: user.id,
                spotifyClient,
              });
              const playlistTrackBatches = chunkArray(playlist.track_ids, 100);
              playlistTrackBatches.forEach(async (batch) => {
                await removePlaylistItems(
                  spotifyClient,
                  output.spotify_id,
                  batch.map((id) => `spotify:track:${id}`),
                );
              });
              trackIdBatches.forEach(async (batch) => {
                await addItemsToPlaylist(
                  spotifyClient,
                  output.spotify_id,
                  batch.map((id) => `spotify:track:${id}`),
                );
              });
            }
          }
        }
      }
    });

    return ctx.json({}, 201);
  } finally {
    await serviceRoleSupabaseClient
      .schema("public")
      .from("modules")
      .update({ is_running: false })
      .eq("id", moduleId);
  }
};
