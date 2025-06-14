import { HTTPException } from "@hono/http-exception";
import { SpotifyClient } from "@soundify/web-api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.gen.ts";
import type { SchemaName } from "./constants.ts";
import { spotifyTokenRefresher } from "./spotify-token-refresher.ts";
import { getSpotifyToken } from "./get-spotify-token.ts";

type SetupSupabaseClientArgs = {
  accessToken: string;
  refreshToken: string;
  supabaseClient: SupabaseClient<Database, SchemaName, Database[SchemaName]>;
  userId: string;
};

export const setupSpotifyClient = ({
  accessToken,
  refreshToken,
  supabaseClient,
  userId,
}: SetupSupabaseClientArgs) => {
  const spotifyClientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  if (!spotifyClientId)
    throw new HTTPException(500, {
      message: "No Spotify client ID secret found.",
    });
  const spotifyClient = new SpotifyClient(accessToken, {
    refresher: async () => {
      const { access } = await spotifyTokenRefresher({
        refreshToken,
        supabaseClient,
        userId,
      });
      return access;
    },
    waitForRateLimit: true,
  });

  return { spotifyClient };
};

export const setupSpotifyClientWithoutTokens = async ({
  supabaseClient,
  userId,
}: Omit<SetupSupabaseClientArgs, "accessToken" | "refreshToken">) => {
  const { refresh: refreshToken, access: accessToken } = await getSpotifyToken({
    supabaseClient,
    userId,
  });

  const res = setupSpotifyClient({
    accessToken,
    refreshToken,
    supabaseClient,
    userId,
  });

  return res.spotifyClient;
};
