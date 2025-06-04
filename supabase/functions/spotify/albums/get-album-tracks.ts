import { HTTPException } from "@hono/http-exception";
import { getSpotifyToken } from "@/shared/get-spotify-token.ts";
import { validateAuth } from "@/shared/validate-auth.ts";
import { HonoFn } from "@/shared/types.ts";
import { setupSupabaseWithUser } from "@/shared/setup-supabase.ts";
import { setupSpotifyClient } from "@/shared/setup-spotify-client.ts";
import { getAlbumData } from "@/shared/spotify-data-fetchers/get-album-data.ts";

/**
 * HTTP handler for getting album tracks
 */
export const GetAlbumTracks: HonoFn<"GetAlbumTracks"> = async (ctx) => {
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

  const albumId = ctx.req.param("albumId");

  try {
    const result = await getAlbumData({
      spotifyId: albumId,
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
