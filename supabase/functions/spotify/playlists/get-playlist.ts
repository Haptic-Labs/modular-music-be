import { getSpotifyToken } from "@/shared/get-spotify-token.ts";
import { HTTPException } from "@hono/http-exception";
import { HonoFn } from "@/shared/types.ts";
import { validateAuth } from "@/shared/validate-auth.ts";
import { setupSupabaseWithUser } from "@/shared/setup-supabase.ts";
import { setupSpotifyClient } from "@/shared/setup-spotify-client.ts";
import { getPlaylistData } from "@/shared/spotify-data-fetchers/get-playlist-data.ts";

/**
 * HTTP handler for getting playlist data
 */
export const GetPlaylist: HonoFn<"GetPlaylist"> = async (ctx) => {
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

  const playlistId = ctx.req.param("playlistId");

  try {
    const result = await getPlaylistData({
      spotifyId: playlistId,
      spotifyClient,
      supabaseClient,
    });

    return ctx.json(result.data, result.isNewlyCreated ? 201 : 200);
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(500, {
        message: error.message,
      });
    }
    throw error;
  }
};
