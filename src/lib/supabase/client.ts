import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { Database } from "@/types/supabase";

export const createBrowserClient = () => {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-client-info': 'supabase-js-web',
        },
      },
    }
  );
};
