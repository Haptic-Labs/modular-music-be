import { HTTPException } from "@hono/http-exception";
import { SpotifyDataFetcherArgs } from "../types.ts";
import { setupSpotifyClientWithoutTokens } from "../setup-spotify-client.ts";
import { PageIterator } from "@soundify/pagination";
import { getArtistAlbums } from "@soundify/web-api";
import { getAlbumData } from "./get-album-data.ts";

type ArtistQueryResult = {
  data: {
    artist_id: string;
    albums: {
      album_id: string;
      track_ids: string[];
      isNewlyCreated: boolean;
    }[];
  };
};

export const getArtistData = async ({
  spotifyId,
  supabaseClient,
  ...rest
}: SpotifyDataFetcherArgs): Promise<ArtistQueryResult> => {
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

  const albumIterator = new PageIterator((offset) =>
    getArtistAlbums(spotifyClient, spotifyId, {
      limit: 50,
      offset,
      include_groups: ["album", "ep", "single"],
    }),
  );
  const albumIds = (await albumIterator.collect()).map((album) => album.id);
  const albums: ArtistQueryResult["data"]["albums"] = [];
  await Promise.allSettled(
    albumIds.map(async (albumId) => {
      const { data, isNewlyCreated } = await getAlbumData({
        spotifyClient,
        spotifyId: albumId,
        supabaseClient,
        userId: rest.userId,
      });

      albums.push({
        album_id: data.album_id,
        track_ids: data.track_ids,
        isNewlyCreated,
      });
    }),
  );

  return {
    data: {
      artist_id: spotifyId,
      albums: albums,
    },
  };
};
