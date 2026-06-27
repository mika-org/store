import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client (used in client components)
// Uses fallback placeholders to avoid crashing Next.js build when environment variables are not yet set
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
