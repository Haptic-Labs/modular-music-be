import { HTTPException } from "@hono/http-exception";
import type { Database } from "../database.gen.ts";
import type { SpotifyDataFetcherArgs } from "../types.ts";
import { setupSpotifyClientWithoutTokens } from "../setup-spotify-client.ts";
import { getAlbumTracks } from "@soundify/web-api";

type AlbumQueryResult = {
  data: Database["spotify_cache"]["Tables"]["albums"]["Row"];
  isNewlyCreated: boolean;
};

export const getAlbumData = async ({
  spotifyId,
  supabaseClient,
  ...rest
}: SpotifyDataFetcherArgs): Promise<AlbumQueryResult> => {
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

  const existingAlbum = await supabaseClient
    .schema("spotify_cache")
    .from("albums")
    .select("*")
    .eq("album_id", spotifyId)
    .maybeSingle();

  if (existingAlbum.data) {
    return { data: existingAlbum.data, isNewlyCreated: false };
  }

  const trackIds: string[] = [];
  let hasAllTracks = false;
  const pageLimit = 50;
  while (!hasAllTracks) {
    const nextPage = await getAlbumTracks(spotifyClient, spotifyId, {
      limit: 50,
      offset: trackIds.length,
    });
    trackIds.push(...nextPage.items.map((item) => item.id));
    if (nextPage.items.length < pageLimit) {
      hasAllTracks = true;
    }
  }

  const { data: newRow, error } = await supabaseClient
    .schema("spotify_cache")
    .from("albums")
    .insert({
      album_id: spotifyId,
      created_at: new Date().toISOString(),
      track_ids: trackIds,
    })
    .select("*")
    .single();

  if (!newRow) {
    const message = `Error saving new album: ${spotifyId}`;
    console.error(message + "\n" + JSON.stringify(error, null, 2));
    throw new HTTPException(500, {
      message,
    });
  }

  return { data: newRow, isNewlyCreated: true };
};
