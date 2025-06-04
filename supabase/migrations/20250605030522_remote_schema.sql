

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "feature_flags";


ALTER SCHEMA "feature_flags" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "spotify_auth";


ALTER SCHEMA "spotify_auth" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "spotify_cache";


ALTER SCHEMA "spotify_cache" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "util";


ALTER SCHEMA "util" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "feature_flags"."FLAG_NAME" AS ENUM (
    'light-mode'
);


ALTER TYPE "feature_flags"."FLAG_NAME" OWNER TO "postgres";


CREATE TYPE "public"."SPOTIFY_SOURCE_TYPE" AS ENUM (
    'PLAYLIST',
    'TRACK',
    'ALBUM',
    'ARTIST',
    'RECENTLY_PLAYED',
    'LIKED_SONGS'
);


ALTER TYPE "public"."SPOTIFY_SOURCE_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."CombineSourceUpsertRequest" AS (
	"id" "uuid",
	"action_id" "uuid",
	"source_type" "public"."SPOTIFY_SOURCE_TYPE",
	"spotify_id" "text",
	"limit" smallint,
	"title" "text",
	"image_url" "text"
);


ALTER TYPE "public"."CombineSourceUpsertRequest" OWNER TO "postgres";


CREATE TYPE "public"."RECENTLY_PLAYED_INTERVAL" AS ENUM (
    'DAYS',
    'WEEKS',
    'MONTHS'
);


ALTER TYPE "public"."RECENTLY_PLAYED_INTERVAL" OWNER TO "postgres";


CREATE TYPE "public"."RecentlyListenedConfig" AS (
	"quantity" smallint,
	"interval" "public"."RECENTLY_PLAYED_INTERVAL"
);


ALTER TYPE "public"."RecentlyListenedConfig" OWNER TO "postgres";


CREATE TYPE "public"."FilterSourceUpsertRequest" AS (
	"id" "uuid",
	"action_id" "uuid",
	"source_type" "public"."SPOTIFY_SOURCE_TYPE",
	"spotify_id" "text",
	"limit" smallint,
	"title" "text",
	"image_url" "text",
	"recently_listened_config" "public"."RecentlyListenedConfig"
);


ALTER TYPE "public"."FilterSourceUpsertRequest" OWNER TO "postgres";


CREATE TYPE "public"."LIMIT_TYPE" AS ENUM (
    'OVERALL',
    'PER_SOURCE'
);


ALTER TYPE "public"."LIMIT_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."MODULE_ACTION_TYPE" AS ENUM (
    'FILTER',
    'SHUFFLE',
    'LIMIT',
    'COMBINE',
    'MODULE'
);


ALTER TYPE "public"."MODULE_ACTION_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."MODULE_OUTPUT_MODE" AS ENUM (
    'REPLACE',
    'APPEND',
    'PREPEND'
);


ALTER TYPE "public"."MODULE_OUTPUT_MODE" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction" AS (
	"id" "uuid",
	"module_id" "uuid",
	"order" smallint,
	"type" "public"."MODULE_ACTION_TYPE",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);


ALTER TYPE "public"."ModuleAction" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."combine_action_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "source_type" "public"."SPOTIFY_SOURCE_TYPE" NOT NULL,
    "spotify_id" "text",
    "limit" smallint,
    "deleted_at" timestamp with time zone,
    "title" "text",
    "image_url" "text"
);


ALTER TABLE "public"."combine_action_sources" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Combine" AS (
	"id" "uuid",
	"module_id" "uuid",
	"order" smallint,
	"type" "public"."MODULE_ACTION_TYPE",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"sources" "public"."combine_action_sources"[]
);


ALTER TYPE "public"."ModuleAction:Combine" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."filter_action_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "source_type" "public"."SPOTIFY_SOURCE_TYPE" NOT NULL,
    "spotify_id" "text",
    "limit" smallint,
    "deleted_at" timestamp with time zone,
    "title" "text",
    "image_url" "text"
);


ALTER TABLE "public"."filter_action_sources" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Filter" AS (
	"id" "uuid",
	"module_id" "uuid",
	"order" smallint,
	"type" "public"."MODULE_ACTION_TYPE",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"sources" "public"."filter_action_sources"[]
);


ALTER TYPE "public"."ModuleAction:Filter" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Limit:Config" AS (
	"id" "uuid",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"limit" smallint,
	"type" "public"."LIMIT_TYPE",
	"deleted_at" timestamp with time zone
);


ALTER TYPE "public"."ModuleAction:Limit:Config" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Limit" AS (
	"id" "uuid",
	"module_id" "uuid",
	"order" smallint,
	"type" "public"."MODULE_ACTION_TYPE",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"config" "public"."ModuleAction:Limit:Config"
);


ALTER TYPE "public"."ModuleAction:Limit" OWNER TO "postgres";


CREATE TYPE "public"."SHUFFLE_TYPE" AS ENUM (
    'RANDOM'
);


ALTER TYPE "public"."SHUFFLE_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Shuffle:Config" AS (
	"id" "uuid",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"shuffle_type" "public"."SHUFFLE_TYPE",
	"deleted_at" timestamp with time zone
);


ALTER TYPE "public"."ModuleAction:Shuffle:Config" OWNER TO "postgres";


CREATE TYPE "public"."ModuleAction:Shuffle" AS (
	"id" "uuid",
	"module_id" "uuid",
	"order" smallint,
	"type" "public"."MODULE_ACTION_TYPE",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"config" "public"."ModuleAction:Shuffle:Config"
);


ALTER TYPE "public"."ModuleAction:Shuffle" OWNER TO "postgres";


CREATE TYPE "public"."ModuleActions" AS (
	"shuffleActions" "public"."ModuleAction:Shuffle"[],
	"filterActions" "public"."ModuleAction:Filter"[],
	"limitActions" "public"."ModuleAction:Limit"[],
	"combineActions" "public"."ModuleAction:Combine"[]
);


ALTER TYPE "public"."ModuleActions" OWNER TO "postgres";


CREATE TYPE "public"."SCHEDULE_INTERVAL" AS ENUM (
    'DAYS',
    'WEEKS',
    'MONTHS',
    'YEARS'
);


ALTER TYPE "public"."SCHEDULE_INTERVAL" OWNER TO "postgres";


CREATE TYPE "public"."ModuleScheduleConfig" AS (
	"interval" "public"."SCHEDULE_INTERVAL",
	"quantity" smallint
);


ALTER TYPE "public"."ModuleScheduleConfig" OWNER TO "postgres";


CREATE TYPE "public"."SPOTIFY_OUTPUT_TYPE" AS ENUM (
    'PLAYLIST'
);


ALTER TYPE "public"."SPOTIFY_OUTPUT_TYPE" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."limit_action_configs" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "limit" smallint NOT NULL,
    "type" "public"."LIMIT_TYPE" DEFAULT 'OVERALL'::"public"."LIMIT_TYPE" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."limit_action_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid" NOT NULL,
    "order" smallint NOT NULL,
    "type" "public"."MODULE_ACTION_TYPE" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."module_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_outputs" (
    "module_id" "uuid" NOT NULL,
    "type" "public"."SPOTIFY_OUTPUT_TYPE" NOT NULL,
    "spotify_id" "text" NOT NULL,
    "limit" integer,
    "mode" "public"."MODULE_OUTPUT_MODE" NOT NULL,
    "de_dupe" boolean NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "image_url" "text",
    "title" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."module_outputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid" NOT NULL,
    "type" "public"."SPOTIFY_SOURCE_TYPE" NOT NULL,
    "spotify_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "limit" integer,
    "image_url" "text",
    "title" "text" NOT NULL
);


ALTER TABLE "public"."module_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "updated_at" timestamp with time zone,
    "is_running" boolean DEFAULT false NOT NULL,
    "next_scheduled_run" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "schedule_config" "public"."ModuleScheduleConfig",
    "previous_run" timestamp with time zone
);


ALTER TABLE "public"."modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recently_played_source_configs" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "quantity" smallint NOT NULL,
    "interval" "public"."RECENTLY_PLAYED_INTERVAL" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."recently_played_source_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shuffle_action_configs" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "shuffle_type" "public"."SHUFFLE_TYPE" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."shuffle_action_configs" OWNER TO "postgres";


