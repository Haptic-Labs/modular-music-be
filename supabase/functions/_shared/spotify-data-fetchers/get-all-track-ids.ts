import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../database.gen.ts";
import { getPlaylistData } from "./get-playlist-data.ts";
import { getAlbumData } from "./get-album-data.ts";
import { getArtistData } from "./get-artist-data.ts";
import { getUserTracks } from "./get-user-tracks.ts";
import { getRecentlyListenedData } from "./get-recently-listened-data.ts";

type GetAllTrackIdsArgs = {
  sources: Database["public"]["Tables"]["module_sources"]["Row"][];
  supabaseClient: SupabaseClient<
    Database,
    "spotify_cache" | "public" | "spotify_auth"
  >;
  userId: string;
};

export const getAllTrackIds = async ({
  sources,
  supabaseClient,
  userId,
}: GetAllTrackIdsArgs): Promise<string[]> => {
  const sourcesWithIds = sources.reduce<
    Record<Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"], string[]>
  >(
    (acc, source) => {
      if (source.spotify_id === null) {
        if (source.type === "LIKED_SONGS") {
          acc[source.type] = [userId];
        }
        if (source.type === "RECENTLY_PLAYED") {
          acc[source.type] = [...acc[source.type], source.id];
        }
        return acc;
      }
      const currentTypeList = acc[source.type] ?? [];
      acc[source.type] = [...currentTypeList, source.spotify_id];
      return acc;
    },
    {
      LIKED_SONGS: [],
      RECENTLY_PLAYED: [],
      TRACK: [],
      ARTIST: [],
      ALBUM: [],
      PLAYLIST: [],
    },
  );

  const allSourceTrackIds = new Set<string>();
  await Promise.allSettled(
    Object.entries(sourcesWithIds).map(async ([typeStr, sourceIds]) => {
      const type =
        typeStr as Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"];
      await Promise.allSettled(
        sourceIds.map(async (id) => {
          const newTrackIds: string[] = [];
          switch (type) {
            case "PLAYLIST":
              newTrackIds.push(
                ...(
                  await getPlaylistData({
                    spotifyId: id,
                    userId,
                    supabaseClient,
                  })
                ).data.track_ids,
              );
              break;
            case "TRACK":
              newTrackIds.push(id);
              break;
            case "ALBUM":
              newTrackIds.push(
                ...(
                  await getAlbumData({
                    spotifyId: id,
                    userId,
                    supabaseClient,
                  })
                ).data.track_ids,
              );
              break;
            case "ARTIST":
              newTrackIds.push(
                ...(
                  await getArtistData({
                    spotifyId: id,
                    userId,
                    supabaseClient,
                  })
                ).data.albums.flatMap((album) => album.track_ids),
              );
              break;
            case "LIKED_SONGS":
              newTrackIds.push(
                ...(
                  await getUserTracks({
                    spotifyId: id,
                    supabaseClient,
                    userId,
                  })
                ).data.map((track) => track.track_id),
              );
              break;
            case "RECENTLY_PLAYED":
              newTrackIds.push(
                ...(
                  await getRecentlyListenedData({
                    sourceId: id,
                    supabaseClient,
                    userId,
                  })
                ).data.map((track) => track.track_id),
              );
              break;
          }
          newTrackIds.forEach((trackId) => allSourceTrackIds.add(trackId));
        }),
      );
    }),
  );

  return Array.from(allSourceTrackIds);
};
