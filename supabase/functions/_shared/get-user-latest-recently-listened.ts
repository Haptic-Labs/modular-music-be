import type { SupabaseClient } from "@supabase/supabase-js";
import type { SchemaName } from "./constants.ts";
import type { Database } from "./database.gen.ts";
import { getRecentPlayedTracks, type SpotifyClient } from "@soundify/web-api";
import { HTTPException } from "@hono/http-exception";

type GetUserLatestRecentlyListenedArgs = {
  userId: string;
  supabaseClient: SupabaseClient<Database, SchemaName, Database[SchemaName]>;
  spotifyClient: SpotifyClient;
};

export const getUserLatestRecentlyListened = async ({
  userId,
  supabaseClient,
  spotifyClient,
}: GetUserLatestRecentlyListenedArgs): Promise<
  Database["spotify_cache"]["Tables"]["recently_listened"]["Insert"][]
> => {
  const lastRecentlyListenedRowResponse = await supabaseClient
    .schema("spotify_cache")
    .from("recently_listened")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastRecentlyListenedRowResponse.error) {
    const message = `Error fetching last saved recently listened track for user ${userId}`;
    console.error(
      message +
        "\n" +
        JSON.stringify(lastRecentlyListenedRowResponse.error, null, 2),
    );
    throw new HTTPException(500, {
      message,
    });
  }

  const lastPlayedAt = lastRecentlyListenedRowResponse.data?.played_at;
  // undefined here means to omit it from the request
  const afterTimestampMS: number | undefined = lastPlayedAt
    ? new Date(lastPlayedAt).getTime()
    : undefined;

  const newRecentlyListened = await getRecentPlayedTracks(spotifyClient, {
    limit: 50,
    after: afterTimestampMS,
  });

  if (!newRecentlyListened.items.length) {
    return [];
  }

  const saved_at = new Date().toISOString();
  const newRows = newRecentlyListened.items.map<
    Database["spotify_cache"]["Tables"]["recently_listened"]["Insert"]
  >((item) => ({
    played_at: item.played_at,
    user_id: userId,
    saved_at,
    track_id: item.track.id,
  }));

  return newRows;
};
