import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client (used in client components)
// Uses fallback placeholders to avoid crashing Next.js build when environment variables are not yet set
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rgccflnozdvdmmxnshqv.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable__bPzOh_Pc7OTQDgFEfR22A_uRg4xNqX';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