CREATE TYPE "public"."ModuleRunData" AS (
	"module" "public"."modules",
	"moduleSources" "public"."module_sources"[],
	"moduleActions" "public"."module_actions"[],
	"moduleOutputs" "public"."module_outputs"[],
	"limitConfigs" "public"."limit_action_configs"[],
	"recentlyPlayedConfigs" "public"."recently_played_source_configs"[],
	"shuffleConfigs" "public"."shuffle_action_configs"[],
	"filterSources" "public"."filter_action_sources"[],
	"combineSources" "public"."combine_action_sources"[]
);


ALTER TYPE "public"."ModuleRunData" OWNER TO "postgres";


CREATE TYPE "public"."RemoveModuleActionResponse" AS (
	"updated_actions" "public"."module_actions"[],
	"module_id" "uuid"
);


ALTER TYPE "public"."RemoveModuleActionResponse" OWNER TO "postgres";


CREATE TYPE "public"."SimpleSource" AS (
	"source_type" "public"."SPOTIFY_SOURCE_TYPE",
	"spotify_id" "text",
	"limit" integer
);


ALTER TYPE "public"."SimpleSource" OWNER TO "postgres";


CREATE TYPE "public"."SpotifySource" AS (
	"spotify_id" "uuid",
	"source_type" "public"."SPOTIFY_SOURCE_TYPE",
	"limit" smallint,
	"title" "text",
	"image_url" "text"
);


ALTER TYPE "public"."SpotifySource" OWNER TO "postgres";


CREATE TYPE "public"."recently_listened_source_with_config" AS (
	"source_id" "uuid",
	"module_id" "uuid",
	"type" "public"."SPOTIFY_SOURCE_TYPE",
	"spotify_id" "text",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"limit" integer,
	"image_url" "text",
	"title" "text",
	"config_id" "uuid",
	"config_created_at" timestamp with time zone,
	"config_updated_at" timestamp with time zone,
	"quantity" smallint,
	"interval" "public"."RECENTLY_PLAYED_INTERVAL"
);


ALTER TYPE "public"."recently_listened_source_with_config" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetCombineAction"("actionId" "uuid") RETURNS "public"."ModuleAction:Combine"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  result public."ModuleAction:Combine";
  sources public.combine_action_sources[];
