import { getUserLatestRecentlyListened } from "./../../_shared/get-user-latest-recently-listened.ts";
import { setupSupabase } from "./../../_shared/setup-supabase.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { HonoFn } from "../../_shared/types.ts";
import { getSpotifyToken } from "../../_shared/get-spotify-token.ts";
import { setupSpotifyClient } from "../../_shared/setup-spotify-client.ts";
import { HTTPException } from "@hono/http-exception";
import { chunkArray } from "../../_shared/chunk-array.ts";

const GROUP_LENGTH = 20;

export const SaveUserRecentlyListened: HonoFn<
  "SaveUserRecentlyListened"
> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const userId = ctx.req.param("userId");
  const userGroups: string[][] = [];

  const getAllUsers = userId === "all";
  if (getAllUsers) {
    // We can safely just fetch all users, because any non service_role user will only have access to their user's row due to RLS
    const allUsers = await supabaseClient
      .schema("spotify_auth")
      .from("provider_session_data")
      .select("user_id");

    if (allUsers.error) {
      const message = `Error fetching all users`;
      console.error(message);
      throw new HTTPException(500, {
        message,
      });
    }
    const chunks = chunkArray(
      allUsers.data.map(({ user_id }) => user_id),
      GROUP_LENGTH,
    );
    userGroups.push(...chunks);
  } else {
    userGroups.push([userId]);
  }

  let fetchedNewRows = false;
  const results: {
    userIdsWithErrors: string[];
    userIdsWithSuccesses: string[];
  } = {
    userIdsWithErrors: [],
    userIdsWithSuccesses: [],
  };

  await Promise.allSettled(
    userGroups.map((userIds) =>
      Promise.allSettled(
        userIds.map(async (userId) => {
          const { refresh: refreshToken, access: accessToken } =
            await getSpotifyToken({
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

          if (!fetchedNewRows && newRows.length) fetchedNewRows = true;

          try {
            await supabaseClient
              .schema("spotify_cache")
              .from("recently_listened")
              .insert(newRows)
              .throwOnError();
            results.userIdsWithSuccesses.push(userId);
          } catch (error) {
            const message = `Error saving new recently listened songs for user ${userId}`;
            console.error(message + "\n" + JSON.stringify(error, null, 2));
            results.userIdsWithSuccesses.push(userId);
          }
        }),
      ),
    ),
  );

  const httpCode =
    results.userIdsWithErrors.length && results.userIdsWithSuccesses.length
      ? 207
      : results.userIdsWithSuccesses.length
        ? fetchedNewRows
          ? 201
          : 200
        : results.userIdsWithErrors.length
          ? 500
          : 200;

  console.info(
    "Successfully fetched recently listened tracks for users:\n" +
      JSON.stringify(userGroups.flat(), null, 2) +
      "\nWith results:\n" +
      JSON.stringify(results, null, 2),
  );

  return ctx.json(
    getAllUsers
      ? {
          ...results,
        }
      : {},
    httpCode,
  );
};
