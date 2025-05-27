import { HTTPException } from '@hono/http-exception';
import { Database } from './database.gen.ts';
import { SchemaName } from './constants.ts';
import { User, createClient } from '@supabase/supabase-js';

export const setupSupabase = ({ authHeader }: { authHeader?: string }) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    const message = 'Missing Supabase environment variables';
    console.error(message);
    throw new HTTPException(500, { message });
  }

  const supabaseClient = createClient<
    Database,
    SchemaName,
    Database[SchemaName]
  >(
    supabaseUrl,
    supabaseAnonKey,
    authHeader
      ? { global: { headers: { Authorization: authHeader } } }
      : undefined
  );

  return { supabaseClient };
};

export const setupSupabaseWithUser = async ({
  authHeader,
}: {
  authHeader: string;
}): Promise<ReturnType<typeof setupSupabase> & { user: User }> => {
  const { supabaseClient } = setupSupabase({ authHeader });
  const token = authHeader.replace('Bearer ', '');

  const {
    data: { user },
  } = await supabaseClient.auth.getUser(token);
  if (!user) {
    throw new HTTPException(500, {
      message: 'Error fetching user from auth header',
    });
  }

  return { supabaseClient, user };
};
