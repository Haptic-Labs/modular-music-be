import {
  setupSupabaseWithUser,
  setupSupabaseWithServiceRole,
} from "@shared/setup-supabase.ts";
import { validateAuth } from "@shared/validate-auth.ts";
import { trueRandomShuffle } from "@shared/shuffles/true-random-shuffle.ts";
import { getAllTrackIds } from "@shared/spotify-data-fetchers/get-all-track-ids.ts";
import { HTTPException } from "@hono/http-exception";
import { Schema } from "@shared/schema.ts";
import { addItemsToPlaylist, removePlaylistItems } from "@soundify/web-api";
import { setupSpotifyClientWithoutTokens } from "@shared/setup-spotify-client.ts";
import { chunkArray } from "@shared/chunk-array.ts";
import { getPlaylistData } from "@shared/spotify-data-fetchers/get-playlist-data.ts";
import { limitTracksWithCheck } from "@shared/limit-tracks-with-check.ts";
import { HonoFn } from "@shared/types.ts";
import { User } from "@supabase/supabase-js";

type StatusCode = ConstructorParameters<typeof HTTPException>[0];

export const RunModule: HonoFn<"RunModule"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const isServiceRole =
    authHeader.replace("Bearer ", "") ===
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let user: User | undefined;
  try {
    const res = await setupSupabaseWithUser({ authHeader });
    user = res.user;
  } catch (error) {
    if (!isServiceRole) {
      throw error;
    }
  }

  const { serviceRoleSupabaseClient } = setupSupabaseWithServiceRole();
  const requestBody = await ctx.req.json<Schema["RunModule"]["request"]>();
  const providedUserId = requestBody.userId;

  let canRunModule = false;

  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  const { data, error } = await serviceRoleSupabaseClient
    .schema("public")
    .from("modules")
    .select("user_id")
    .eq("id", moduleId)
    .maybeSingle();

  if (!data || error) {
    throw new HTTPException(422, {
      message: "Module does not exist",
    });
  }

  if (providedUserId && isServiceRole && providedUserId === data.user_id) {
    // If a userId is provided, allow if using service role is invoker
    canRunModule = true;
  } else if (data?.user_id === user?.id) {
    // Otherwise, only allow if the module belongs to the invoking user
    canRunModule = true;
  }

  if (!canRunModule) {
    throw new HTTPException(403, {
      message: "You do not have permission to run this module",
    });
  }

  const resolvedUserId = providedUserId || user?.id;

  if (!resolvedUserId) {
    throw new HTTPException(500, {
      message: "No userId found",
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
      .rpc("GetModuleRunData", { moduleId, callerUserId: resolvedUserId });

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

    const {
      allTrackIds: initialTrackIds,
      likedSongsTrackIds: initialLikedSongsTrackIdsSet,
    } = await getAllTrackIds({
      userId: resolvedUserId,
      sources: moduleData.moduleSources ?? [],
      supabaseClient: serviceRoleSupabaseClient,
      checkIfSaved: false,
    });
    let hasCheckedAllTracks = false;

    const spotifyClient = await setupSpotifyClientWithoutTokens({
      supabaseClient: serviceRoleSupabaseClient,
      userId: resolvedUserId,
    });

    // Run through actions
    const actionsPromise =
      moduleData.moduleActions?.reduce<
        Promise<{
          workingTrackIds: Set<string>;
          likedSongsTrackIdsSet: Set<string>;
        }>
      >(
        async (acc, action) => {
          let { workingTrackIds, likedSongsTrackIdsSet } = await acc;
          switch (action.type) {
            case "LIMIT":
              workingTrackIds = await limitTracksWithCheck({
                supabaseServiceRoleClient: serviceRoleSupabaseClient,
                spotifyClient,
                trackIds: workingTrackIds,
                likedTrackIds: likedSongsTrackIdsSet,
                userId: resolvedUserId,
                limit:
                  moduleData.limitConfigs?.find(
                    (config) => config.id === action.id,
                  )?.limit ?? 0,
              });
              hasCheckedAllTracks = true;
              break;
            case "COMBINE": {
              const { allTrackIds, likedSongsTrackIds } = await getAllTrackIds({
                sources:
                  moduleData.combineSources
                    ?.filter((source) => source.action_id === action.id)
                    .map((source) => ({
                      ...source,
                      type: source.source_type,
                    })) ?? [],
                supabaseClient: serviceRoleSupabaseClient,
                userId: resolvedUserId,
                checkIfSaved: false,
              });
              allTrackIds.forEach((trackId) => workingTrackIds.add(trackId));
              likedSongsTrackIds.forEach((trackId) =>
                likedSongsTrackIdsSet.add(trackId),
              );
              hasCheckedAllTracks = false;
              break;
            }

            case "FILTER": {
              const { allTrackIds: trackIdsToRemove } = await getAllTrackIds({
                sources:
                  moduleData.filterSources
                    ?.filter((source) => source.action_id === action.id)
                    .map((source) => ({
                      ...source,
                      type: source.source_type,
                    })) ?? [],
                supabaseClient: serviceRoleSupabaseClient,
                userId: resolvedUserId,
                checkIfSaved: false,
              });
              trackIdsToRemove.forEach((trackId) =>
                workingTrackIds.delete(trackId),
              );
              break;
            }
            case "SHUFFLE":
              workingTrackIds = new Set(
                trueRandomShuffle(Array.from(workingTrackIds)),
              );
              break;
          }
          return { workingTrackIds, likedSongsTrackIdsSet };
        },
        Promise.resolve({
          workingTrackIds: initialTrackIds,
          likedSongsTrackIdsSet: initialLikedSongsTrackIdsSet,
        }),
      ) ??
      Promise.resolve({
        workingTrackIds: initialTrackIds,
        likedSongsTrackIdsSet: initialLikedSongsTrackIdsSet,
      });
    let { workingTrackIds: trackIds, likedSongsTrackIdsSet } =
      await actionsPromise;

    if (!hasCheckedAllTracks) {
      trackIds = await limitTracksWithCheck({
        supabaseServiceRoleClient: serviceRoleSupabaseClient,
        spotifyClient,
        trackIds,
        likedTrackIds: likedSongsTrackIdsSet,
        userId: resolvedUserId,
        limit: initialTrackIds.size,
      });
    }

    const trackIdBatches = chunkArray(Array.from(trackIds), 50);

    await Promise.allSettled(
      moduleData.moduleOutputs?.map(async (output) => {
        switch (output.type) {
          case "PLAYLIST": {
            switch (output.mode) {
              case "APPEND": {
                const promise = trackIdBatches.reduce(async (acc, batch) => {
                  await acc;
                  await addItemsToPlaylist(
                    spotifyClient,
                    output.spotify_id,
                    batch.map((id) => `spotify:track:${id}`),
                  );
                }, Promise.resolve());
                await promise;
                return;
              }
              case "PREPEND": {
                const promise = trackIdBatches
                  .toReversed()
                  .reduce(async (acc, batch) => {
                    await acc;
                    await addItemsToPlaylist(
                      spotifyClient,
                      output.spotify_id,
                      batch.map((id) => `spotify:track:${id}`),
                      0,
                    );
                  }, Promise.resolve());
                await promise;
                return;
              }
              case "REPLACE": {
                const { data: playlist } = await getPlaylistData({
                  spotifyId: output.spotify_id,
                  supabaseClient: serviceRoleSupabaseClient,
                  userId: resolvedUserId,
                  spotifyClient,
                });
                const playlistTrackBatches = chunkArray(
                  playlist.track_ids,
                  100,
                );
                const removePromise = playlistTrackBatches.reduce(
                  async (acc, batch) => {
                    await acc;
                    await removePlaylistItems(
                      spotifyClient,
                      output.spotify_id,
                      batch.map((id) => `spotify:track:${id}`),
                    );
                  },
                  Promise.resolve(),
                );
                await removePromise;
                const addPromise = trackIdBatches.reduce(async (acc, batch) => {
                  await acc;
                  await addItemsToPlaylist(
                    spotifyClient,
                    output.spotify_id,
                    batch.map((id) => `spotify:track:${id}`),
                  );
                }, Promise.resolve());
                try {
                  await addPromise;
                  return;
                } catch (error) {
                  console.error(JSON.stringify(error, null, 2));
                }
              }
            }
          }
        }
      }) ?? [],
    );

    await serviceRoleSupabaseClient
      .schema("public")
      .from("modules")
      .update({
        previous_run: new Date().toISOString(),
      })
      .eq("id", moduleId);

    if (requestBody?.fromSchedule) {
      const res = await serviceRoleSupabaseClient.functions.invoke(
        `modules/${moduleId}/schedule`,
        {
          body: {
            reschedule: true,
          },
        },
      );
      console.info("haptic-test", JSON.stringify(res, null, 2));
    }

    return ctx.json({}, 201);
  } finally {
    await serviceRoleSupabaseClient
      .schema("public")
      .from("modules")
      .update({ is_running: false })
      .eq("id", moduleId);
  }
};
