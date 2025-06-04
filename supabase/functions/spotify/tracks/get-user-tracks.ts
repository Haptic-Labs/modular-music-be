import { saveAllUserTracks } from "@/shared/save-all-user-tracks.ts";
import { HonoFn } from "@/shared/types.ts";
import { validateAuth } from "@/shared/validate-auth.ts";
import { setupSupabase } from "@/shared/setup-supabase.ts";
import { getSpotifyToken } from "@/shared/get-spotify-token.ts";
import { setupSpotifyClient } from "@/shared/setup-spotify-client.ts";
import { Schema } from "@/shared/schema.ts";
import { Database } from "@/shared/database.gen.ts";
import {
  SPOTIFY_TRACK_CHECK_LIMIT,
  SUPABASE_MAX_ROWS,
} from "@/shared/constants.ts";
import { HTTPException } from "@hono/http-exception";
import { trueRandomShuffle } from "@/shared/shuffles/true-random-shuffle.ts";
import { checkIfTracksSaved } from "@soundify/web-api";

// TODO: refactor this file to use abstracted `getUserTracks` spotify data fetcher
export const GetUserTracks: HonoFn<"GetUserTracks"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  const { refresh: refreshToken, access: accessToken } = await getSpotifyToken({
    supabaseClient,
    userId,
  });
  const { spotifyClient } = setupSpotifyClient({
    supabaseClient,
    accessToken,
    refreshToken,
    userId,
  });

  const {
    orderBy = "latest-first",
    limit = "all",
    idsToOmit = [],
  }: Schema["GetUserTracks"]["request"] = ctx.req.query() ?? {};
  await saveAllUserTracks({
    userId,
    supabaseClient,
    spotifyClient,
  });

  const tracksPool: Database["spotify_cache"]["Tables"]["user_tracks"]["Row"][] =
    [];
  const trackIdsToRemove: string[] = [];

  let hasAllSavedTracks = false;
  while (!hasAllSavedTracks) {
    const nextPage = await supabaseClient
      .schema("spotify_cache")
      .from("user_tracks")
      .select("*")
      .eq("user_id", userId)
      .filter("track_id", "not.in", `(${idsToOmit.join(",")})`)
      .range(tracksPool.length, tracksPool.length + SUPABASE_MAX_ROWS)
      .limit(SUPABASE_MAX_ROWS)
      .order("added_at", { ascending: false });
    console.log("Fetched saved user tracks:", {
      offset: tracksPool.length,
      count: nextPage.data?.length ?? 0,
      userId,
    });
    if (nextPage.data?.length) tracksPool.push(...nextPage.data);
    if (nextPage.data && nextPage.data.length < SUPABASE_MAX_ROWS)
      hasAllSavedTracks = true;
    if (nextPage.error) {
      const message =
        "Error fetching user tracks." + JSON.stringify(nextPage.error);
      console.error(message);
      throw new HTTPException(500, {
        message,
      });
    }
  }

  if (limit === "all") {
    if (orderBy === "latest-first") {
      console.log("Returning user tracks:", {
        count: tracksPool.length,
        orderBy,
        userId,
      });
      return ctx.json(tracksPool, 200);
    } else if (orderBy === "oldest-first") {
      console.log("Returning user tracks:", {
        count: tracksPool.length,
        orderBy,
        userId,
      });
      return ctx.json(tracksPool.reverse(), 200);
    } else if (orderBy === "random") {
      console.log("Returning user tracks:", {
        count: tracksPool.length,
        orderBy,
        userId,
      });
      return ctx.json(trueRandomShuffle(tracksPool), 200);
    }
  } else {
    const tracksResponse: typeof tracksPool = [];
    let checkedTracksCount = 0;
    if (orderBy === "oldest-first") tracksPool.reverse();
    if (orderBy === "latest-first" || orderBy === "oldest-first") {
      while (
        tracksResponse.length < limit &&
        checkedTracksCount < tracksPool.length
      ) {
        const tracksToCheck = tracksPool.slice(
          checkedTracksCount,
          checkedTracksCount + SPOTIFY_TRACK_CHECK_LIMIT,
        );
        checkedTracksCount += tracksToCheck.length;
        const checks = await checkIfTracksSaved(
          spotifyClient,
          tracksToCheck.map(({ track_id }) => track_id),
        );
        const { tracksToAdd, tracksToOmit } = tracksToCheck.reduce<{
          tracksToAdd: typeof tracksPool;
          tracksToOmit: typeof tracksPool;
        }>(
          (acc, track, i) => {
            if (checks[i]) {
              acc.tracksToAdd.push(track);
            } else {
              acc.tracksToOmit.push(track);
            }
            return acc;
          },
          { tracksToAdd: [], tracksToOmit: [] },
        );
        console.log("Checked user tracks:", {
          userId,
          count: tracksToCheck.length,
          tracksToAdd: tracksToAdd.length,
          tracksToOmit: tracksToOmit.length,
        });

        const tracksCountPastLimit =
          tracksToAdd.length + tracksResponse.length - limit;
        if (tracksCountPastLimit > 0) {
          tracksResponse.push(...tracksToAdd.slice(0, -tracksCountPastLimit));
        } else {
          tracksResponse.push(...tracksToAdd);
        }

        trackIdsToRemove.push(...tracksToOmit.map(({ track_id }) => track_id));
      }
    } else if (orderBy === "random") {
      while (tracksResponse.length < limit && tracksPool.length) {
        const tracksToCheck: typeof tracksPool = [];
        for (let i = 0; i < SPOTIFY_TRACK_CHECK_LIMIT; i++) {
          if (!tracksPool.length) break;
          const randomIndex = Math.floor(Math.random() * tracksPool.length);
          tracksToCheck.push(tracksPool.splice(randomIndex, 1)[0]);
        }
        checkedTracksCount += tracksToCheck.length;
        const checks = await checkIfTracksSaved(
          spotifyClient,
          tracksToCheck.map(({ track_id }) => track_id),
        );
        const { tracksToAdd, tracksToOmit } = tracksToCheck.reduce<{
          tracksToAdd: typeof tracksPool;
          tracksToOmit: typeof tracksPool;
        }>(
          (acc, track, i) => {
            if (checks[i]) {
              acc.tracksToAdd.push(track);
            } else {
              acc.tracksToOmit.push(track);
            }
            return acc;
          },
          { tracksToAdd: [], tracksToOmit: [] },
        );
        console.log("Checked user tracks:", {
          userId,
          count: tracksToCheck.length,
          tracksToAdd: tracksToAdd.length,
          tracksToOmit: tracksToOmit.length,
        });

        const tracksCountPastLimit =
          tracksToAdd.length + tracksResponse.length - limit;
        if (tracksCountPastLimit > 0) {
          tracksResponse.push(...tracksToAdd.slice(0, -tracksCountPastLimit));
        } else {
          tracksResponse.push(...tracksToAdd);
        }

        trackIdsToRemove.push(...tracksToOmit.map(({ track_id }) => track_id));
      }
    }

    await supabaseClient
      .schema("spotify_cache")
      .from("user_tracks")
      .delete()
      .eq("user_id", userId)
      .in("track_id", trackIdsToRemove);
    console.log("Removed user tracks:", {
      count: trackIdsToRemove.length,
      userId,
    });
    console.log("Returning user tracks:", {
      count: tracksResponse.length,
      orderBy,
      userId,
    });
    return ctx.json(tracksResponse, 200);
  }
};
