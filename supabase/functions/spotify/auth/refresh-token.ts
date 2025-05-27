import { spotifyTokenRefresher } from "./../../_shared/spotify-token-refresher.ts";
import { Schema } from "../../_shared/schema.ts";
import { HTTPException } from "@hono/http-exception";
import { HonoFn } from "../../_shared/types.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { setupSupabase } from "../../_shared/setup-supabase.ts";

export const RefreshToken: HonoFn<"RefreshToken"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  let providedRefreshToken: string | undefined = undefined;
  try {
    const { refreshToken } =
      await ctx.req.json<Schema["RefreshToken"]["request"]>();
    if (refreshToken) providedRefreshToken = refreshToken;
  } catch {
    console.info("No provided refresh token, looking it up...");
  }
  const savedTokenRow = providedRefreshToken
    ? { data: { refresh: providedRefreshToken } }
    : await supabaseClient
        .schema("spotify_auth")
        .from("provider_session_data")
        .select("refresh")
        .eq("user_id", userId)
        .maybeSingle();
  if (!savedTokenRow.data?.refresh) {
    const message = "No refresh token provided or found in database.";
    console.error(message);
    throw new HTTPException(500, { message });
  }

  const refreshToken = savedTokenRow.data.refresh;
  const newToken = await spotifyTokenRefresher({
    refreshToken,
    supabaseClient,
    userId,
  });

  return ctx.json(newToken);
};
