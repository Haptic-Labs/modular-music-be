import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.gen.ts";
import { getPlaylistData } from "@shared/spotify-data-fetchers/get-playlist-data.ts";
import { getAlbumData } from "@shared/spotify-data-fetchers/get-album-data.ts";
import { getArtistData } from "@shared/spotify-data-fetchers/get-artist-data.ts";
import { getUserTracks } from "@shared/spotify-data-fetchers/get-user-tracks.ts";
import { getRecentlyListenedData } from "@shared/spotify-data-fetchers/get-recently-listened-data.ts";

type BaseSource = Pick<
  Database["public"]["Tables"]["module_sources"]["Row"],
  "spotify_id" | "type" | "id"
>;

type GetAllTrackIdsArgs<T extends BaseSource> = {
  sources: T[];
  supabaseClient: SupabaseClient<
    Database,
    "spotify_cache" | "public" | "spotify_auth"
  >;
  userId: string;
  checkIfSaved?: boolean;
};

export const getAllTrackIds = async <T extends BaseSource>({
  sources,
  supabaseClient,
  userId,
  checkIfSaved,
}: GetAllTrackIdsArgs<T>): Promise<{
  allTrackIds: Set<string>;
  likedSongsTrackIds: Set<string>;
}> => {
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
  const trackIdsFromLikedSongs = new Set<string>();
  // TODO: look into only 50 coming back
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
            case "LIKED_SONGS": {
              const userTrackIds = (
                await getUserTracks({
                  spotifyId: id,
                  supabaseClient,
                  userId,
                  checkIfSaved,
                })
              ).data.map((track) => track.track_id);
              newTrackIds.push(...userTrackIds);
              newTrackIds.forEach((trackId) =>
                trackIdsFromLikedSongs.add(trackId),
              );
              break;
            }
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

  return {
    allTrackIds: allSourceTrackIds,
    likedSongsTrackIds: trackIdsFromLikedSongs,
  };
};