BEGIN
  IF "actionId" IS NULL THEN
    RAISE EXCEPTION 'Non-nullable field "actionId" cannot be null';
  END IF;

  -- Select the module action into result
  SELECT * INTO result FROM public.module_actions WHERE id = "actionId";

  -- Check if result is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No module action found for actionId: %', "actionId";
  END IF;

  -- Select the sources rows for the combine action into sources array
  SELECT ARRAY(SELECT * FROM public.combine_action_sources WHERE action_id = "actionId") INTO sources;

  result.sources := sources;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."GetCombineAction"("actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetFilterAction"("actionId" "uuid") RETURNS "public"."ModuleAction:Filter"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  result public."ModuleAction:Filter";
  sources public.filter_action_sources[];
BEGIN
  IF "actionId" IS NULL THEN
    RAISE EXCEPTION 'Non-nullable field "actionId" cannot be null';
  END IF;

  -- Select the module action into result
  SELECT * INTO result FROM public.module_actions WHERE id = "actionId";

  -- Check if result is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No module action found for actionId: %', "actionId";
  END IF;

  -- Select the sources rows for the filter action into sources array
  SELECT ARRAY(SELECT * FROM public.filter_action_sources WHERE action_id = "actionId") INTO sources;

  result.sources := sources;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."GetFilterAction"("actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetLimitAction"("actionId" "uuid") RETURNS "public"."ModuleAction:Limit"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  result public."ModuleAction:Limit";
  result_config public."ModuleAction:Limit:Config";
BEGIN
  IF "actionId" IS NULL THEN
    RAISE EXCEPTION 'Non-nullable field "actionId" cannot be empty or null';
  END IF;

  -- Select the module action into result
  SELECT * INTO result FROM public.module_actions WHERE id = "actionId";
  
  -- Check if result is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No module action found for actionId: %', "actionId";
  END IF;

  -- Select the limit action config into result_config
  SELECT * INTO result_config FROM public.limit_action_configs WHERE id = "actionId";

  -- Check if result_config is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No limit action config found for actionId: %', "actionId";
  END IF;

  -- Assign the config values to result.config
  result.config := ROW(result_config.id, result_config.created_at, result_config.updated_at, result_config."limit", result_config.type, result_config.deleted_at);

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."GetLimitAction"("actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetModuleActions"("moduleId" "uuid") RETURNS "public"."ModuleActions"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  actions public.module_actions[];
  current_action public."ModuleAction";
  current_shuffle_config public."ModuleAction:Shuffle:Config";
  current_limit_config public."ModuleAction:Limit:Config";
  current_filter_sources public.filter_action_sources[];
  current_combine_sources public.combine_action_sources[];
  result public."ModuleActions";
BEGIN
  IF "moduleId" IS NULL THEN
    RAISE EXCEPTION 'Non-nullable field "moduleId" cannot be null';
  END IF;
  SELECT ARRAY(SELECT id, module_id, "order", type, created_at, updated_at, deleted_at FROM public.module_actions WHERE module_id = "moduleId") INTO actions;
  FOREACH current_action IN ARRAY actions
  LOOP
    IF current_action.type = 'SHUFFLE'::public."MODULE_ACTION_TYPE" THEN
      SELECT * INTO current_shuffle_config FROM public.shuffle_action_configs WHERE id = current_action.id LIMIT 1;
      -- Check if result_config is found
      IF NOT FOUND THEN
        RAISE EXCEPTION 'No shuffle action config found for actionId: %', current_action.id;
      END IF;
      result."shuffleActions" := array_append(result."shuffleActions", ROW(current_action.id, current_action.module_id, current_action."order", current_action.type, current_action.created_at, current_action.updated_at, current_action.deleted_at, ROW(current_shuffle_config.id, current_shuffle_config.created_at, current_shuffle_config.updated_at, current_shuffle_config.shuffle_type, current_shuffle_config.deleted_at)));
    ELSIF current_action.type = 'LIMIT'::public."MODULE_ACTION_TYPE" THEN
      SELECT * INTO current_limit_config FROM public.limit_action_configs WHERE id = current_action.id LIMIT 1;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'No limit action config found for actionId: %', current_action.id;
      END IF;
      result."limitActions" := array_append(result."limitActions", ROW(current_action.id, current_action.module_id, current_action."order", current_action.type, current_action.created_at, current_action.updated_at, current_action.deleted_at, ROW(current_limit_config.id, current_limit_config.created_at, current_limit_config.updated_at, current_limit_config."limit", current_limit_config.type, current_limit_config.deleted_at)));
    ELSIF current_action.type = 'FILTER'::public."MODULE_ACTION_TYPE" THEN
      SELECT ARRAY(SELECT id, action_id, created_at, updated_at, source_type, spotify_id, "limit", deleted_at, title FROM public.filter_action_sources WHERE action_id = current_action.id) INTO current_filter_sources;
      result."filterActions" := array_append(result."filterActions", ROW(current_action.id, current_action.module_id, current_action."order", current_action.type, current_action.created_at, current_action.updated_at, current_action.deleted_at, current_filter_sources));
    ELSIF current_action.type = 'COMBINE'::public."MODULE_ACTION_TYPE" THEN
      SELECT ARRAY(SELECT id, action_id, created_at, updated_at, source_type, spotify_id, "limit", deleted_at, title FROM public.combine_action_sources WHERE action_id = current_action.id) INTO current_combine_sources;
      result."combineActions" := array_append(result."combineActions", ROW(current_action.id, current_action.module_id, current_action."order", current_action.type, current_action.created_at, current_action.updated_at, current_action.deleted_at, current_combine_sources));
    END IF;
  END LOOP;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."GetModuleActions"("moduleId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetModuleRunData"("moduleId" "uuid", "callerUserId" "uuid") RETURNS "public"."ModuleRunData"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    module public.modules;
    "moduleSources" public.module_sources[];
    "moduleActions" public.module_actions[];
    "moduleOutputs" public.module_outputs[];
    "limitConfigs" public.limit_action_configs[];
    "recentlyPlayedConfigs" public.recently_played_source_configs[];
    "shuffleConfigs" public.shuffle_action_configs[];
    "filterSources" public.filter_action_sources[];
    "combineSources" public.combine_action_sources[];
    result public."ModuleRunData";
BEGIN
    -- Validate moduleId
    IF "moduleId" IS NULL THEN
        RAISE EXCEPTION 'Missing required field: ''moduleId''' USING ERRCODE = '400';
    END IF;

    -- Fetch the module
    SELECT * INTO module FROM public.modules WHERE id = "moduleId" AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Module with provided id does not exist' USING ERRCODE = '422';
    END IF;

    -- Check if the caller's user_id matches the module's user_id
    IF module.user_id <> "callerUserId" THEN
        RAISE EXCEPTION 'Permission denied: You do not have permission to run this module' USING ERRCODE = '403';
    END IF;

    -- Fetch module sources
    SELECT ARRAY(
        SELECT ROW(ms.*)::public.module_sources 
        FROM public.module_sources ms 
        WHERE ms.module_id = "moduleId" AND ms.deleted_at IS NULL
    ) INTO "moduleSources";
    IF array_length("moduleSources", 1) IS NULL THEN
        RAISE EXCEPTION 'Error running module: no sources found' USING ERRCODE = '409';
    END IF;

    -- Fetch module actions
    SELECT ARRAY(
        SELECT ROW(ma.*)
        FROM public.module_actions ma 
        WHERE ma.module_id = "moduleId" AND ma.deleted_at IS NULL
        ORDER BY ma."order"
    ) INTO "moduleActions";
    IF array_length("moduleActions", 1) IS NULL THEN
        RAISE EXCEPTION 'Error running module: no actions found' USING ERRCODE = '409';
    END IF;

    -- Fetch module outputs
    SELECT ARRAY(
        SELECT ROW(mo.*) 
        FROM public.module_outputs mo
        WHERE mo.module_id = "moduleId" AND mo.deleted_at IS NULL
    ) INTO "moduleOutputs";
    IF array_length("moduleOutputs", 1) IS NULL THEN
        RAISE EXCEPTION 'Error running module: no outputs found' USING ERRCODE = '409';
    END IF;

    -- Fetch limit configs from module actions that have sources
    SELECT ARRAY(
        SELECT ROW(lac.*)
        FROM public.limit_action_configs lac
        WHERE id IN (
            SELECT lac.id 
            FROM public.module_actions ma
            WHERE ma.module_id = "moduleId" AND deleted_at IS NULL AND ma.type = 'LIMIT'
        )
    ) INTO "limitConfigs";

    -- Fetch recently_played_source_configs from module sources
    SELECT ARRAY(
        SELECT ROW(rpsc.*)
        FROM public.recently_played_source_configs rpsc 
        WHERE id IN (
            SELECT id
            FROM public.module_sources ms 
            WHERE ms.module_id = "moduleId" AND deleted_at IS NULL
        )
    ) INTO "recentlyPlayedConfigs";

    -- Fetch recently_played_source_configs from module actions that have sources
    -- Combine actions
    SELECT ARRAY(
        SELECT ROW(rpsc.*) 
        FROM public.recently_played_source_configs rpsc 
        WHERE id IN (
            SELECT id
            FROM public.combine_action_sources cas
            WHERE cas.action_id IN (
                SELECT id
                FROM public.module_actions ma
                WHERE ma.module_id = "moduleId" AND deleted_at IS NULL AND ma.type = 'COMBINE'
            ) AND cas.deleted_at IS NULL AND cas.source_type = 'RECENTLY_PLAYED'
        ) AND rpsc.deleted_at IS NULL
    ) INTO "recentlyPlayedConfigs";
    -- Filter actions
    SELECT ARRAY(
        SELECT ROW(rpsc.*)
        FROM public.recently_played_source_configs rpsc
        WHERE id IN (
            SELECT id
            FROM public.filter_action_sources fas
            WHERE fas.action_id IN (
                SELECT id
                FROM public.module_actions ma
                WHERE ma.module_id = "moduleId" AND deleted_at IS NULL AND ma.type = 'FILTER'
            ) AND fas.deleted_at IS NULL AND fas.source_type = 'RECENTLY_PLAYED'
        ) and rpsc.deleted_at IS NULL
    ) INTO "recentlyPlayedConfigs";

    -- Fetch shuffle action configs
    SELECT ARRAY(
        SELECT ROW(sac.*)
        FROM public.shuffle_action_configs sac
        WHERE id IN (
            SELECT id
            FROM public.module_actions ma
            WHERE ma.module_id = "moduleId" AND deleted_at IS NULL AND ma.type = 'SHUFFLE'
        ) AND sac.deleted_at IS NULL
    ) into "shuffleConfigs";

    -- Fetch filter sources
    SELECT ARRAY(
        SELECT ROW(fas.*)
        FROM public.filter_action_sources fas
        WHERE fas.action_id IN (
            SELECT id
            FROM public.module_actions ma
            WHERE ma.module_id = "moduleId" AND ma.deleted_at IS NULL AND ma.type = 'FILTER'
        ) AND fas.deleted_at IS NULL
    ) INTO "filterSources";

    -- Fetch combine sources
    SELECT ARRAY(
        SELECT ROW(cas.*)
        FROM public.combine_action_sources cas
        WHERE cas.action_id IN (
            SELECT id
            FROM public.module_actions ma
            WHERE ma.module_id = "moduleId" AND ma.deleted_at IS NULL AND ma.type = 'COMBINE'
        ) AND cas.deleted_at IS NULL
    ) INTO "combineSources";

    result := ROW(module, "moduleSources", "moduleActions", "moduleOutputs", "limitConfigs", "recentlyPlayedConfigs", "shuffleConfigs", "filterSources", "combineSources")::public."ModuleRunData";

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."GetModuleRunData"("moduleId" "uuid", "callerUserId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."GetShuffleAction"("actionId" "uuid") RETURNS "public"."ModuleAction:Shuffle"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  result public."ModuleAction:Shuffle";
  result_config public."ModuleAction:Shuffle:Config";
BEGIN
  IF "actionId" IS NULL THEN
    RAISE EXCEPTION 'Non-nullable field "actionId" cannot be empty or null';
  END IF;

  SELECT * INTO result FROM public.module_actions WHERE id = "actionId";

  -- Check if result is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No module action found for actionId: %', "actionId";
  END IF;

  -- Select the shuffle action config into result_config
  SELECT * INTO result_config FROM public.shuffle_action_configs where id = "actionId";

  -- Check if result_config is found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No shuffle action config found for actionId: %', "actionId";
  END IF;

  -- Assign the config values to result.config
  result.config := ROW(result_config.id, result_config.created_at, result_config.updated_at, result_config.shuffle_type, result_config.deleted_at);

  RETURN result;

END;
$$;


ALTER FUNCTION "public"."GetShuffleAction"("actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."PersistActionDeletedAt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Filter
    IF NEW.type = 'FILTER' THEN
        UPDATE public.filter_action_sources
        SET deleted_at = NEW.deleted_at
        WHERE action_id = NEW.id;
    END IF;

    -- Shuffle
    IF NEW.type = 'SHUFFLE' THEN
        UPDATE public.shuffle_action_configs
        SET deleted_at = NEW.deleted_at
        WHERE id = NEW.id;
    END IF;

    -- Limit
    IF NEW.type = 'LIMIT' THEN
        UPDATE public.limit_action_configs
        SET deleted_at = NEW.deleted_at
        WHERE id = NEW.id;
    END IF;

    -- Combine
    IF NEW.type = 'COMBINE' THEN
        UPDATE public.combine_action_sources
        SET deleted_at = NEW.deleted_at
        WHERE action_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."PersistActionDeletedAt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."PersistRecentlyListenedDeletedAt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Update the deleted_at value in recently_played_source_configs if it matches the id
    UPDATE public.recently_played_source_configs
    SET deleted_at = NEW.deleted_at
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."PersistRecentlyListenedDeletedAt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."PersistSourceIdsCreation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO util.all_source_ids (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."PersistSourceIdsCreation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."PersistSourceIdsDeletion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  DELETE FROM util.all_source_ids WHERE id=OLD.id;
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."PersistSourceIdsDeletion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."PersistSourceIdsUpdate"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE util.all_source_ids
  SET id = NEW.id
  WHERE id = OLD.id;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."PersistSourceIdsUpdate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."RemoveModuleAction"("actionId" "uuid") RETURNS "public"."RemoveModuleActionResponse"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  "deletedAction" public.module_actions%ROWTYPE;
  "actionToUpdate" public.module_actions%ROWTYPE;
  "updatedAction" public.module_actions%ROWTYPE;
  "updatedActions" public.module_actions[] := ARRAY[]::public.module_actions[]; -- Initialize as an empty array
  response public."RemoveModuleActionResponse"; -- Declare the response variable
BEGIN
  -- Retrieve the action to be deleted
  SELECT * INTO "deletedAction" FROM public.module_actions WHERE id = "actionId";

  IF "deletedAction".deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Action with provided id is already deleted.';
  END IF;

  response.module_id := "deletedAction".module_id;

  -- Set the deleted_at timestamp for the action
  UPDATE public.module_actions
  SET deleted_at = NOW()
  WHERE id = "actionId";

  UPDATE public.module_actions
  SET "order" = "order" - 1
  WHERE id = "actionId" AND "order" > "deletedAction"."order" AND deleted_at IS NULL;

  -- Update the order of other actions in the same module and collect them into an array
  FOR "actionToUpdate" IN
    SELECT * FROM public.module_actions
    WHERE module_id = "deletedAction".module_id
      AND "order" >= "deletedAction"."order"
      AND deleted_at IS NULL
  LOOP
    UPDATE public.module_actions SET "order" = "order" - 1 WHERE id = "actionToUpdate".id RETURNING * INTO "updatedAction";

    "updatedActions" := array_append("updatedActions", "updatedAction");
  END LOOP;

  -- Prepare the response
  response.updated_actions := "updatedActions";

  RETURN response;
END;
$$;


ALTER FUNCTION "public"."RemoveModuleAction"("actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ReorderActions"("action_ids" "uuid"[]) RETURNS "public"."module_actions"[]
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    idx INT;
    temp_idx INT;
    updated_actions public.module_actions[];
BEGIN
    FOR temp_idx IN 1 .. array_length(action_ids, 1) LOOP
        UPDATE public.module_actions
        SET "order" = -1 - temp_idx
        WHERE id = action_ids[temp_idx];
    END LOOP;

    FOR idx IN 1 .. array_length(action_ids, 1) LOOP
        UPDATE public.module_actions
        SET "order" = idx - 1
        WHERE id = action_ids[idx];
    END LOOP;

    SELECT array_agg(ordered_actions) INTO updated_actions 
    FROM (
        SELECT * 
        FROM public.module_actions 
        WHERE id = ANY(action_ids)
        ORDER BY "order"
    ) AS ordered_actions;

    RETURN updated_actions;
END;
$$;


ALTER FUNCTION "public"."ReorderActions"("action_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."UpsertModuleActionCombine"("module_id" "uuid", "order" smallint, "sources" "public"."CombineSourceUpsertRequest"[], "actionId" "uuid" DEFAULT "gen_random_uuid"()) RETURNS "public"."ModuleAction:Combine"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    result public."ModuleAction:Combine";
    upserted_source public.combine_action_sources;
    current_source public."CombineSourceUpsertRequest";
BEGIN
    -- Check for non-nullablle fields in new action
    IF module_id IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "module_id" cannot be null';
    END IF;
    IF "order" IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "order" cannot be null';
    END IF;
    IF array_length(sources, 1) IS NULL THEN
        RAISE EXCEPTION 'At least one source is required';
    END IF;

    -- Check for non-nullable fields in each source
    FOREACH current_source IN ARRAY sources
    LOOP
        IF current_source.source_type IS NULL THEN
            RAISE EXCEPTION 'Non-nullable field "source_type" in source cannot be null';
        END IF;
        IF current_source.source_type <> 'LIKED_SONGS' AND current_source.source_type <> 'RECENTLY_PLAYED' AND current_source.spotify_id IS NULL THEN
            RAISE EXCEPTION 'Non-nullable field "spotify_id" in source cannot be null';
        END IF;
    END LOOP;

    -- Upsert the action into the module_actions table
    INSERT INTO public.module_actions (id, module_id, "order", type, created_at, updated_at, deleted_at)
    VALUES ("actionId", module_id, "order", 'COMBINE', now(), NULL, NULL)
    ON CONFLICT (id) DO UPDATE
    SET module_id = EXCLUDED.module_id,
        "order" = EXCLUDED."order",
        type = EXCLUDED.type,
        updated_at = now()
    RETURNING * INTO result;

    -- Initialize the sources array
    result.sources := ARRAY[]::public.combine_action_sources[];

    -- Upsert each source in the sources array
    FOREACH current_source IN ARRAY sources
    LOOP
        INSERT INTO public.combine_action_sources (id, action_id, created_at, updated_at, source_type, spotify_id, "limit", deleted_at, title, image_url)
        VALUES (COALESCE(current_source.id, gen_random_uuid()), result.id, now(), NULL, current_source.source_type, current_source.spotify_id, current_source."limit", NULL, current_source.title, current_source.image_url)
        ON CONFLICT (id) DO UPDATE
        SET action_id = EXCLUDED.action_id,
            updated_at = now(),
            source_type = EXCLUDED.source_type,
            spotify_id = EXCLUDED.spotify_id,
            "limit" = EXCLUDED."limit",
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url
        RETURNING * INTO upserted_source;

        -- Append the upserted source to the result.sources array
        result.sources := array_append(result.sources, upserted_source);
    END LOOP;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."UpsertModuleActionCombine"("module_id" "uuid", "order" smallint, "sources" "public"."CombineSourceUpsertRequest"[], "actionId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."UpsertModuleActionFilter"("module_id" "uuid", "order" smallint, "sources" "public"."FilterSourceUpsertRequest"[], "action_id" "uuid" DEFAULT "gen_random_uuid"()) RETURNS "public"."ModuleAction:Filter"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    result public."ModuleAction:Filter";
    upserted_source public.filter_action_sources;
    current_source public."FilterSourceUpsertRequest";
BEGIN
    -- Check for non-nullable fields in new_action
    IF module_id IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "module_id" cannot be null';
    ELSIF "order" IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "order" cannot be null';
    ELSIF array_length(sources, 1) IS NULL then
        RAISE EXCEPTION 'At least one source is required';
    END IF;

    -- Check for non-nullable fields in each source
    FOREACH current_source IN ARRAY sources
    LOOP
        IF current_source.source_type IS NULL THEN
            RAISE EXCEPTION 'Non-nullable field "source_type" in source cannot be null';
        END IF;
        IF current_source.spotify_id IS NULL AND current_source.source_type <> 'RECENTLY_PLAYED'::public."SPOTIFY_SOURCE_TYPE" AND current_source.source_type <> 'LIKED_SONGS'::public."SPOTIFY_SOURCE_TYPE" THEN
            RAISE EXCEPTION 'Non-nullable field "spotify_id" in source cannot be null';
        END IF;

        IF current_source.source_type = 'RECENTLY_PLAYED'::public."SPOTIFY_SOURCE_TYPE" THEN
            -- Store the config in a variable to access its fields
            DECLARE
                config public."RecentlyListenedConfig" = current_source.recently_listened_config;
            BEGIN
                IF config IS NULL OR 
                (config).quantity IS NULL OR 
                (config).interval IS NULL THEN
                    RAISE EXCEPTION 'Sources of type "RECENTLY_PLAYED" must have a config';
                END IF;

                IF (config).interval = 'DAYS'::public."RECENTLY_PLAYED_INTERVAL" THEN
                    IF (config).quantity < 1 OR (config).quantity > 90 THEN
                        RAISE EXCEPTION 'Recently played config must be between 1-90 days';
                    END IF;
                END IF;

                IF (config).interval = 'WEEKS'::public."RECENTLY_PLAYED_INTERVAL" THEN
                    IF (config).quantity < 1 OR (config).quantity > 12 THEN
                        RAISE EXCEPTION 'Recently played config must be between 1-12 weeks';
                    END IF;
                END IF;

                IF (config).interval = 'MONTHS'::public."RECENTLY_PLAYED_INTERVAL" THEN
                    IF (config).quantity < 1 OR (config).quantity > 3 THEN
                        RAISE EXCEPTION 'Recently played config must be between 1-3 months';
                    END IF;
                END IF;
            END;
        END IF;
    END LOOP;

    -- Upsert the action into the module_actions table
    INSERT INTO public.module_actions (id, module_id, "order", type, created_at, updated_at, deleted_at)
    VALUES (action_id, module_id, "order", 'FILTER', now(), NULL, NULL)
    ON CONFLICT (id) DO UPDATE
    SET module_id = EXCLUDED.module_id,
        "order" = EXCLUDED."order",
        type = EXCLUDED.type,
        updated_at = now()
    RETURNING * INTO result;

    -- Initialize the sources array
    result.sources := ARRAY[]::public.filter_action_sources[];

    -- Upsert each source in the sources array
    FOREACH current_source IN ARRAY sources
    LOOP        
        INSERT INTO public.filter_action_sources (id, action_id, created_at, updated_at, source_type, spotify_id, "limit", deleted_at, title, image_url)
        VALUES (COALESCE(current_source.id, gen_random_uuid()), result.id, now(), NULL, current_source.source_type, current_source.spotify_id, current_source."limit", NULL, current_source.title, current_source.image_url)
        ON CONFLICT (id) DO UPDATE
        SET action_id = EXCLUDED.action_id,
            updated_at = now(),
            source_type = EXCLUDED.source_type,
            spotify_id = EXCLUDED.spotify_id,
            "limit" = EXCLUDED."limit",
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url
        RETURNING * INTO upserted_source;

        -- Add recently listened config
        IF current_source.source_type = 'RECENTLY_PLAYED'::public."SPOTIFY_SOURCE_TYPE" AND current_source.recently_listened_config IS NOT NULL THEN
            DECLARE
                current_config public."RecentlyListenedConfig" = current_source.recently_listened_config;
            BEGIN
                INSERT INTO public.recently_played_source_configs (id, created_at, updated_at, quantity, interval, deleted_at)
                VALUES (upserted_source.id, upserted_source.created_at, upserted_source.updated_at, current_config.quantity, current_config.interval, upserted_source.deleted_at)
                ON CONFLICT (id) DO update
                SET updated_at = now(),
                    quantity = EXCLUDED.quantity,
                    interval = EXCLUDED.interval,
                    deleted_at = EXCLUDED.deleted_at;
            END;
        END IF;

        -- Append the upserted source to the result.sources array
        result.sources := array_append(result.sources, upserted_source);
    END LOOP;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."UpsertModuleActionFilter"("module_id" "uuid", "order" smallint, "sources" "public"."FilterSourceUpsertRequest"[], "action_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."UpsertModuleActionLimit"("module_id" "uuid", "order" smallint, "limit" smallint, "actionId" "uuid" DEFAULT "gen_random_uuid"(), "type" "public"."LIMIT_TYPE" DEFAULT 'OVERALL'::"public"."LIMIT_TYPE") RETURNS "public"."ModuleAction:Limit"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    result public."ModuleAction:Limit";
    result_config public."ModuleAction:Limit:Config";
BEGIN
    -- check for non-nullable arguments
    IF module_id IS NULL THEN
      RAISE EXCEPTION 'Non-nullable field "module_id" cannot be null';
    END IF;
    IF "order" IS NULL THEN
      RAISE EXCEPTION 'Non-nullable field "order" cannot be null';
    END IF;
    IF "limit" IS NULL then
      RAISE EXCEPTION 'Non-nullable field "limit" cannot be null';
    END IF;

    -- Upsert the new action into the module_actions table
    INSERT INTO public.module_actions (id, module_id, "order", type, created_at, updated_at, deleted_at)
    VALUES ("actionId", module_id, "order", 'LIMIT', now(), NULL, NULL)
    ON CONFLICT (id) DO UPDATE
    SET module_id = EXCLUDED.module_id,
      "order" = EXCLUDED."order",
        type = EXCLUDED.type,
        updated_at = now()
    RETURNING * INTO result;

    -- Upsert the config into the limit_action_configs table
    INSERT INTO public.limit_action_configs (id, created_at, updated_at, "limit", type, deleted_at)
    VALUES (result.id, result.created_at, NULL, "limit", type, NULL)
    ON CONFLICT (id) DO UPDATE
    SET updated_at = now(),
      "limit" = EXCLUDED."limit",
      type = EXCLUDED.type
    RETURNING * INTO result_config;

    result.config := ROW(result_config.id, result_config.created_at, result_config.updated_at, result_config."limit", result_config.type, result_config.deleted_at);

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."UpsertModuleActionLimit"("module_id" "uuid", "order" smallint, "limit" smallint, "actionId" "uuid", "type" "public"."LIMIT_TYPE") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."UpsertModuleActionShuffle"("moduleId" "uuid", "newOrder" smallint, "actionId" "uuid" DEFAULT "gen_random_uuid"(), "shuffleType" "public"."SHUFFLE_TYPE" DEFAULT 'RANDOM'::"public"."SHUFFLE_TYPE") RETURNS "public"."ModuleAction:Shuffle"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    result public."ModuleAction:Shuffle";
    result_config public."ModuleAction:Shuffle:Config";
BEGIN
    -- Check for non-nullable arguments
    IF "moduleId" IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "moduleId" cannot be null';
    END IF;
    IF "newOrder" IS NULL THEN
        RAISE EXCEPTION 'Non-nullable field "newOrder" cannot be null';
    END IF;

    -- Upsert the new_action into the module_actions table
    INSERT INTO public.module_actions (id, module_id, "order", type, created_at, updated_at, deleted_at)
    VALUES ("actionId", "moduleId", "newOrder", 'SHUFFLE'::public."MODULE_ACTION_TYPE", now()::timestamp with time zone, NULL::timestamp with time zone, NULL::timestamp with time zone)
    ON CONFLICT (id) DO UPDATE
    SET module_id = EXCLUDED.module_id,
        "order" = EXCLUDED."order",
        type = EXCLUDED.type,
        updated_at = now()::timestamp with time zone
    RETURNING * INTO result;

    -- Upsert the config into the shuffle_action_configs table
    INSERT INTO public.shuffle_action_configs (id, created_at, updated_at, shuffle_type, deleted_at)
    VALUES (result.id, result.created_at, NULL::timestamp with time zone, "shuffleType", NULL::timestamp with time zone)
    ON CONFLICT (id) DO UPDATE
    SET updated_at = now()::timestamp with time zone,
        shuffle_type = EXCLUDED.shuffle_type
    RETURNING * INTO result_config;

    result.config := ROW(result_config.id, result_config.created_at, result_config.updated_at, result_config.shuffle_type, result_config.deleted_at);

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."UpsertModuleActionShuffle"("moduleId" "uuid", "newOrder" smallint, "actionId" "uuid", "shuffleType" "public"."SHUFFLE_TYPE") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."UpsertModuleSource:RecentlyListened"("p_module_id" "uuid", "p_quantity" smallint, "p_interval" "public"."RECENTLY_PLAYED_INTERVAL", "p_source_id" "uuid" DEFAULT "gen_random_uuid"()) RETURNS "public"."recently_listened_source_with_config"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    upserted_source_row public.module_sources;
    upserted_config_row public.recently_played_source_configs;
    result public.recently_listened_source_with_config;
BEGIN
    INSERT INTO public.module_sources (id, module_id, type, spotify_id, created_at, updated_at, deleted_at, "limit", image_url, title)
    VALUES (p_source_id, p_module_id, 'RECENTLY_PLAYED'::public."SPOTIFY_SOURCE_TYPE", '', clock_timestamp(), NULL, NULL, NULL, '', 'Recently Listened')
    ON CONFLICT (id)
    DO UPDATE SET
        module_id = excluded.module_id,
        type = excluded.type,
        spotify_id = excluded.spotify_id,
        updated_at = clock_timestamp(),
        "limit" = excluded."limit",
        image_url = excluded.image_url,
        title = excluded.title
    RETURNING * INTO upserted_source_row;

    INSERT INTO public.recently_played_source_configs (id, created_at, updated_at, quantity, interval)
    VALUES (upserted_source_row.id, clock_timestamp(), NULL, p_quantity, p_interval)
    ON CONFLICT (id)
    DO UPDATE SET
        updated_at = clock_timestamp(),
        quantity = excluded.quantity,
        interval = excluded.interval
    RETURNING * INTO upserted_config_row;

    -- Populate the result composite type
    result.source_id := upserted_source_row.id;
    result.module_id := upserted_source_row.module_id;
    result.type := upserted_source_row.type;
    result.spotify_id := upserted_source_row.spotify_id;
    result.created_at := upserted_source_row.created_at;
    result.updated_at := upserted_source_row.updated_at;
    result.deleted_at := upserted_source_row.deleted_at;
    result."limit" := upserted_source_row."limit";
    result.image_url := upserted_source_row.image_url;
    result.title := upserted_source_row.title;
    result.config_id := upserted_config_row.id;
    result.config_created_at := upserted_config_row.created_at;
    result.config_updated_at := upserted_config_row.updated_at;
    result.quantity := upserted_config_row.quantity;
    result.interval := upserted_config_row.interval;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error during upsert operation: %', SQLERRM;
        RAISE EXCEPTION 'Error during upsert operation: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."UpsertModuleSource:RecentlyListened"("p_module_id" "uuid", "p_quantity" smallint, "p_interval" "public"."RECENTLY_PLAYED_INTERVAL", "p_source_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "spotify_auth"."provider_session_data" (
    "user_id" "uuid" NOT NULL,
    "access" "text" NOT NULL,
    "refresh" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "spotify_auth"."provider_session_data" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "spotify_auth"."UpsertProviderData"("p_user_id" "uuid", "p_access" "text" DEFAULT NULL::"text", "p_refresh" "text" DEFAULT NULL::"text", "p_expires_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "spotify_auth"."provider_session_data"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    upserted_row spotify_auth.provider_session_data;
    missing_fields TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM spotify_auth.provider_session_data WHERE spotify_auth.provider_session_data.user_id = p_user_id
    ) THEN
        missing_fields := '';
        IF p_ACCESS IS NULL THEN
            missing_fields := missing_fields || 'access, ';
        END IF;
        IF p_REFRESH IS NULL THEN
            missing_fields := missing_fields || 'refresh, ';
        END IF;
        IF p_expires_at IS NULL THEN
            missing_fields := missing_fields || 'expires_at, ';
        END IF;
        
        IF missing_fields <> '' THEN
            RAISE EXCEPTION 'No record found to update. Missing required arguments to create a new record: %', substring(missing_fields, 1, length(missing_fields) - 2);
        END IF;
    END IF;

    INSERT INTO spotify_auth.provider_session_data (user_id, access, refresh, expires_at)
    VALUES (p_user_id, p_ACCESS, p_REFRESH, p_expires_at)
    ON CONFLICT (user_id)
    DO UPDATE SET
        access = EXCLUDED.access,
        refresh = EXCLUDED.refresh,
        expires_at = EXCLUDED.expires_at
    RETURNING * INTO upserted_row;

    RETURN upserted_row;
END;$$;


ALTER FUNCTION "spotify_auth"."UpsertProviderData"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "spotify_auth"."upsert_provider_data"("p_user_id" "uuid", "p_access" "text" DEFAULT NULL::"text", "p_refresh" "text" DEFAULT NULL::"text", "p_expires_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "spotify_auth"."provider_session_data"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    upserted_row spotify_auth.provider_session_data;
    missing_fields TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM spotify_auth.provider_session_data WHERE spotify_auth.provider_session_data.user_id = p_user_id
    ) THEN
        missing_fields := '';
        IF p_ACCESS IS NULL THEN
            missing_fields := missing_fields || 'access, ';
        END IF;
        IF p_REFRESH IS NULL THEN
            missing_fields := missing_fields || 'refresh, ';
        END IF;
        IF p_expires_at IS NULL THEN
            missing_fields := missing_fields || 'expires_at, ';
        END IF;
        
        IF missing_fields <> '' THEN
            RAISE EXCEPTION 'No record found to update. Missing required arguments to create a new record: %', substring(missing_fields, 1, length(missing_fields) - 2);
        END IF;
    END IF;

    INSERT INTO spotify_auth.provider_session_data (user_id, access, refresh, expires_at)
    VALUES (p_user_id, p_ACCESS, p_REFRESH, p_expires_at)
    ON CONFLICT (user_id)
    DO UPDATE SET
        access = EXCLUDED.access,
        refresh = EXCLUDED.refresh,
        expires_at = EXCLUDED.expires_at
    RETURNING * INTO upserted_row;

    RETURN upserted_row;
END;
$$;


ALTER FUNCTION "spotify_auth"."upsert_provider_data"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "spotify_cache"."DeleteOldRecentlyListened"("p_older_than" timestamp with time zone) RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    deleted_row_count INT;
BEGIN
    DELETE FROM spotify_cache.recently_listened
    WHERE played_at < p_older_than;
    
    GET DIAGNOSTICS deleted_row_count = ROW_COUNT;
    
    RETURN deleted_row_count;
END;
$$;


ALTER FUNCTION "spotify_cache"."DeleteOldRecentlyListened"("p_older_than" timestamp with time zone) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "feature_flags"."global_flags" (
    "flag_name" "feature_flags"."FLAG_NAME" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "enabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE "feature_flags"."global_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "spotify_cache"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "album_id" "text" NOT NULL,
    "track_ids" "text"[] NOT NULL
);


ALTER TABLE "spotify_cache"."albums" OWNER TO "postgres";


COMMENT ON TABLE "spotify_cache"."albums" IS 'Albums with their track_ids';



CREATE TABLE IF NOT EXISTS "spotify_cache"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "artist_id" "text" NOT NULL,
    "album_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "spotify_cache"."artists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "spotify_cache"."playlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "playlist_id" "text" NOT NULL,
    "snapshot_id" "text" NOT NULL,
    "track_ids" "text"[] NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "spotify_cache"."playlists" OWNER TO "postgres";


COMMENT ON TABLE "spotify_cache"."playlists" IS 'Playlists with their snapshot_ids with a list of track_ids associated with the playlist for that particular snapshot';



CREATE TABLE IF NOT EXISTS "spotify_cache"."recently_listened" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "saved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "played_at" timestamp with time zone NOT NULL,
    "track_id" "text" NOT NULL
);


ALTER TABLE "spotify_cache"."recently_listened" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "spotify_cache"."user_tracks" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "track_id" "text" NOT NULL,
    "added_at" timestamp with time zone NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "spotify_cache"."user_tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "spotify_cache"."user_tracks_completion" (
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone
);


ALTER TABLE "spotify_cache"."user_tracks_completion" OWNER TO "postgres";


COMMENT ON TABLE "spotify_cache"."user_tracks_completion" IS 'Tracks if the currently caches user_tracks have the oldest `added_at` user_track saved';



ALTER TABLE ONLY "feature_flags"."global_flags"
    ADD CONSTRAINT "global_flags_pkey" PRIMARY KEY ("flag_name");



ALTER TABLE ONLY "public"."combine_action_sources"
    ADD CONSTRAINT "combine_action_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."filter_action_sources"
    ADD CONSTRAINT "filter_action_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."limit_action_configs"
    ADD CONSTRAINT "limit_action_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_actions"
    ADD CONSTRAINT "module_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_outputs"
    ADD CONSTRAINT "module_outputs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."module_outputs"
    ADD CONSTRAINT "module_outputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_sources"
    ADD CONSTRAINT "module_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recently_played_source_configs"
    ADD CONSTRAINT "recently_played_source_configs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."recently_played_source_configs"
    ADD CONSTRAINT "recently_played_source_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shuffle_action_configs"
    ADD CONSTRAINT "shuffle_action_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "spotify_auth"."provider_session_data"
    ADD CONSTRAINT "provider_session_data_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "spotify_cache"."albums"
    ADD CONSTRAINT "albums_album_id_key" UNIQUE ("album_id");



ALTER TABLE ONLY "spotify_cache"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "spotify_cache"."artists"
    ADD CONSTRAINT "artists_artist_id_key" UNIQUE ("artist_id");



ALTER TABLE ONLY "spotify_cache"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "spotify_cache"."playlists"
    ADD CONSTRAINT "playlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "spotify_cache"."playlists"
    ADD CONSTRAINT "playlists_snapshot_id_key" UNIQUE ("snapshot_id");



ALTER TABLE ONLY "spotify_cache"."recently_listened"
    ADD CONSTRAINT "recently_listened_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "spotify_cache"."user_tracks_completion"
    ADD CONSTRAINT "user_tracks_completion_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "spotify_cache"."user_tracks"
    ADD CONSTRAINT "user_tracks_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "unique_module_id_order" ON "public"."module_actions" USING "btree" ("module_id", "order") WHERE ("deleted_at" IS NULL);



CREATE OR REPLACE TRIGGER "PersistActionDeletedAt" AFTER UPDATE ON "public"."module_actions" FOR EACH ROW EXECUTE FUNCTION "public"."PersistActionDeletedAt"();



CREATE OR REPLACE TRIGGER "PersistRecentlyListenedDeletedAt" AFTER UPDATE ON "public"."module_sources" FOR EACH ROW EXECUTE FUNCTION "public"."PersistRecentlyListenedDeletedAt"();



ALTER TABLE ONLY "public"."combine_action_sources"
    ADD CONSTRAINT "combine_action_sources_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."module_actions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."filter_action_sources"
    ADD CONSTRAINT "filter_action_sources_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."module_actions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."limit_action_configs"
    ADD CONSTRAINT "limit_action_configs_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."module_actions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_actions"
    ADD CONSTRAINT "module_actions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_outputs"
    ADD CONSTRAINT "module_outputs_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_sources"
    ADD CONSTRAINT "module_sources_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shuffle_action_configs"
    ADD CONSTRAINT "shuffle_action_configs_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."module_actions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "spotify_auth"."provider_session_data"
    ADD CONSTRAINT "provider_session_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "spotify_cache"."playlists"
    ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "spotify_cache"."recently_listened"
    ADD CONSTRAINT "recently_listened_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "spotify_cache"."user_tracks_completion"
    ADD CONSTRAINT "user_tracks_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "spotify_cache"."user_tracks"
    ADD CONSTRAINT "user_tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "feature_flags"."global_flags" FOR SELECT USING (true);



ALTER TABLE "feature_flags"."global_flags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow service_role to delete all rows" ON "public"."combine_action_sources" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."filter_action_sources" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."limit_action_configs" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."module_actions" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."module_outputs" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."module_sources" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."modules" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."recently_played_source_configs" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to delete all rows" ON "public"."shuffle_action_configs" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."combine_action_sources" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."filter_action_sources" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."limit_action_configs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."module_actions" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."module_outputs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."module_sources" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."modules" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."recently_played_source_configs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to insert all rows" ON "public"."shuffle_action_configs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."combine_action_sources" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."filter_action_sources" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."limit_action_configs" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."module_actions" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."module_outputs" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."module_sources" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."modules" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."recently_played_source_configs" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to select all rows" ON "public"."shuffle_action_configs" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."combine_action_sources" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."filter_action_sources" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."limit_action_configs" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."module_actions" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."module_outputs" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."module_sources" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."modules" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."recently_played_source_configs" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow service_role to update all rows" ON "public"."shuffle_action_configs" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for users based on user_id" ON "public"."modules" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Only actions for modules owned by user" ON "public"."module_actions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" = "module_actions"."module_id"))));



CREATE POLICY "Only allow combine sources owned by user" ON "public"."combine_action_sources" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" = "combine_action_sources"."action_id"))))));



CREATE POLICY "Only allow filter sources owned by user" ON "public"."filter_action_sources" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" = "filter_action_sources"."action_id"))))));



CREATE POLICY "Only allow limit configs owned by user" ON "public"."limit_action_configs" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" = "limit_action_configs"."id"))))));



CREATE POLICY "Only allow shuffle configs owned by user" ON "public"."shuffle_action_configs" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" = "shuffle_action_configs"."id"))))));



CREATE POLICY "Only outputs for modules owned by user" ON "public"."module_outputs" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" = "module_outputs"."module_id"))));



CREATE POLICY "Only sources for modules owned by user" ON "public"."module_sources" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" = "module_sources"."module_id"))));



CREATE POLICY "Users can only operate on recently played configs they own" ON "public"."recently_played_source_configs" TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_sources"."module_id"
           FROM "public"."module_sources"
          WHERE ("module_sources"."id" = "recently_played_source_configs"."id"))))) OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" IN ( SELECT "combine_action_sources"."action_id"
                   FROM "public"."combine_action_sources"
                  WHERE ("combine_action_sources"."id" = "recently_played_source_configs"."id"))))))) OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" IN ( SELECT "filter_action_sources"."action_id"
                   FROM "public"."filter_action_sources"
                  WHERE ("filter_action_sources"."id" = "recently_played_source_configs"."id"))))))))) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_sources"."module_id"
           FROM "public"."module_sources"
          WHERE ("module_sources"."id" = "recently_played_source_configs"."id"))))) OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" IN ( SELECT "combine_action_sources"."action_id"
                   FROM "public"."combine_action_sources"
                  WHERE ("combine_action_sources"."id" = "recently_played_source_configs"."id"))))))) OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "modules"."user_id"
   FROM "public"."modules"
  WHERE ("modules"."id" IN ( SELECT "module_actions"."module_id"
           FROM "public"."module_actions"
          WHERE ("module_actions"."id" IN ( SELECT "filter_action_sources"."action_id"
                   FROM "public"."filter_action_sources"
                  WHERE ("filter_action_sources"."id" = "recently_played_source_configs"."id")))))))));



