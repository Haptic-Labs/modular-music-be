import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.gen.ts';
import { SchemaName } from './constants.ts';
import { HTTPException } from '@hono/http-exception';
import { spotifyTokenRefresher } from './spotify-token-refresher.ts';

type GetSpotifyTokenArgs = {
  supabaseClient: SupabaseClient<Database, SchemaName, Database[SchemaName]>;
  userId: string;
};

export const getSpotifyToken = async ({
  supabaseClient,
  userId,
}: GetSpotifyTokenArgs) => {
  const currentSavedToken = await supabaseClient
    .schema('spotify_auth')
    .from('provider_session_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!currentSavedToken.data) {
    throw new HTTPException(400, {
      message: 'No Spotify token found for user.',
    });
  }

  const result =
    currentSavedToken.data.expires_at > new Date().toISOString()
      ? currentSavedToken.data
      : await spotifyTokenRefresher({
          refreshToken: currentSavedToken.data.refresh,
          supabaseClient,
          userId,
        });

  return result;
};
