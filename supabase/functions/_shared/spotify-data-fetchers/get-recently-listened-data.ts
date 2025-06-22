import { HTTPException } from "@hono/http-exception";
import type { Database } from "../database.gen.ts";
import { setupSpotifyClientWithoutTokens } from "@shared/setup-spotify-client.ts";
import type { SpotifyDataFetcherArgs } from "../types.ts";
import { getUserLatestRecentlyListened } from "@shared/get-user-latest-recently-listened.ts";
import { calculateNewTimestamp } from "@shared/calculate-new-timestamp.ts";

const filterRowsToLimit = (
  rows: Database["spotify_cache"]["Tables"]["recently_listened"]["Row"][],
  limit: Date,
): {
  rows: Database["spotify_cache"]["Tables"]["recently_listened"]["Row"][];
  reachedLimit: boolean;
} => {
  const filteredRows = rows.filter(
    (row) => new Date(row.played_at).toISOString() >= limit.toISOString(),
  );

  return {
    rows: filteredRows,
    reachedLimit: filteredRows.length < rows.length,
  };
};

type RecentlyListenedDataArgs = Omit<
  SpotifyDataFetcherArgs,
  "spotifyId" | "userId"
> & {
  sourceId: string;
  userId: string; // Make userId required
};

type RecentlyListenedQueryResult = {
  data: Database["spotify_cache"]["Tables"]["recently_listened"]["Row"][];
  config: Database["public"]["Tables"]["recently_played_source_configs"]["Row"];
};

export const getRecentlyListenedData = async ({
  sourceId,
  supabaseClient,
  userId,
  ...rest
}: RecentlyListenedDataArgs): Promise<RecentlyListenedQueryResult> => {
  if (!rest.spotifyClient && !userId) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  const spotifyClient =
    rest.spotifyClient ??
    (userId
      ? await setupSpotifyClientWithoutTokens({
          supabaseClient,
          userId,
        })
      : undefined);

  if (!spotifyClient) {
    throw new HTTPException(500, { message: "Error creating spotify client" });
  }

  const { data: config, error: configError } = await supabaseClient
    .schema("public")
    .from("recently_played_source_configs")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (!config || configError) {
    throw new HTTPException(422, {
      message:
        configError.message || "Recenly listened source config not found",
    });
  }

  const currentTimestamp = Date.now();

  const newRows = await getUserLatestRecentlyListened({
    supabaseClient,
    spotifyClient,
    userId,
  });

  let hasAllRequestedRows = false;
  const resultRows: Database["spotify_cache"]["Tables"]["recently_listened"]["Row"][] =
    [];

  const limitTimestamp = calculateNewTimestamp(
    new Date(currentTimestamp).toISOString(),
    {
      quantity: config.quantity * -1,
      interval: config.interval,
    },
  );

  if (newRows.length) {
    const { data: insertedRows, error } = await supabaseClient
      .schema("spotify_cache")
      .from("recently_listened")
      .insert(newRows)
      .order("played_at", { ascending: false })
      .select("*");

    if (error) {
      console.error(
        JSON.stringify(
          {
            message: "Error saving newly fetched recently listened songs",
            error,
          },
          null,
          2,
        ),
      );
    }

    if (insertedRows && insertedRows.length) {
      const { rows: resultRows, reachedLimit } = filterRowsToLimit(
        insertedRows,
        limitTimestamp,
      );

      resultRows.push(...resultRows);
      hasAllRequestedRows = reachedLimit;
    }
  }

  if (hasAllRequestedRows) {
    return { data: resultRows, config };
  }

  while (!hasAllRequestedRows) {
    const query = supabaseClient
      .schema("spotify_cache")
      .from("recently_listened")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .filter("played_at", "gt", limitTimestamp.toISOString());
    const lastPlayedAt = resultRows.at(-1)?.played_at;
    if (lastPlayedAt) {
      query.filter("played_at", "lt", resultRows.at(-1)?.played_at);
    }
    const {
      data: additionalRows,
      error: additionalRowsError,
      count,
    } = await query;
    if (!additionalRows || additionalRowsError) {
      throw new HTTPException(500, {
        message: "Error fetching additional recently listened tracks",
      });
    }
    const isLastPage = count === additionalRows.length;
    hasAllRequestedRows = isLastPage || additionalRows.length === 0;
    resultRows.push(...additionalRows);
  }

  return {
    data: resultRows,
    config,
  };
};
