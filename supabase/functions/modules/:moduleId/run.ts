import { HonoFn } from "../../_shared/types.ts";
import {
  setupSupabaseWithUser,
  setupSupabaseWithServiceRole,
} from "../../_shared/setup-supabase.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { getPlaylistData } from "../../_shared/spotify-data-fetchers/get-playlist-data.ts";
import { getAlbumData } from "../../_shared/spotify-data-fetchers/get-album-data.ts";
import { HTTPException } from "@hono/hono/http-exception";
import { Database } from "../../_shared/database.gen.ts";

type StatusCode = ConstructorParameters<typeof HTTPException>[0];

export const RunModule: HonoFn<"RunModule"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { user } = await setupSupabaseWithUser({ authHeader });
  const { serviceRoleSupabaseClient } = setupSupabaseWithServiceRole();
  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  const { data, error } = await serviceRoleSupabaseClient
    .schema("public")
    .rpc("GetModuleRunData", { moduleId, callerUserId: user.id })
    .single();

  if (error) {
    const errorCode = parseInt(error.code, 10);

    // Validate the errorCode to ensure it's a valid HTTP status code
    const httpStatus = errorCode >= 100 && errorCode < 600 ? errorCode : 500;

    throw new HTTPException(httpStatus as StatusCode, {
      message: error.message,
    });
  }

  let shouldFetchLikedTracks = false;
  let recentlyListenedSourceId: string | undefined = undefined;
  const sourcesWithSpotifyIds = data.moduleSources.reduce<
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

  // TODO: abstract this logic into a shared function
  // TODO: add better error handling that won't break everything if one fetch fails
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
                    userId: user.id,
                    supabaseClient: serviceRoleSupabaseClient,
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
                    userId: user.id,
                    supabaseClient: serviceRoleSupabaseClient,
                  })
                ).data.track_ids,
              );
              break;
            case "ARTIST":
              // TODO: implement (need to implement shared getArtistData)
              break;
            default:
              return;
          }
        }),
      );
    }),
  );

  // TODO: implement actions and output
};
