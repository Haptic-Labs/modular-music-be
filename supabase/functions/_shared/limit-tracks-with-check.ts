import { checkIfTracksSaved, SpotifyClient } from "@soundify/web-api";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@shared/database.gen.ts";
import { chunkArray } from "@shared/chunk-array.ts";
import { SPOTIFY_TRACK_CHECK_LIMIT } from "@shared/mod.ts";

type LimitTracksWithCheckArgs = {
  trackIds: Set<string>;
  likedTrackIds: Set<string>;
  limit: number;
  spotifyClient: SpotifyClient;
  supabaseServiceRoleClient: SupabaseClient<Database>;
  userId: string;
};

export const limitTracksWithCheck = async ({
  trackIds,
  likedTrackIds,
  limit,
  spotifyClient,
  supabaseServiceRoleClient,
  userId,
}: LimitTracksWithCheckArgs): Promise<Set<string>> => {
  const limitedSet = new Set<string>();
  let checkedTrackCount = 0;
  const unsavedTrackIds = new Set<string>();

  while (limitedSet.size < limit && checkedTrackCount < trackIds.size) {
    const remainingToCheck = Math.min(
      SPOTIFY_TRACK_CHECK_LIMIT,
      trackIds.size - checkedTrackCount,
      limit - limitedSet.size + unsavedTrackIds.size,
    );
    const page = Array.from(trackIds).slice(
      checkedTrackCount,
      checkedTrackCount + remainingToCheck,
    );
    checkedTrackCount += page.length;
    page.forEach((trackId) => limitedSet.add(trackId));

    const tracksToCheck = page.filter((trackId) => likedTrackIds.has(trackId));
    const batchesToCheck = chunkArray(tracksToCheck, SPOTIFY_TRACK_CHECK_LIMIT);
    await Promise.allSettled(
      batchesToCheck.map(async (batch) => {
        const savedStatus = await checkIfTracksSaved(spotifyClient, batch);
        savedStatus.forEach((isSaved, index) => {
          if (!isSaved) {
            limitedSet.delete(batch[index]);
            unsavedTrackIds.add(batch[index]);
          }
        });
      }),
    );
  }

  if (unsavedTrackIds.size) {
    await supabaseServiceRoleClient
      .schema("spotify_cache")
      .from("user_tracks")
      .delete()
      .in("track_id", Array.from(unsavedTrackIds))
      .eq("user_id", userId);
  }

  return limitedSet;
};
