import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      // Query the database to check the user's role
      const { data: customer } = await supabase
        .from('customers_shop')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (customer?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return the user to an error page or home page if something goes wrong
  return NextResponse.redirect(new URL('/', request.url));
}
