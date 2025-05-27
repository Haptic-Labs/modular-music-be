import { getSpotifyToken } from "../../_shared/get-spotify-token.ts";
import { validateAuth } from "./../../_shared/validate-auth.ts";
import { HonoFn } from "../../_shared/types.ts";
import { setupSupabase } from "../../_shared/setup-supabase.ts";

export const GetUserToken: HonoFn<"GetUserToken"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  const result = await getSpotifyToken({ supabaseClient, userId });

  return ctx.json(result);
};
