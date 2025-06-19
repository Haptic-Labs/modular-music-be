export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  feature_flags: {
    Tables: {
      global_flags: {
        Row: {
          created_at: string
          enabled: boolean
          flag_name: Database["feature_flags"]["Enums"]["FLAG_NAME"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          flag_name: Database["feature_flags"]["Enums"]["FLAG_NAME"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          flag_name?: Database["feature_flags"]["Enums"]["FLAG_NAME"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      FLAG_NAME: "light-mode"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      combine_action_sources: {
        Row: {
          action_id: string
          created_at: string
          deleted_at: string | null
          id: string
          image_url: string | null
          limit: number | null
          source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          action_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          source_type?: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combine_action_sources_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "module_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      filter_action_sources: {
        Row: {
          action_id: string
          created_at: string
          deleted_at: string | null
          id: string
          image_url: string | null
          limit: number | null
          source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          action_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          source_type?: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          spotify_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filter_action_sources_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "module_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      limit_action_configs: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          limit: number
          type: Database["public"]["Enums"]["LIMIT_TYPE"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          limit: number
          type?: Database["public"]["Enums"]["LIMIT_TYPE"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          limit?: number
          type?: Database["public"]["Enums"]["LIMIT_TYPE"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "limit_action_configs_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "module_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_actions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          module_id: string
          order: number
          type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          module_id: string
          order: number
          type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          module_id?: string
          order?: number
          type?: Database["public"]["Enums"]["MODULE_ACTION_TYPE"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_actions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_outputs: {
        Row: {
          created_at: string
          de_dupe: boolean
          deleted_at: string | null
          id: string
          image_url: string | null
          limit: number | null
          mode: Database["public"]["Enums"]["MODULE_OUTPUT_MODE"]
          module_id: string
          spotify_id: string
          title: string
          type: Database["public"]["Enums"]["SPOTIFY_OUTPUT_TYPE"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          de_dupe: boolean
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          mode: Database["public"]["Enums"]["MODULE_OUTPUT_MODE"]
          module_id: string
          spotify_id: string
          title: string
          type: Database["public"]["Enums"]["SPOTIFY_OUTPUT_TYPE"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          de_dupe?: boolean
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          mode?: Database["public"]["Enums"]["MODULE_OUTPUT_MODE"]
          module_id?: string
          spotify_id?: string
          title?: string
          type?: Database["public"]["Enums"]["SPOTIFY_OUTPUT_TYPE"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_outputs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_sources: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          image_url: string | null
          limit: number | null
          module_id: string
          spotify_id: string | null
          title: string
          type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          module_id: string
          spotify_id?: string | null
          title: string
          type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          limit?: number | null
          module_id?: string
          spotify_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_sources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_running: boolean
          name: string
          previous_run: string | null
          schedule_config:
            | Database["public"]["CompositeTypes"]["ModuleScheduleConfig"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_running?: boolean
          name: string
          previous_run?: string | null
          schedule_config?:
            | Database["public"]["CompositeTypes"]["ModuleScheduleConfig"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_running?: boolean
          name?: string
          previous_run?: string | null
          schedule_config?:
            | Database["public"]["CompositeTypes"]["ModuleScheduleConfig"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recently_played_source_configs: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"]
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"]
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"]
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shuffle_action_configs: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          shuffle_type: Database["public"]["Enums"]["SHUFFLE_TYPE"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          shuffle_type: Database["public"]["Enums"]["SHUFFLE_TYPE"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          shuffle_type?: Database["public"]["Enums"]["SHUFFLE_TYPE"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shuffle_action_configs_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "module_actions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      GetCombineAction: {
        Args: { actionId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Combine"]
      }
      GetFilterAction: {
        Args: { actionId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Filter"]
      }
      GetLimitAction: {
        Args: { actionId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Limit"]
      }
      GetModuleActions: {
        Args: { moduleId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleActions"]
      }
      GetModuleRunData: {
        Args: { moduleId: string; callerUserId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleRunData"]
      }
      GetShuffleAction: {
        Args: { actionId: string }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Shuffle"]
      }
      RemoveModuleAction: {
        Args: { actionId: string }
        Returns: Database["public"]["CompositeTypes"]["RemoveModuleActionResponse"]
      }
      ReorderActions: {
        Args: { action_ids: string[] }
        Returns: Database["public"]["Tables"]["module_actions"]["Row"][]
      }
      UpsertModuleActionCombine: {
        Args: {
          module_id: string
          order: number
          sources: Database["public"]["CompositeTypes"]["CombineSourceUpsertRequest"][]
          actionId?: string
        }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Combine"]
      }
      UpsertModuleActionFilter: {
        Args: {
          module_id: string
          order: number
          sources: Database["public"]["CompositeTypes"]["FilterSourceUpsertRequest"][]
          action_id?: string
        }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Filter"]
      }
      UpsertModuleActionLimit: {
        Args: {
          module_id: string
          order: number
          limit: number
          actionId?: string
          type?: Database["public"]["Enums"]["LIMIT_TYPE"]
        }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Limit"]
      }
      UpsertModuleActionShuffle: {
        Args: {
          moduleId: string
          newOrder: number
          actionId?: string
          shuffleType?: Database["public"]["Enums"]["SHUFFLE_TYPE"]
        }
        Returns: Database["public"]["CompositeTypes"]["ModuleAction:Shuffle"]
      }
      "UpsertModuleSource:RecentlyListened": {
        Args: {
          p_module_id: string
          p_quantity: number
          p_interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"]
          p_source_id?: string
        }
        Returns: Database["public"]["CompositeTypes"]["recently_listened_source_with_config"]
      }
    }
    Enums: {
      LIMIT_TYPE: "OVERALL" | "PER_SOURCE"
      MODULE_ACTION_TYPE: "FILTER" | "SHUFFLE" | "LIMIT" | "COMBINE" | "MODULE"
      MODULE_OUTPUT_MODE: "REPLACE" | "APPEND" | "PREPEND"
      RECENTLY_PLAYED_INTERVAL: "DAYS" | "WEEKS" | "MONTHS"
      SCHEDULE_INTERVAL: "DAYS" | "WEEKS" | "MONTHS" | "YEARS"
      SHUFFLE_TYPE: "RANDOM"
      SPOTIFY_OUTPUT_TYPE: "PLAYLIST"
      SPOTIFY_SOURCE_TYPE:
        | "PLAYLIST"
        | "TRACK"
        | "ALBUM"
        | "ARTIST"
        | "RECENTLY_PLAYED"
        | "LIKED_SONGS"
    }
    CompositeTypes: {
      CombineSourceUpsertRequest: {
        id: string | null
        action_id: string | null
        source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | null
        spotify_id: string | null
        limit: number | null
        title: string | null
        image_url: string | null
      }
      FilterSourceUpsertRequest: {
        id: string | null
        action_id: string | null
        source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | null
        spotify_id: string | null
        limit: number | null
        title: string | null
        image_url: string | null
        recently_listened_config:
          | Database["public"]["CompositeTypes"]["RecentlyListenedConfig"]
          | null
      }
      ModuleAction: {
        id: string | null
        module_id: string | null
        order: number | null
        type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"] | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
      }
      "ModuleAction:Combine": {
        id: string | null
        module_id: string | null
        order: number | null
        type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"] | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
        sources:
          | Database["public"]["Tables"]["combine_action_sources"]["Row"][]
          | null
      }
      "ModuleAction:Filter": {
        id: string | null
        module_id: string | null
        order: number | null
        type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"] | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
        sources:
          | Database["public"]["Tables"]["filter_action_sources"]["Row"][]
          | null
      }
      "ModuleAction:Limit": {
        id: string | null
        module_id: string | null
        order: number | null
        type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"] | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
        config:
          | Database["public"]["CompositeTypes"]["ModuleAction:Limit:Config"]
          | null
      }
      "ModuleAction:Limit:Config": {
        id: string | null
        created_at: string | null
        updated_at: string | null
        limit: number | null
        type: Database["public"]["Enums"]["LIMIT_TYPE"] | null
        deleted_at: string | null
      }
      "ModuleAction:Shuffle": {
        id: string | null
        module_id: string | null
        order: number | null
        type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"] | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
        config:
          | Database["public"]["CompositeTypes"]["ModuleAction:Shuffle:Config"]
          | null
      }
      "ModuleAction:Shuffle:Config": {
        id: string | null
        created_at: string | null
        updated_at: string | null
        shuffle_type: Database["public"]["Enums"]["SHUFFLE_TYPE"] | null
        deleted_at: string | null
      }
      ModuleActions: {
        shuffleActions:
          | Database["public"]["CompositeTypes"]["ModuleAction:Shuffle"][]
          | null
        filterActions:
          | Database["public"]["CompositeTypes"]["ModuleAction:Filter"][]
          | null
        limitActions:
          | Database["public"]["CompositeTypes"]["ModuleAction:Limit"][]
          | null
        combineActions:
          | Database["public"]["CompositeTypes"]["ModuleAction:Combine"][]
          | null
      }
      ModuleRunData: {
        module: Database["public"]["Tables"]["modules"]["Row"] | null
        moduleSources:
          | Database["public"]["Tables"]["module_sources"]["Row"][]
          | null
        moduleActions:
          | Database["public"]["Tables"]["module_actions"]["Row"][]
          | null
        moduleOutputs:
          | Database["public"]["Tables"]["module_outputs"]["Row"][]
          | null
        limitConfigs:
          | Database["public"]["Tables"]["limit_action_configs"]["Row"][]
          | null
        recentlyPlayedConfigs:
          | Database["public"]["Tables"]["recently_played_source_configs"]["Row"][]
          | null
        shuffleConfigs:
          | Database["public"]["Tables"]["shuffle_action_configs"]["Row"][]
          | null
        filterSources:
          | Database["public"]["Tables"]["filter_action_sources"]["Row"][]
          | null
        combineSources:
          | Database["public"]["Tables"]["combine_action_sources"]["Row"][]
          | null
      }
      ModuleScheduleConfig: {
        interval: Database["public"]["Enums"]["SCHEDULE_INTERVAL"] | null
        quantity: number | null
      }
      recently_listened_source_with_config: {
        source_id: string | null
        module_id: string | null
        type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | null
        spotify_id: string | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
        limit: number | null
        image_url: string | null
        title: string | null
        config_id: string | null
        config_created_at: string | null
        config_updated_at: string | null
        quantity: number | null
        interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"] | null
      }
      RecentlyListenedConfig: {
        quantity: number | null
        interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"] | null
      }
      RemoveModuleActionResponse: {
        updated_actions:
          | Database["public"]["Tables"]["module_actions"]["Row"][]
          | null
        module_id: string | null
      }
      SimpleSource: {
        source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | null
        spotify_id: string | null
        limit: number | null
      }
      SpotifySource: {
        spotify_id: string | null
        source_type: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | null
        limit: number | null
        title: string | null
        image_url: string | null
      }
    }
  }
  spotify_auth: {
    Tables: {
      provider_session_data: {
        Row: {
          access: string
          expires_at: string
          refresh: string
          user_id: string
        }
        Insert: {
          access: string
          expires_at: string
          refresh: string
          user_id: string
        }
        Update: {
          access?: string
          expires_at?: string
          refresh?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_provider_data: {
        Args: {
          p_user_id: string
          p_access?: string
          p_refresh?: string
          p_expires_at?: string
        }
        Returns: {
          access: string
          expires_at: string
          refresh: string
          user_id: string
        }
      }
      UpsertProviderData: {
        Args: {
          p_user_id: string
          p_access?: string
          p_refresh?: string
          p_expires_at?: string
        }
        Returns: {
          access: string
          expires_at: string
          refresh: string
          user_id: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  spotify_cache: {
    Tables: {
      albums: {
        Row: {
          album_id: string
          created_at: string
          id: string
          track_ids: string[]
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          track_ids: string[]
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          track_ids?: string[]
        }
        Relationships: []
      }
      playlists: {
        Row: {
          created_at: string
          id: string
          playlist_id: string
          snapshot_id: string
          track_ids: string[]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id: string
          snapshot_id: string
          track_ids: string[]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string
          snapshot_id?: string
          track_ids?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      recently_listened: {
        Row: {
          id: string
          played_at: string
          saved_at: string
          track_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          played_at: string
          saved_at?: string
          track_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          played_at?: string
          saved_at?: string
          track_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_tracks: {
        Row: {
          added_at: string
          created_at: string
          id: string
          metadata: Json
          track_id: string
          user_id: string
        }
        Insert: {
          added_at: string
          created_at?: string
          id?: string
          metadata?: Json
          track_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tracks_completion: {
        Row: {
          completed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      DeleteOldRecentlyListened: {
        Args: { p_older_than: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  feature_flags: {
    Enums: {
      FLAG_NAME: ["light-mode"],
    },
  },
  public: {
    Enums: {
      LIMIT_TYPE: ["OVERALL", "PER_SOURCE"],
      MODULE_ACTION_TYPE: ["FILTER", "SHUFFLE", "LIMIT", "COMBINE", "MODULE"],
      MODULE_OUTPUT_MODE: ["REPLACE", "APPEND", "PREPEND"],
      RECENTLY_PLAYED_INTERVAL: ["DAYS", "WEEKS", "MONTHS"],
      SCHEDULE_INTERVAL: ["DAYS", "WEEKS", "MONTHS", "YEARS"],
      SHUFFLE_TYPE: ["RANDOM"],
      SPOTIFY_OUTPUT_TYPE: ["PLAYLIST"],
      SPOTIFY_SOURCE_TYPE: [
        "PLAYLIST",
        "TRACK",
        "ALBUM",
        "ARTIST",
        "RECENTLY_PLAYED",
        "LIKED_SONGS",
      ],
    },
  },
  spotify_auth: {
    Enums: {},
  },
  spotify_cache: {
    Enums: {},
  },
} as const
