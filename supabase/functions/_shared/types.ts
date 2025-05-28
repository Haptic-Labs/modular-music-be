import { BlankEnv, H, HandlerResponse } from "@hono/types";
import { Schema } from "../_shared/schema.ts";
import { SpotifyClient } from "@soundify/web-api";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.gen.ts";

export type HonoFn<R extends keyof Schema> = H<
  BlankEnv,
  Schema[R]["path"],
  {
    in: Schema[R]["request"];
    out: Schema[R]["request"];
    outputFormat: "json";
  },
  HandlerResponse<Schema[R]["response"]>
>;

export type SpotifyDataFetcherArgs =
  | {
      spotifyId: string;
      spotifyClient: SpotifyClient;
      userId?: string | never;
      supabaseClient: SupabaseClient<
        Database,
        "spotify_cache" | "public" | "spotify_auth"
      >;
    }
  | {
      spotifyId: string;
      spotifyClient?: SpotifyClient | never;
      userId: string;
      supabaseClient: SupabaseClient<
        Database,
        "spotify_cache" | "public" | "spotify_auth"
      >;
    };
