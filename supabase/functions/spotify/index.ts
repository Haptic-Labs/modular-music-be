import "@supabase/edge-runtime";
import * as Sentry from "@sentry";
import { Hono } from "@hono/hono";
import { HONO_CORS } from "@shared/cors.ts";
import { Routes } from "@shared/schema.ts";
import { GetPlaylist } from "./playlists/get-playlist.ts";
import { RefreshToken } from "./auth/refresh-token.ts";
import { GetUserTracks } from "./tracks/get-user-tracks.ts";
import { GetUserToken } from "./auth/get-user-token.ts";
import { GetAlbumTracks } from "./albums/get-album-tracks.ts";
import { GetArtistTracks } from "./artists/get-artist-tracks.ts";
import { SaveUserRecentlyListened } from "./tracks/save-user-recently-listened.ts";

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  defaultIntegrations: false,
  tracesSampleRate: 1.0,
});
Sentry.setTag("region", Deno.env.get("SB_REGION"));
Sentry.setTag("execution_id", Deno.env.get("SB_EXECUTION_ID"));

const server = new Hono();

server.use("*", HONO_CORS);

server.get(Routes.GetPlaylist, GetPlaylist);
server.post(Routes.RefreshToken, RefreshToken);
server.get(Routes.GetUserToken, GetUserToken);
server.get(Routes.GetUserTracks, GetUserTracks);
server.get(Routes.GetAlbumTracks, GetAlbumTracks);
server.get(Routes.GetArtistTracks, GetArtistTracks);
server.post(Routes.SaveUserRecentlyListened, SaveUserRecentlyListened);

Deno.serve((...args) => {
  try {
    return server.fetch(...args);
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/spotify' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