ALTER TABLE "public"."combine_action_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."filter_action_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."limit_action_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_outputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recently_played_source_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shuffle_action_configs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable all access for service users" ON "spotify_auth"."provider_session_data" TO "service_role" USING (true);



CREATE POLICY "Enable all for users based on user_id" ON "spotify_auth"."provider_session_data" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "spotify_auth"."provider_session_data" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Disable private rows for non-matching users" ON "spotify_cache"."playlists" TO "authenticated" USING ((("user_id" IS NULL) OR ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("user_id" IS NULL) OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Enable all for authenticated users only" ON "spotify_cache"."albums" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "spotify_cache"."artists" TO "authenticated" USING (true);



CREATE POLICY "Enable all for users based on user_id" ON "spotify_cache"."user_tracks" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable all for users based on user_id" ON "spotify_cache"."user_tracks_completion" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable select for authenticated users based on user_id" ON "spotify_cache"."recently_listened" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Service roles full permissions" ON "spotify_cache"."playlists" TO "dashboard_user", "pgsodium_keyiduser", "pgsodium_keyholder", "pgsodium_keymaker", "anon", "service_role", "supabase_admin", "authenticator", "pgbouncer", "supabase_auth_admin", "supabase_storage_admin", "supabase_replication_admin", "supabase_read_only_user", "supabase_realtime_admin", "postgres" USING (true);



