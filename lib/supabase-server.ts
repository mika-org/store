import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client (used in server components, server actions, route handlers)
// Uses fallback placeholders to avoid crashing Next.js build when environment variables are not yet set
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rgccflnozdvdmmxnshqv.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable__bPzOh_Pc7OTQDgFEfR22A_uRg4xNqX';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have a proxy/middleware refreshing user sessions.
          }
        },
      },
    }
  );
};
