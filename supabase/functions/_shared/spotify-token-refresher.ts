import { HTTPException } from "@hono/http-exception";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.gen.ts";
import type { SchemaName } from "./constants.ts";

export const spotifyTokenRefresher = async ({
  refreshToken,
  supabaseClient,
  userId,
}: {
  refreshToken: string;
  supabaseClient: SupabaseClient<Database, SchemaName>;
  userId: string;
}): Promise<
  Database["spotify_auth"]["Tables"]["provider_session_data"]["Row"]
> => {
  const spotifyClientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!spotifyClientId) {
    const message = "No spotify client id found in environment.";
    console.error(message);
    throw new HTTPException(500, {
      message,
    });
  }
  if (!spotifyClientSecret) {
    const message = "No spotify client secret found in environment.";
    console.error(message);
    throw new HTTPException(500, {
      message,
    });
  }

  const body = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + btoa(spotifyClientId + ":" + spotifyClientSecret),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  }).catch((err) => {
    console.error(err);
    throw new HTTPException(500, {
      message: "Error refreshing Spotify token",
    });
  });

  const response = await body.json();
  const access = response.accessToken || response.access_token;
  const refresh =
    response.refreshToken || response.refresh_token || refreshToken;
  const expiresIn = (response.expiresIn || response.expires_in || 3600) * 1000;

  if (!access) {
    console.warn(
      "No access token received from Spotify.\nSpotify refresh response:",
      { response },
    );
    throw new HTTPException(500, {
      message: "No access token received from Spotify",
    });
  }

  const newExpiration = new Date(
    new Date().getTime() + expiresIn,
  ).toISOString();
  const { data } = await supabaseClient
    .schema("spotify_auth")
    .rpc("UpsertProviderData", {
      p_user_id: userId,
      p_refresh: refresh,
      p_access: access,
      p_expires_at: newExpiration,
    });

  if (data) {
    return data;
  }

  return {
    user_id: userId,
    access,
    refresh,
    expires_at: newExpiration,
  };
};
