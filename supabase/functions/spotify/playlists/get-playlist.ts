import { getSpotifyToken } from './../../_shared/get-spotify-token.ts';
import { HTTPException } from '@hono/http-exception';
import { getPlaylist, getPlaylistTracks } from '@soundify/web-api';
import { PageIterator } from '@soundify/pagination';
import { HonoFn } from '../types.ts';
import { validateAuth } from '../../_shared/validate-auth.ts';
import { setupSupabaseWithUser } from '../../_shared/setup-supabase.ts';
import { setupSpotifyClient } from '../../_shared/setup-spotify-client.ts';

export const GetPlaylist: HonoFn<'GetPlaylist'> = async (ctx) => {
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

  const playlistId = ctx.req.param('playlistId');
  const currentPlaylist = await getPlaylist(spotifyClient, playlistId);
  const currentSnapshotId = currentPlaylist.snapshot_id;

  const savedPlaylist = await supabaseClient
    .schema('spotify_cache')
    .from('playlists')
    .select('*')
    .eq('playlist_id', playlistId)
    .eq('snapshot_id', currentSnapshotId)
    .maybeSingle();

  if (savedPlaylist.data) {
    const row = savedPlaylist.data;
    return ctx.json(row, 200);
  }
  const iterator = new PageIterator((offset) =>
    getPlaylistTracks(spotifyClient, playlistId, {
      limit: 50,
      offset,
      fields: 'items(track(id),episode(id))',
    })
  );
  const newTrackIds: string[] = (await iterator.collect()).map(
    // Soundify doesn't have a type for episodes yet
    (item) => item.track?.id || (item as any).episode?.id
  );

  const { data: newRow, error } = await supabaseClient
    .schema('spotify_cache')
    .from('playlists')
    .insert({
      playlist_id: playlistId,
      track_ids: newTrackIds,
      snapshot_id: currentSnapshotId,
      user_id: currentPlaylist.public ? null : currentPlaylist.owner.id,
    })
    .select('*')
    .single();
  if (!newRow) {
    const message = 'Error saving new playlist snapshot.';
    console.error(message + '\n' + error);
    throw new HTTPException(500, {
      message,
    });
  }

  return ctx.json(newRow, 201);
};
