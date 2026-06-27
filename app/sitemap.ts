import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Base routes
  const routes = [
    '',
    '/shop',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic product routes
  let productRoutes: any[] = [];
  try {
    const supabase = await createServerSupabaseClient();
    const { data: products } = await supabase
      .from('products_shop')
      .select('slug, created_at')
      .eq('is_active', true);

    if (products) {
      productRoutes = products.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Failed to query products for sitemap, using empty products list.', error);
  }

  return [...routes, ...productRoutes];
}