ALTER TABLE "spotify_cache"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "spotify_cache"."artists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "spotify_cache"."playlists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "spotify_cache"."recently_listened" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "spotify_cache"."user_tracks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "spotify_cache"."user_tracks_completion" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."filter_action_sources";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."modules";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "feature_flags" TO "anon";
GRANT USAGE ON SCHEMA "feature_flags" TO "authenticated";
GRANT USAGE ON SCHEMA "feature_flags" TO "service_role";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "spotify_auth" TO "anon";
GRANT USAGE ON SCHEMA "spotify_auth" TO "authenticated";
GRANT USAGE ON SCHEMA "spotify_auth" TO "service_role";



GRANT USAGE ON SCHEMA "spotify_cache" TO "anon";
GRANT USAGE ON SCHEMA "spotify_cache" TO "authenticated";
GRANT USAGE ON SCHEMA "spotify_cache" TO "service_role";



GRANT ALL ON TABLE "public"."combine_action_sources" TO "anon";
GRANT ALL ON TABLE "public"."combine_action_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."combine_action_sources" TO "service_role";



GRANT ALL ON TABLE "public"."filter_action_sources" TO "anon";
GRANT ALL ON TABLE "public"."filter_action_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."filter_action_sources" TO "service_role";



GRANT ALL ON TABLE "public"."limit_action_configs" TO "anon";
GRANT ALL ON TABLE "public"."limit_action_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."limit_action_configs" TO "service_role";



