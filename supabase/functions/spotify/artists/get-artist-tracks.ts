import { setupSpotifyClient } from "@shared/setup-spotify-client.ts";
import { getSpotifyToken } from "@shared/get-spotify-token.ts";
import { setupSupabaseWithUser } from "@shared/setup-supabase.ts";
import { getArtistData } from "@shared/spotify-data-fetchers/get-artist-data.ts";
import { validateAuth } from "@shared/validate-auth.ts";
import { HonoFn } from "@shared/types.ts";

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

  const artistId = ctx.req.param("artistId");
  const { data } = await getArtistData({
    spotifyClient,
    spotifyId: artistId,
    supabaseClient,
    userId,
  });
  const isNewlyCreated = data.albums.some((album) => album.isNewlyCreated);

  return ctx.json(
    {
      artist_id: artistId,
      albums: data.albums.map(({ isNewlyCreated: _, ...album }) => album),
    },
    isNewlyCreated ? 201 : 200,
  );
};
