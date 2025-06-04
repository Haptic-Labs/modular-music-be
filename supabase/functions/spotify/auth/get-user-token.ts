import { getSpotifyToken } from "@/shared/get-spotify-token.ts";
import { validateAuth } from "@/shared/validate-auth.ts";
import { HonoFn } from "@/shared/types.ts";
import { setupSupabase } from "@/shared/setup-supabase.ts";

export const GetUserToken: HonoFn<"GetUserToken"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  const result = await getSpotifyToken({ supabaseClient, userId });

  return ctx.json(result);
};
