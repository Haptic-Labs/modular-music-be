import { PageIterator } from "@soundify/pagination";
import { setupSpotifyClient } from "../../_shared/setup-spotify-client.ts";
import { getSpotifyToken } from "../../_shared/get-spotify-token.ts";
import { setupSupabaseWithUser } from "../../_shared/setup-supabase.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { HonoFn } from "../../_shared/types.ts";
import { getArtistAlbums, getAlbumTracks } from "@soundify/web-api";
import { HTTPException } from "@hono/http-exception";

export const GetArtistTracks: HonoFn<"GetArtistTracks"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient, user } = await setupSupabaseWithUser({ authHeader });

  const userId = user.id;
  const { refresh: refreshToken, access: accessToken } = await getSpotifyToken({
    supabaseClient,
    userId,
  });

  const { spotifyClient } = setupSpotifyClient({
    accessToken,
    refreshToken,
    supabaseClient,
    userId,
  });

  const fetchNewAlbums = async (albumIds: string[]) => {
    const trackIdsSet = new Set<string>();
    await Promise.all(
      albumIds.map(async (albumId) => {
        const iterator = new PageIterator((offset) =>
          getAlbumTracks(spotifyClient, albumId, {
            limit: 50,
            offset,
          }),
        );

        const trackIds = (await iterator.collect()).map((item) => item.id);
        const { data: newAlbumRow, error } = await supabaseClient
          .schema("spotify_cache")
          .from("albums")
          .insert({
            album_id: albumId,
            track_ids: trackIds,
          })
          .select("*")
          .single();

        if (!newAlbumRow) {
          const message = `Error saving new album: ${albumId}`;
          console.error(message + "\n" + JSON.stringify(error, null, 2));
          throw new HTTPException(500, {
            message,
          });
        } else {
          trackIds.forEach((id) => trackIdsSet.add(id));
        }
      }),
    );

    return Array.from(trackIdsSet);
  };

  const artistId = ctx.req.param("artistId");
  const existingArtist = await supabaseClient
    .schema("spotify_cache")
    .from("artists")
    .select("*")
    .eq("artist_id", artistId)
    .maybeSingle();

  if (existingArtist.data) {
    const albumIds = existingArtist.data.album_ids;
    const albums = await supabaseClient
      .schema("spotify_cache")
      .from("albums")
      .select("*")
      .in("album_id", albumIds);

    const albumsToFetch = albumIds.filter(
      (id) => !albums.data?.some((album) => album.album_id === id),
    );
    const trackIdsSet = new Set(
      albums.data?.flatMap((album) => album.track_ids) || [],
    );

    const newTrackIds = await fetchNewAlbums(albumsToFetch);
    newTrackIds.forEach((id) => trackIdsSet.add(id));

    return ctx.json(
      {
        ...existingArtist.data,
        track_ids: Array.from(trackIdsSet),
      },
      newTrackIds.length ? 201 : 200,
    );
  }

  const albumIterator = new PageIterator((offset) =>
    getArtistAlbums(spotifyClient, artistId, {
      limit: 50,
      offset,
      include_groups: ["album", "ep", "single"],
    }),
  );
  const albums = (await albumIterator.collect()).map((album) => album.id);
  const existingAlbums = await supabaseClient
    .schema("spotify_cache")
    .from("albums")
    .select("*")
    .in("album_id", albums);
  const existingAlbumIds =
    existingAlbums.data?.map((album) => album.album_id) || [];
  const existingTracks = new Set(
    existingAlbums.data?.flatMap((album) => album.track_ids) ?? [],
  );

  const albumsToFetch = albums.filter((id) => !existingAlbumIds.includes(id));
  const newTrackIds = await fetchNewAlbums(albumsToFetch);
  newTrackIds.forEach((id) => existingTracks.add(id));
  return ctx.json(
    {
      artist_id: artistId,
      album_ids: albums,
      track_ids: Array.from(existingTracks),
    },
    newTrackIds.length ? 201 : 200,
  );
};
