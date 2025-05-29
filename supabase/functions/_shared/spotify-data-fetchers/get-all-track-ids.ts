import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../database.gen.ts";
import { getPlaylistData } from "./get-playlist-data.ts";
import { getAlbumData } from "./get-album-data.ts";
import { getArtistData } from "./get-artist-data.ts";
import { getUserTracks } from "./get-user-tracks.ts";

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
  let shouldFetchLikedTracks = false;
  let recentlyListenedSourceId: string | undefined = undefined;
  const sourcesWithSpotifyIds = sources.reduce<
    Partial<
      Record<Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"], string[]>
    >
  >((acc, source) => {
    if (source.spotify_id === null) {
      if (source.type === "LIKED_SONGS") {
        shouldFetchLikedTracks = true;
      }
      if (source.type === "RECENTLY_PLAYED") {
        recentlyListenedSourceId = source.id;
      }
      return acc;
    }
    const currentTypeList = acc[source.type] ?? [];
    acc[source.type] = [...currentTypeList, source.spotify_id];
    return acc;
  }, {});

  const allSourceTrackIds: string[] = [];
  await Promise.allSettled(
    Object.entries(sourcesWithSpotifyIds).map(async ([typeStr, sourceIds]) => {
      const type =
        typeStr as Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"];
      await Promise.allSettled(
        sourceIds.map(async (spotifyId) => {
          switch (type) {
            case "PLAYLIST":
              allSourceTrackIds.push(
                ...(
                  await getPlaylistData({
                    spotifyId,
                    userId,
                    supabaseClient,
                  })
                ).data.track_ids,
              );
              break;
            case "TRACK":
              allSourceTrackIds.push(spotifyId);
              break;
            case "ALBUM":
              allSourceTrackIds.push(
                ...(
                  await getAlbumData({
                    spotifyId,
                    userId,
                    supabaseClient,
                  })
                ).data.track_ids,
              );
              break;
            case "ARTIST":
              allSourceTrackIds.push(
                ...(
                  await getArtistData({
                    spotifyId,
                    userId,
                    supabaseClient,
                  })
                ).data.albums.flatMap((album) => album.track_ids),
              );
              break;
            default:
              return;
          }
        }),
      );
    }),
  );

  if (shouldFetchLikedTracks) {
    const likedTracksRes = await getUserTracks({
      spotifyId: userId,
      supabaseClient,
      userId,
    });
    allSourceTrackIds.push(
      ...likedTracksRes.data.map((track) => track.track_id),
    );
  }

  if (recentlyListenedSourceId) {
    // TODO: Implement fetching recently listened tracks
    // lookup recently listened config
    // fetch recently listened tracks (need to separate out getRecentlyListened from the edge function)
  }

  return allSourceTrackIds;
};
