import { HTTPException } from "@hono/http-exception";
import type { SpotifyDataFetcherArgs } from "../types.ts";
import { setupSpotifyClientWithoutTokens } from "@shared/setup-spotify-client.ts";
import { saveAllUserTracks } from "@shared/save-all-user-tracks.ts";
import type { Database } from "../database.gen.ts";
import {
  SPOTIFY_TRACK_CHECK_LIMIT,
  SUPABASE_MAX_ROWS,
} from "@shared/constants.ts";
import { checkIfTracksSaved } from "@soundify/web-api";

type UserTracksQueryResult = {
  data: Pick<
    Database["spotify_cache"]["Tables"]["user_tracks"]["Row"],
    "track_id" | "added_at"
  >[];
};

export const getUserTracks = async ({
  spotifyId: userId,
  supabaseClient,
  checkIfSaved,
  ...rest
}: SpotifyDataFetcherArgs & {
  checkIfSaved?: boolean;
}): Promise<UserTracksQueryResult> => {
  if (!rest.spotifyClient && !rest.userId && !userId) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  const spotifyClient =
    rest.spotifyClient ??
    (rest.userId
      ? await setupSpotifyClientWithoutTokens({
          supabaseClient,
          userId,
        })
      : undefined);

  if (!spotifyClient) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  await saveAllUserTracks({
    userId,
    supabaseClient,
    spotifyClient,
  });

  const userTracks: Pick<
    Database["spotify_cache"]["Tables"]["user_tracks"]["Row"],
    "added_at" | "track_id"
  >[] = [];
  let hasAllSavedTracks = false;
  while (!hasAllSavedTracks) {
    const nextPage = await supabaseClient
      .schema("spotify_cache")
      .from("user_tracks")
      .select("track_id, added_at")
      .eq("user_id", userId)
      .range(userTracks.length, userTracks.length + SUPABASE_MAX_ROWS)
      .limit(SUPABASE_MAX_ROWS)
      .order("added_at", { ascending: false });
    if (nextPage.data?.length) userTracks.push(...nextPage.data);
    if (nextPage.data && nextPage.data.length < SUPABASE_MAX_ROWS) {
      hasAllSavedTracks = true;
    }
    if (nextPage.error) {
      throw new HTTPException(500, {
        message: `Error fetching user tracks: ${JSON.stringify(nextPage.error)}`,
      });
    }
  }

  if (!checkIfSaved) {
    return { data: userTracks };
  }

  const tracksToReturn: typeof userTracks = [];
  const tracksToRemove: typeof userTracks = [];
  let checkedTracksCount = 0;
  while (checkedTracksCount < userTracks.length) {
    const tracksToCheck = userTracks.slice(
      checkedTracksCount,
      checkedTracksCount + SPOTIFY_TRACK_CHECK_LIMIT,
    );
    checkedTracksCount += tracksToCheck.length;
    const checks = await checkIfTracksSaved(
      spotifyClient,
      tracksToCheck.map((track) => track.track_id),
    );
    const { tracksToAdd, tracksToRemove } = tracksToCheck.reduce<{
      tracksToAdd: typeof userTracks;
      tracksToRemove: typeof userTracks;
    }>(
      (acc, track, i) => {
        if (checks[i]) {
          acc.tracksToAdd.push(track);
        } else {
          acc.tracksToRemove.push(track);
        }
        return acc;
      },
      { tracksToAdd: [], tracksToRemove: [] },
    );

    tracksToReturn.push(...tracksToAdd);
    tracksToRemove.push(...tracksToRemove);
  }

  await supabaseClient
    .schema("spotify_cache")
    .from("user_tracks")
    .delete()
    .in(
      "track_id",
      tracksToRemove.map((track) => track.track_id),
    );

  return { data: tracksToReturn };
};
