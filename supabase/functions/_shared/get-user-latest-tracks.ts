import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.gen.ts";
import type { SchemaName } from "./constants.ts";
import { type SpotifyClient, getSavedTracks } from "@soundify/web-api";
import { PageIterator } from "@soundify/pagination";

type GetUserLatestTracksArgs = {
  userId: string;
  supabaseClient: SupabaseClient<Database, SchemaName, Database[SchemaName]>;
  spotifyClient: SpotifyClient;
  latestTrack?: {
    id: string;
    added_at: string;
  };
};

export const getUserLatestTracks = async ({
  userId,
  supabaseClient,
  spotifyClient,
  latestTrack,
}: GetUserLatestTracksArgs) => {
  const latestAddedAt =
    latestTrack?.added_at ||
    (
      await supabaseClient
        .schema("spotify_cache")
        .from("user_tracks")
        .select("added_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data?.added_at;

  const newTrackRows: Database["spotify_cache"]["Tables"]["user_tracks"]["Insert"][] =
    [];
  const savedTrackRows: Database["spotify_cache"]["Tables"]["user_tracks"]["Row"][] =
    [];

  if (!latestAddedAt) {
    const iterator = new PageIterator(async (offset) => {
      const page = await getSavedTracks(spotifyClient, { offset, limit: 50 });

      if (page.items.length) {
        const newItemsRes = await supabaseClient
          .schema("spotify_cache")
          .from("user_tracks")
          .insert(
            page.items.map(({ track, added_at }) => ({
              user_id: userId,
              added_at,
              track_id: track.id,
              metadata: JSON.stringify(track),
            })),
          )
          .select("*");

        savedTrackRows.push(...(newItemsRes.data ?? []));
      }

      return page;
    });

    // TODO: handle fetching older saved tracks if this fails in the middle
    // ideas: store the last fetched offset or "has oldest track" in a table
    const newTracks = await iterator.collect();
    const rowsToAdd = newTracks.map<(typeof newTrackRows)[number]>(
      ({ track, added_at }) => ({
        user_id: userId,
        added_at,
        track_id: track.id,
        metadata: JSON.stringify(track),
      }),
    );
    newTrackRows.push(...rowsToAdd);
  } else {
    const { items: fetchedTracks } = await getSavedTracks(spotifyClient, {
      offset: 0,
      limit: 50,
    });

    let needsNextPage = !fetchedTracks.some(
      ({ added_at }) => latestAddedAt <= added_at,
    );

    while (needsNextPage) {
      const nextPage = await getSavedTracks(spotifyClient, {
        offset: fetchedTracks.length,
        limit: 50,
      });
      const unsavedTracks = nextPage.items.filter(
        ({ added_at }) => latestAddedAt <= added_at,
      );
      if (unsavedTracks.length !== nextPage.items.length) needsNextPage = false;
      fetchedTracks.push(...unsavedTracks);
    }

    const rowsToAdd = fetchedTracks.map<(typeof newTrackRows)[number]>(
      ({ track, added_at }) => ({
        user_id: userId,
        added_at,
        track_id: track.id,
        metadata: JSON.stringify(track),
      }),
    );
    newTrackRows.push(...rowsToAdd);
  }

  return savedTrackRows;
};
