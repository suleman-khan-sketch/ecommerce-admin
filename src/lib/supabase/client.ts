import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { Database } from "@/types/supabase";

let clientInstance: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null;

export const createBrowserClient = () => {
  // Return existing instance if available (singleton pattern)
  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  );

  return clientInstance;
};
