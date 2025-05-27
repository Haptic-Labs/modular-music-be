import { HTTPException } from '@hono/http-exception';
import { getSpotifyToken } from '../../_shared/get-spotify-token.ts';
import { validateAuth } from '../../_shared/validate-auth.ts';
import { HonoFn } from '../types.ts';
import { setupSupabaseWithUser } from '../../_shared/setup-supabase.ts';
import { setupSpotifyClient } from '../../_shared/setup-spotify-client.ts';
import { PageIterator } from '@soundify/pagination';
import { getAlbumTracks } from '@soundify/web-api';

export const GetAlbumTracks: HonoFn<'GetAlbumTracks'> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient, user } = await setupSupabaseWithUser({ authHeader });

  const userId = user.id;

  const { refresh: refreshToken, access: accessToken } = await getSpotifyToken({
    supabaseClient,
    userId,
  });

  const albumId = ctx.req.param('albumId');
  const existingAlbum = await supabaseClient
    .schema('spotify_cache')
    .from('albums')
    .select('*')
    .eq('album_id', albumId)
    .maybeSingle();

  if (existingAlbum.data) {
    return ctx.json(existingAlbum.data, 200);
  }

  const { spotifyClient } = setupSpotifyClient({
    accessToken,
    refreshToken,
    supabaseClient,
    userId,
  });

  const iterator = new PageIterator((offset) =>
    getAlbumTracks(spotifyClient, albumId, {
      limit: 50,
      offset,
    })
  );

  const trackIds = (await iterator.collect()).map((item) => item.id);
  const { data: newRow, error } = await supabaseClient
    .schema('spotify_cache')
    .from('albums')
    .insert({
      album_id: albumId,
      track_ids: trackIds,
    })
    .select('*')
    .single();

  if (!newRow) {
    const message = `Error saving new album: ${albumId}`;
    console.error(message + '\n' + JSON.stringify(error, null, 2));
    throw new HTTPException(500, {
      message,
    });
  }

  return ctx.json(newRow, 201);
};