GRANT ALL ON TABLE "public"."module_actions" TO "anon";
GRANT ALL ON TABLE "public"."module_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."module_actions" TO "service_role";



GRANT ALL ON TABLE "public"."module_outputs" TO "anon";
GRANT ALL ON TABLE "public"."module_outputs" TO "authenticated";
GRANT ALL ON TABLE "public"."module_outputs" TO "service_role";



GRANT ALL ON TABLE "public"."module_sources" TO "anon";
GRANT ALL ON TABLE "public"."module_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."module_sources" TO "service_role";



GRANT ALL ON TABLE "public"."modules" TO "anon";
GRANT ALL ON TABLE "public"."modules" TO "authenticated";
GRANT ALL ON TABLE "public"."modules" TO "service_role";



GRANT ALL ON TABLE "public"."recently_played_source_configs" TO "anon";
GRANT ALL ON TABLE "public"."recently_played_source_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."recently_played_source_configs" TO "service_role";



GRANT ALL ON TABLE "public"."shuffle_action_configs" TO "anon";
GRANT ALL ON TABLE "public"."shuffle_action_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."shuffle_action_configs" TO "service_role";



























































































































































































































GRANT ALL ON FUNCTION "public"."GetCombineAction"("actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetCombineAction"("actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetCombineAction"("actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."GetFilterAction"("actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetFilterAction"("actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetFilterAction"("actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."GetLimitAction"("actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetLimitAction"("actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetLimitAction"("actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."GetModuleActions"("moduleId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetModuleActions"("moduleId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetModuleActions"("moduleId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."GetModuleRunData"("moduleId" "uuid", "callerUserId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetModuleRunData"("moduleId" "uuid", "callerUserId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetModuleRunData"("moduleId" "uuid", "callerUserId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."GetShuffleAction"("actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."GetShuffleAction"("actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."GetShuffleAction"("actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."PersistActionDeletedAt"() TO "anon";
GRANT ALL ON FUNCTION "public"."PersistActionDeletedAt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."PersistActionDeletedAt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."PersistRecentlyListenedDeletedAt"() TO "anon";
GRANT ALL ON FUNCTION "public"."PersistRecentlyListenedDeletedAt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."PersistRecentlyListenedDeletedAt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."PersistSourceIdsCreation"() TO "anon";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsCreation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsCreation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."PersistSourceIdsDeletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsDeletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsDeletion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."PersistSourceIdsUpdate"() TO "anon";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsUpdate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."PersistSourceIdsUpdate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."RemoveModuleAction"("actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."RemoveModuleAction"("actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."RemoveModuleAction"("actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ReorderActions"("action_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."ReorderActions"("action_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ReorderActions"("action_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."UpsertModuleActionCombine"("module_id" "uuid", "order" smallint, "sources" "public"."CombineSourceUpsertRequest"[], "actionId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionCombine"("module_id" "uuid", "order" smallint, "sources" "public"."CombineSourceUpsertRequest"[], "actionId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionCombine"("module_id" "uuid", "order" smallint, "sources" "public"."CombineSourceUpsertRequest"[], "actionId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."UpsertModuleActionFilter"("module_id" "uuid", "order" smallint, "sources" "public"."FilterSourceUpsertRequest"[], "action_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionFilter"("module_id" "uuid", "order" smallint, "sources" "public"."FilterSourceUpsertRequest"[], "action_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionFilter"("module_id" "uuid", "order" smallint, "sources" "public"."FilterSourceUpsertRequest"[], "action_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."UpsertModuleActionLimit"("module_id" "uuid", "order" smallint, "limit" smallint, "actionId" "uuid", "type" "public"."LIMIT_TYPE") TO "anon";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionLimit"("module_id" "uuid", "order" smallint, "limit" smallint, "actionId" "uuid", "type" "public"."LIMIT_TYPE") TO "authenticated";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionLimit"("module_id" "uuid", "order" smallint, "limit" smallint, "actionId" "uuid", "type" "public"."LIMIT_TYPE") TO "service_role";



GRANT ALL ON FUNCTION "public"."UpsertModuleActionShuffle"("moduleId" "uuid", "newOrder" smallint, "actionId" "uuid", "shuffleType" "public"."SHUFFLE_TYPE") TO "anon";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionShuffle"("moduleId" "uuid", "newOrder" smallint, "actionId" "uuid", "shuffleType" "public"."SHUFFLE_TYPE") TO "authenticated";
GRANT ALL ON FUNCTION "public"."UpsertModuleActionShuffle"("moduleId" "uuid", "newOrder" smallint, "actionId" "uuid", "shuffleType" "public"."SHUFFLE_TYPE") TO "service_role";



GRANT ALL ON FUNCTION "public"."UpsertModuleSource:RecentlyListened"("p_module_id" "uuid", "p_quantity" smallint, "p_interval" "public"."RECENTLY_PLAYED_INTERVAL", "p_source_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."UpsertModuleSource:RecentlyListened"("p_module_id" "uuid", "p_quantity" smallint, "p_interval" "public"."RECENTLY_PLAYED_INTERVAL", "p_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."UpsertModuleSource:RecentlyListened"("p_module_id" "uuid", "p_quantity" smallint, "p_interval" "public"."RECENTLY_PLAYED_INTERVAL", "p_source_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "spotify_auth"."provider_session_data" TO "anon";
GRANT ALL ON TABLE "spotify_auth"."provider_session_data" TO "authenticated";
GRANT ALL ON TABLE "spotify_auth"."provider_session_data" TO "service_role";



GRANT ALL ON FUNCTION "spotify_auth"."UpsertProviderData"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "spotify_auth"."UpsertProviderData"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "spotify_auth"."UpsertProviderData"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "spotify_auth"."upsert_provider_data"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "spotify_auth"."upsert_provider_data"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "spotify_auth"."upsert_provider_data"("p_user_id" "uuid", "p_access" "text", "p_refresh" "text", "p_expires_at" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "spotify_cache"."DeleteOldRecentlyListened"("p_older_than" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "spotify_cache"."DeleteOldRecentlyListened"("p_older_than" timestamp with time zone) TO "service_role";















GRANT ALL ON TABLE "feature_flags"."global_flags" TO "anon";
GRANT ALL ON TABLE "feature_flags"."global_flags" TO "authenticated";
GRANT ALL ON TABLE "feature_flags"."global_flags" TO "service_role";















GRANT ALL ON TABLE "spotify_cache"."albums" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."albums" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."albums" TO "service_role";



GRANT ALL ON TABLE "spotify_cache"."artists" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."artists" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."artists" TO "service_role";



GRANT ALL ON TABLE "spotify_cache"."playlists" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."playlists" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."playlists" TO "service_role";



GRANT ALL ON TABLE "spotify_cache"."recently_listened" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."recently_listened" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."recently_listened" TO "service_role";



GRANT ALL ON TABLE "spotify_cache"."user_tracks" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."user_tracks" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."user_tracks" TO "service_role";



GRANT ALL ON TABLE "spotify_cache"."user_tracks_completion" TO "anon";
GRANT ALL ON TABLE "spotify_cache"."user_tracks_completion" TO "authenticated";
GRANT ALL ON TABLE "spotify_cache"."user_tracks_completion" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "feature_flags" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_auth" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "spotify_cache" GRANT ALL ON TABLES  TO "service_role";



























RESET ALL;
