import { getUserLatestRecentlyListened } from "@shared/get-user-latest-recently-listened.ts";
import { setupSpotifyClient } from "@shared/setup-spotify-client.ts";
import { setupSupabase } from "@shared/setup-supabase.ts";
import { validateAuth } from "@shared/validate-auth.ts";
import { HonoFn } from "@shared/types.ts";
import { getSpotifyToken } from "@shared/get-spotify-token.ts";
import { Schema } from "@shared/schema.ts";
import { HTTPException } from "@hono/http-exception";

export const GetUserRecentlyListened: HonoFn<
  "GetUserRecentlyListened"
> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  const query = ctx.req.query();
  const { limit, after }: Schema["GetUserRecentlyListened"]["request"] = {
    limit: query.limit ? Number(query.limit) : undefined,
    after: query.after ? String(query.after) : undefined,
  };

  const afterTimestamp = after ? new Date(after).toISOString() : undefined;

  const { refresh: refreshToken, access: accessToken } = await getSpotifyToken({
    supabaseClient,
    userId,
  });
  const { spotifyClient } = setupSpotifyClient({
    supabaseClient,
    accessToken,
    refreshToken,
    userId,
  });

  const newRows = await getUserLatestRecentlyListened({
    supabaseClient,
    spotifyClient,
    userId,
  });
  let hasAllRequestedRows = false;
  let resultRows = [...newRows];

  if (newRows.length) {
    await supabaseClient
      .schema("spotify_cache")
      .from("recently_listened")
      .insert(newRows)
      .select("*");

    if (limit && resultRows.length > limit) {
      resultRows = resultRows.slice(0, limit);
      hasAllRequestedRows = true;
    }

    if (
      afterTimestamp &&
      resultRows[resultRows.length - 1].played_at < afterTimestamp
    ) {
      const firstDisallowedIndex = resultRows.findIndex(
        (item) => item.played_at < afterTimestamp,
      );
      resultRows = resultRows.slice(0, firstDisallowedIndex);
      hasAllRequestedRows = true;
    }

    if (hasAllRequestedRows) {
      return ctx.json(resultRows, 201);
    }
  }

  const additionalRows = await supabaseClient
    .schema("spotify_cache")
    .from("recently_listened")
    .select("*")
    .eq("user_id", userId)
    .filter("played_at", "gt", after || "0")
    .limit(limit ? limit - resultRows.length : Infinity);

  if (additionalRows.error) {
    const message = `Error fetching saved user recently listened tracks for user ${userId}`;
    console.error(
      message + "\n" + JSON.stringify(additionalRows.error, null, 2),
    );
    throw new HTTPException(500, {
      message,
    });
  }

  return ctx.json(
    [...resultRows, ...additionalRows.data],
    newRows.length ? 201 : 200,
  );
};
