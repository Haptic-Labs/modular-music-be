export const SCHEMA_NAMES = [
  "public",
  "spotify_auth",
  "spotify_cache",
] as const;
export type SchemaName = (typeof SCHEMA_NAMES)[number];

export const SUPABASE_MAX_ROWS = 1000;
export const SPOTIFY_TRACK_CHECK_LIMIT = 50;
export const SPOTIFY_GET_TRACKS_LIMIT = 50;
