export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      module_actions: {
        Row: {
          config: Json;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at: string | null;
        };
        Insert: {
          config: Json;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_url?: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at?: string | null;
        };
        Update: {
          config?: Json;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_url?: string | null;
          module_id?: string;
          order?: number;
          title?: string;
          type?: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_actions_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          }
        ];
      };
      module_outputs: {
        Row: {
          created_at: string;
          de_dupe: boolean;
          deleted_at: string | null;
          id: number;
          limit: number | null;
          mode: Database['public']['Enums']['MODULE_OUTPUT_MODE'];
          module_id: string;
          spotify_id: string;
          type: Database['public']['Enums']['SPOTIFY_OUTPUT_TYPE'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          de_dupe: boolean;
          deleted_at?: string | null;
          id?: number;
          limit?: number | null;
          mode: Database['public']['Enums']['MODULE_OUTPUT_MODE'];
          module_id: string;
          spotify_id: string;
          type: Database['public']['Enums']['SPOTIFY_OUTPUT_TYPE'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          de_dupe?: boolean;
          deleted_at?: string | null;
          id?: number;
          limit?: number | null;
          mode?: Database['public']['Enums']['MODULE_OUTPUT_MODE'];
          module_id?: string;
          spotify_id?: string;
          type?: Database['public']['Enums']['SPOTIFY_OUTPUT_TYPE'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_outputs_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          }
        ];
      };
      module_sources: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string;
          limit: number | null;
          module_id: string | null;
          spotify_id: string;
          title: string;
          type: Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_url: string;
          limit?: number | null;
          module_id?: string | null;
          spotify_id: string;
          title: string;
          type: Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_url?: string;
          limit?: number | null;
          module_id?: string | null;
          spotify_id?: string;
          title?: string;
          type?: Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_sources_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          }
        ];
      };
      modules: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          is_running: boolean;
          name: string;
          next_scheduled_run: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          is_running?: boolean;
          name: string;
          next_scheduled_run?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          is_running?: boolean;
          name?: string;
          next_scheduled_run?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      recently_played_source_configs: {
        Row: {
          created_at: string;
          id: string;
          interval: Database['public']['Enums']['RECENTLY_PLAYED_INTERVAL'];
          quantity: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          interval: Database['public']['Enums']['RECENTLY_PLAYED_INTERVAL'];
          quantity: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          interval?: Database['public']['Enums']['RECENTLY_PLAYED_INTERVAL'];
          quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recently_played_source_configs_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'module_sources';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      UpsertModuleCombineAction: {
        Args: {
          p_module_id: string;
          p_order: number;
          p_sources: Json[];
          p_id?: string;
        };
        Returns: {
          config: Json;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at: string | null;
        };
      };
      UpsertModuleFilterAction: {
        Args: {
          p_module_id: string;
          p_order: number;
          p_sources: Json[];
          p_id?: string;
        };
        Returns: {
          config: Json;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at: string | null;
        };
      };
      UpsertModuleLimitAction: {
        Args: {
          p_module_id: string;
          p_order: number;
          p_limit: number;
          p_source_type?: Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'];
          p_id?: string;
        };
        Returns: {
          config: Json;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at: string | null;
        };
      };
      UpsertModuleShuffleAction: {
        Args: {
          p_module_id: string;
          p_order: number;
          p_shuffle_type: Database['public']['Enums']['SHUFFLE_TYPE'];
          p_id?: string;
        };
        Returns: {
          config: Json;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_url: string | null;
          module_id: string;
          order: number;
          title: string;
          type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
          updated_at: string | null;
        };
      };
    };
    Enums: {
      MODULE_ACTION_TYPE: 'FILTER' | 'SHUFFLE' | 'LIMIT' | 'COMBINE' | 'MODULE';
      MODULE_OUTPUT_MODE: 'REPLACE' | 'APPEND' | 'PREPEND';
      RECENTLY_PLAYED_INTERVAL: 'DAYS' | 'WEEKS' | 'MONTHS';
      SHUFFLE_TYPE: 'RANDOM';
      SPOTIFY_OUTPUT_TYPE: 'PLAYLIST';
      SPOTIFY_SOURCE_TYPE:
        | 'PLAYLIST'
        | 'TRACK'
        | 'ALBUM'
        | 'ARTIST'
        | 'RECENTLY_PLAYED'
        | 'LIKED_SONGS';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  spotify_auth: {
    Tables: {
      provider_session_data: {
        Row: {
          access: string;
          expires_at: string;
          refresh: string;
          user_id: string;
        };
        Insert: {
          access: string;
          expires_at: string;
          refresh: string;
          user_id: string;
        };
        Update: {
          access?: string;
          expires_at?: string;
          refresh?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      UpsertProviderData: {
        Args: {
          p_user_id: string;
          p_access?: string;
          p_refresh?: string;
          p_expires_at?: string;
        };
        Returns: {
          access: string;
          expires_at: string;
          refresh: string;
          user_id: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  spotify_cache: {
    Tables: {
      albums: {
        Row: {
          album_id: string;
          created_at: string;
          id: string;
          track_ids: string[];
        };
        Insert: {
          album_id: string;
          created_at?: string;
          id?: string;
          track_ids: string[];
        };
        Update: {
          album_id?: string;
          created_at?: string;
          id?: string;
          track_ids?: string[];
        };
        Relationships: [];
      };
      artists: {
        Row: {
          album_ids: string[];
          artist_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          album_ids?: string[];
          artist_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          album_ids?: string[];
          artist_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      playlists: {
        Row: {
          created_at: string;
          id: string;
          playlist_id: string;
          snapshot_id: string;
          track_ids: string[];
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          playlist_id: string;
          snapshot_id: string;
          track_ids: string[];
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          playlist_id?: string;
          snapshot_id?: string;
          track_ids?: string[];
          user_id?: string | null;
        };
        Relationships: [];
      };
      recently_listened: {
        Row: {
          id: string;
          played_at: string;
          saved_at: string;
          track_id: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          played_at: string;
          saved_at?: string;
          track_id: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          played_at?: string;
          saved_at?: string;
          track_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_tracks: {
        Row: {
          added_at: string;
          created_at: string;
          id: string;
          metadata: Json;
          track_id: string;
          user_id: string;
        };
        Insert: {
          added_at: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          track_id: string;
          user_id: string;
        };
        Update: {
          added_at?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          track_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_tracks_completion: {
        Row: {
          completed_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      DeleteOldRecentlyListened: {
        Args: {
          p_older_than: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
      PublicSchema['Views'])
  ? (PublicSchema['Tables'] &
      PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
  ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;
