import type { Database } from "./database.gen.ts";

export enum Routes {
  GetPlaylist = "/spotify/playlists/:playlistId",
  RefreshToken = "/spotify/auth/refresh-token/:userId",
  GetUserToken = "/spotify/auth/token/:userId",
  GetUserTracks = "/spotify/tracks/:userId",
  GetAlbumTracks = "/spotify/albums/:albumId/tracks",
  GetArtistTracks = "/spotify/artists/:artistId/tracks",
  SaveUserRecentlyListened = "/spotify/tracks/recently-listened/:userId",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  GetUserRecentlyListened = "/spotify/tracks/recently-listened/:userId",
  RunModule = "modules/:moduleId/run",
  ScheduleModule = "modules/:moduleId/schedule",
}

type GetArtistTracksResponse = {
  artist_id: string;
  albums: { album_id: string; track_ids: string[] }[];
};

export type Schema = {
  GetPlaylist: {
    path: Routes.GetPlaylist;
    method: "GET";
    request: Record<string, never>;
    response: Database["spotify_cache"]["Tables"]["playlists"]["Row"];
  };
  RefreshToken: {
    path: Routes.RefreshToken;
    method: "POST";
    request: {
      refreshToken?: string;
    };
    response: Database["spotify_auth"]["Tables"]["provider_session_data"]["Row"];
  };
  GetUserToken: {
    path: Routes.GetUserTracks;
    method: "GET";
    request: {
      refreshToken?: string;
    };
    response: Database["spotify_auth"]["Tables"]["provider_session_data"]["Row"];
  };
  GetUserTracks: {
    path: Routes.GetUserTracks;
    method: "GET";
    request: {
      limit?: number | "all";
      orderBy?: "latest-first" | "oldest-first" | "random";
      idsToOmit?: string[];
      // If a limit is provided, the check will happen, otherwise, it will only be checked if forceCheckIfSaved is true
      forceCheckIfSaved?: boolean;
    };
    response: Database["spotify_cache"]["Tables"]["user_tracks"]["Row"][];
  };
  GetAlbumTracks: {
    path: Routes.GetAlbumTracks;
    method: "GET";
    request: Record<string, never>;
    response: Database["spotify_cache"]["Tables"]["albums"]["Row"];
  };
  GetArtistTracks: {
    path: Routes.GetArtistTracks;
    method: "GET";
    request: Record<string, never>;
    response: GetArtistTracksResponse;
  };
  SaveUserRecentlyListened: {
    path: Routes.SaveUserRecentlyListened;
    method: "POST";
    request: Record<string, never>;
    response: Record<string, never>;
  };
  GetUserRecentlyListened: {
    path: Routes.GetUserRecentlyListened;
    method: "GET";
    request: {
      after?: string;
      limit?: number;
    };
    response: Database["spotify_cache"]["Tables"]["recently_listened"]["Row"][];
  };
  RunModule: {
    path: Routes.RunModule;
    method: "POST";
    request: {
      userId?: string;
    };
    response: Record<string, never>;
  };
  ScheduleModule: {
    path: Routes.ScheduleModule;
    method: "POST";
    request: {
      next_run?: Database["public"]["Tables"]["modules"]["Row"]["next_run"];
      schedule_config?: Database["public"]["Tables"]["modules"]["Row"]["schedule_config"];
    };
    response: Record<string, never>;
  };
};
