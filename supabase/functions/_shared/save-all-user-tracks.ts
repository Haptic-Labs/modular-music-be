import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.gen.ts";
import {
  SPOTIFY_GET_TRACKS_LIMIT,
  type SchemaName,
} from "@shared/constants.ts";
import { type SpotifyClient, getSavedTracks } from "@soundify/web-api";
import { HTTPException } from "@hono/http-exception";

type SaveAllUserTracksArgs = {
  userId: string;
  supabaseClient: SupabaseClient<Database, SchemaName, Database[SchemaName]>;
  spotifyClient: SpotifyClient;
};

export const saveAllUserTracks = async ({
  userId,
  supabaseClient,
  spotifyClient,
}: SaveAllUserTracksArgs) => {
  const { data: completionStatus } = await supabaseClient
    .schema("spotify_cache")
    .from("user_tracks_completion")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: newestSavedTrack } = await supabaseClient
    .schema("spotify_cache")
    .from("user_tracks")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log("Fetching new user tracks:", {
    userId,
    newestSavedTrack,
    completionStatus,
  });

  let hasAllNewTracks = false;
  let newTracksCount = 0;
  while (!hasAllNewTracks) {
    const page = await getSavedTracks(spotifyClient, {
      offset: newTracksCount,
      limit: SPOTIFY_GET_TRACKS_LIMIT,
    });

    console.log("Fetched page of user tracks from Spotify:", {
      userId,
      offset: newTracksCount,
      count: page.items.length,
    });

    hasAllNewTracks = newestSavedTrack
      ? page.items.some(
          ({ added_at }) =>
            new Date(added_at).getTime() <=
            new Date(newestSavedTrack.added_at).getTime(),
        )
      : page.next === null || page.items.length < SPOTIFY_GET_TRACKS_LIMIT;
    const tracksToSave =
      hasAllNewTracks && newestSavedTrack
        ? page.items.filter(
            ({ added_at }) =>
              new Date(added_at).getTime() >
              new Date(newestSavedTrack.added_at).getTime(),
          )
        : page.items;

    const { error } = tracksToSave.length
      ? await supabaseClient
          .schema("spotify_cache")
          .from("user_tracks")
          .insert(
            tracksToSave.map(({ track, added_at }) => ({
              user_id: userId,
              added_at,
              track_id: track.id,
              metadata: track as unknown as Json,
            })),
          )
      : { error: null };

    if (error) {
      const message =
        "Error saving newer user tracks: " + JSON.stringify(error);
      console.error(message);
      throw new HTTPException(500, {
        message,
      });
    }
    if (tracksToSave.length)
      console.log("Saved new user tracks:", {
        userId,
        offset: newTracksCount,
        count: tracksToSave.length,
      });

    if (hasAllNewTracks && !newestSavedTrack) {
      const timestamp = new Date().toISOString();
      await supabaseClient
        .schema("spotify_cache")
        .from("user_tracks_completion")
        .upsert({
          user_id: userId,
          updated_at: timestamp,
          comleted_at: timestamp,
        });
      console.log("Updated user tracks completion status:", {
        userId,
        updated_at: timestamp,
        completed_at: timestamp,
      });
    }

    newTracksCount += page.items.length;
  }

  let hasAllOldTracks = completionStatus && !!completionStatus.completed_at;
  const { count, error } = await supabaseClient
    .schema("spotify_cache")
    .from("user_tracks")
    .select("*", { count: "exact" })
    .eq("user_id", userId);
  if (count === null || error) {
    const message = "Error counting user tracks: " + JSON.stringify(error);
    console.error(message);
    throw new HTTPException(500, {
      message,
    });
  }
  console.log("Fetching older user tracks:", {
    userId,
    countOfSavedTracks: count,
  });
  let olderTrackOffset = count;
  while (!hasAllOldTracks) {
    const olderTracksPage = await getSavedTracks(spotifyClient, {
      offset: olderTrackOffset,
      limit: SPOTIFY_GET_TRACKS_LIMIT,
    });
    console.log("Fetched page of older user tracks from Spotify:", {
      userId,
      offset: olderTrackOffset,
      count: olderTracksPage.items.length,
    });

    const isLastPage =
      olderTracksPage.next === null ||
      olderTracksPage.items.length < SPOTIFY_GET_TRACKS_LIMIT;

    const { error } = await supabaseClient
      .schema("spotify_cache")
      .from("user_tracks")
      .insert(
        olderTracksPage.items.map(({ track, added_at }) => ({
          user_id: userId,
          added_at,
          track_id: track.id,
          metadata: track as unknown as Json,
        })),
      );
    if (error) {
      const message =
        "Error saving older user tracks: " + JSON.stringify(error);
      console.error(message);
      throw new HTTPException(500, {
        message,
      });
    }
    const timestamp = new Date().toISOString();
    if (isLastPage) {
      await supabaseClient
        .schema("spotify_cache")
        .from("user_tracks_completion")
        .upsert({
          user_id: userId,
          updated_at: timestamp,
          completed_at: timestamp,
        });
      console.log("Updated user tracks completion status:", {
        userId,
        updated_at: timestamp,
        completed_at: timestamp,
      });
    }
    hasAllOldTracks = isLastPage;
    olderTrackOffset += olderTracksPage.items.length;
  }
  return;
};
