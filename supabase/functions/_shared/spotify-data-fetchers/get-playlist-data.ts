import { getPlaylist, getPlaylistTracks } from "@soundify/web-api";
import type { Database } from "../database.gen.ts";
import { setupSpotifyClientWithoutTokens } from "../setup-spotify-client.ts";
import { HTTPException } from "@hono/http-exception";
import type { SpotifyDataFetcherArgs } from "../types.ts";

type PlaylistQueryResult = {
  data: Database["spotify_cache"]["Tables"]["playlists"]["Row"];
  isNewlyCreated: boolean;
};

/**
 * Get playlist data from cache or fetch from Spotify and cache it
 */
export const getPlaylistData = async ({
  spotifyId,
  supabaseClient,
  ...rest
}: SpotifyDataFetcherArgs): Promise<PlaylistQueryResult> => {
  if (!rest.spotifyClient && !rest.userId) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  const spotifyClient =
    rest.spotifyClient ??
    (rest.userId
      ? await setupSpotifyClientWithoutTokens({
          supabaseClient,
          userId: rest.userId,
        })
      : undefined);

  if (!spotifyClient) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  // Fetch current playlist to get snapshot ID
  const currentPlaylist = await getPlaylist(spotifyClient, spotifyId);
  const currentSnapshotId = currentPlaylist.snapshot_id;

  // Check if we have this playlist cached with the current snapshot ID
  const savedPlaylist = await supabaseClient
    .schema("spotify_cache")
    .from("playlists")
    .select("*")
    .eq("playlist_id", spotifyId)
    .eq("snapshot_id", currentSnapshotId)
    .maybeSingle();

  // Return cached data if available
  if (savedPlaylist.data) {
    return {
      data: savedPlaylist.data,
      isNewlyCreated: false,
    };
  }

  // Fetch all track IDs from the playlist
  const trackIds: string[] = [];
  let hasAllTracks = false;
  const pageLimit = 50;
  while (!hasAllTracks) {
    const nextPage = await getPlaylistTracks(spotifyClient, spotifyId, {
      limit: pageLimit,
      offset: trackIds.length,
      fields: "items(track(id))",
    });
    trackIds.push(
      ...nextPage.items.map((item) => item.track?.id).filter(Boolean),
    );
    if (nextPage.items.length < pageLimit) {
      hasAllTracks = true;
    }
  }

  // Delete cached playlist if it exists because it is outdated
  await supabaseClient
    .schema("spotify_cache")
    .from("playlists")
    .delete()
    .eq("playlist_id", spotifyId);
  // Insert new playlist data into cache
  const { data: newRow, error } = await supabaseClient
    .schema("spotify_cache")
    .from("playlists")
    .insert({
      playlist_id: spotifyId,
      track_ids: trackIds,
      snapshot_id: currentSnapshotId,
      user_id: currentPlaylist.public ? null : currentPlaylist.owner.id,
    })
    .select("*")
    .single();

  if (!newRow) {
    const message = "Error saving new playlist snapshot.";
    console.error(message + "\n" + error);
    throw new Error(message);
  }

  return {
    data: newRow,
    isNewlyCreated: true,
  };
};
