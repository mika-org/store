import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Search, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';
const ITEMS_PER_PAGE = 8;

const MOCK_CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'T-Shirts', slug: 't-shirts' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Hoodies', slug: 'hoodies' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Pants', slug: 'pants' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Jackets', slug: 'jackets' },
];

const MOCK_PRODUCTS = [
  { id: 'a1111111-1111-1111-1111-111111111111', category_id: '11111111-1111-1111-1111-111111111111', name: 'Classic White Tee', slug: 'classic-white-tee', description: 'Organic cotton white tee.', price: 150000, stock: 50, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['White'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a1111112-1111-1111-1111-111111111112', category_id: '11111111-1111-1111-1111-111111111111', name: 'Vintage Black Tee', slug: 'vintage-black-tee', description: 'Premium heavyweight faded black tee.', price: 180000, stock: 30, gender: 'Unisex', size: ['M', 'L', 'XL'], color: ['Black'], image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-02T00:00:00Z' },
  { id: 'a1111113-1111-1111-1111-111111111113', category_id: '11111111-1111-1111-1111-111111111111', name: 'Stripped Cotton Shirt', slug: 'stripped-cotton-shirt', description: 'Slim-fit striped casual t-shirt.', price: 175000, stock: 25, gender: 'Men', size: ['S', 'M', 'L'], color: ['Blue', 'White'], image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-03T00:00:00Z' },
  { id: 'a2222221-2222-2222-2222-222222222221', category_id: '22222222-2222-2222-2222-222222222222', name: 'Oversized Grey Hoodie', slug: 'oversized-grey-hoodie', description: 'Cozy oversized fleece hoodie.', price: 350000, stock: 40, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['Grey'], image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-04T00:00:00Z' },
  { id: 'a2222222-2222-2222-2222-222222222222', category_id: '22222222-2222-2222-2222-222222222222', name: 'Pastel Pink Hoodie', slug: 'pastel-pink-hoodie', description: 'Soft pink cotton hoodie.', price: 320000, stock: 15, gender: 'Women', size: ['XS', 'S', 'M'], color: ['Pink'], image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-05T00:00:00Z' },
  { id: 'a3333331-3333-3333-3333-333333333331', category_id: '33333333-3333-3333-3333-333333333333', name: 'Relaxed Denim Jeans', slug: 'relaxed-denim-jeans', description: 'Straight leg relaxed jeans.', price: 450000, stock: 35, gender: 'Men', size: ['S', 'M', 'L'], color: ['Blue'], image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-06T00:00:00Z' },
  { id: 'a3333332-3333-3333-3333-333333333332', category_id: '33333333-3333-3333-3333-333333333333', name: 'Cargo Jogger Pants', slug: 'cargo-jogger-pants', description: 'Elastic waist cargo jogger pants.', price: 380000, stock: 20, gender: 'Unisex', size: ['S', 'M', 'L'], color: ['Black', 'Green'], image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-07T00:00:00Z' },
  { id: 'a4444441-4444-4444-4444-444444444441', category_id: '44444444-4444-4444-4444-444444444444', name: 'Classic Leather Bomber', slug: 'classic-leather-bomber', description: 'Premium genuine leather bomber jacket.', price: 1200000, stock: 10, gender: 'Men', size: ['M', 'L', 'XL'], color: ['Black', 'Brown'], image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-08T00:00:00Z' },
  { id: 'a4444442-4444-4444-4444-444444444442', category_id: '44444444-4444-4444-4444-444444444444', name: 'Windbreaker Shell Jacket', slug: 'windbreaker-shell-jacket', description: 'Lightweight water-resistant windbreaker.', price: 290000, stock: 30, gender: 'Unisex', size: ['S', 'M', 'L'], color: ['Yellow', 'Black'], image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80', is_active: true, created_at: '2026-01-09T00:00:00Z' },
];

interface FilterOptions {
  search?: string;
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  gender: string;
  size: string[];
  color: string[];
  image: string | null;
  is_active: boolean;
  created_at: string;
  categoryName?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const filters: FilterOptions = {
    search: typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined,
    category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
    gender: typeof resolvedParams.gender === 'string' ? resolvedParams.gender : undefined,
    size: typeof resolvedParams.size === 'string' ? resolvedParams.size : undefined,
    color: typeof resolvedParams.color === 'string' ? resolvedParams.color : undefined,
    minPrice: resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined,
    maxPrice: resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined,
    sort: typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest',
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
  };

  let categories = MOCK_CATEGORIES;
  let products: Product[] = MOCK_PRODUCTS;
  let totalProducts = products.length;
  let isDbConnected = false;

  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch categories
    const { data: dbCategories } = await supabase.from('categories_shop').select('*');
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
      isDbConnected = true;
    }

    // Build query for products
    if (isDbConnected) {
      let query = supabase
        .from('products_shop')
        .select('id, name, slug, price, stock, gender, size, color, image, categories_shop(name, slug)', { count: 'exact' })
        .eq('is_active', true);

      // Filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.filter('categories_shop.slug', 'eq', filters.category);
      }

      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }

      if (filters.size) {
        query = query.contains('size', [filters.size]);
      }

      if (filters.color) {
        query = query.contains('color', [filters.color]);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Sort
      if (filters.sort === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sort === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = ((filters.page || 1) - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: dbProducts, count } = await query;
      
      if (dbProducts) {
        products = dbProducts.map((p: any) => ({
          id: p.id,
          category_id: '',
          name: p.name,
          slug: p.slug,
          description: '',
          price: Number(p.price),
          stock: p.stock,
          gender: p.gender,
          size: p.size,
          color: p.color,
          image: p.image,
          is_active: true,
          created_at: '',
          categoryName: p.categories_shop?.name
        }));
        totalProducts = count || products.length;
      }
    }
  } catch (error) {
    console.error('Failed to fetch from DB. Using mock sorting and filtering.', error);
  }

  // Fallback local JavaScript filtering if DB is not connected or fails
  if (!isDbConnected) {
    let filtered = [...MOCK_PRODUCTS];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }

    if (filters.category) {
      const cat = categories.find(c => c.slug === filters.category);
      if (cat) {
        filtered = filtered.filter(p => p.category_id === cat.id);
      }
    }

    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    if (filters.size) {
      filtered = filtered.filter(p => p.size.includes(filters.size!));
    }

    if (filters.color) {
      filtered = filtered.filter(p => p.color.includes(filters.color!));
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }

    // Sort
    if (filters.sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    totalProducts = filtered.length;

    // Paginate
    const startIndex = ((filters.page || 1) - 1) * ITEMS_PER_PAGE;
    products = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  const COLORS = ['Black', 'White', 'Blue', 'Grey', 'Pink', 'Green', 'Brown', 'Yellow'];
  const GENDERS = ['Men', 'Women', 'Unisex'];

  // Helper function to build URL queries
  const createQueryString = (name: string, value: string | number | null) => {
    const params = new URLSearchParams();
    // Copy existing params
    Object.entries(resolvedParams).forEach(([key, val]) => {
      if (val !== undefined && typeof val === 'string') {
        params.set(key, val);
      }
    });

    if (value === null || value === '') {
      params.delete(name);
    } else {
      params.set(name, String(value));
    }
    
    // Reset to page 1 on filter changes
    if (name !== 'page') {
      params.set('page', '1');
    }

    return `/shop?${params.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Showing {products.length} of {totalProducts} products</p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-xs font-semibold text-muted-foreground uppercase">Sort By</label>
          <select
            id="sort"
            value={filters.sort || 'newest'}
            onChange={(e) => {
              // Construct redirection client-side via simple server side navigation
              window.location.href = createQueryString('sort', e.target.value);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:border-r lg:border-border lg:pr-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5" /> Filters
            </h2>
            <Link href="/shop" className="text-xs text-muted-foreground hover:underline">
              Clear All
            </Link>
          </div>

          <hr className="border-border" />

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Category</h3>
            <div className="flex flex-col space-y-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={filters.category === c.slug ? createQueryString('category', null) : createQueryString('category', c.slug)}
                  className={`text-sm ${filters.category === c.slug ? 'font-bold text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Gender Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Gender</h3>
            <div className="flex flex-col space-y-2">
              {GENDERS.map((g) => (
                <Link
                  key={g}
                  href={filters.gender === g ? createQueryString('gender', null) : createQueryString('gender', g)}
                  className={`text-sm ${filters.gender === g ? 'font-bold text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Size Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <Link
                  key={s}
                  href={filters.size === s ? createQueryString('size', null) : createQueryString('size', s)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs font-semibold ${filters.size === s ? 'border-foreground bg-foreground text-background' : 'border-input hover:border-foreground'}`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <Link
                  key={c}
                  href={filters.color === c ? createQueryString('color', null) : createQueryString('color', c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${filters.color === c ? 'border-foreground bg-foreground text-background' : 'border-input hover:border-foreground'}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min Rp"
                id="minPriceInput"
                defaultValue={filters.minPrice || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="number"
                placeholder="Max Rp"
                id="maxPriceInput"
                defaultValue={filters.maxPrice || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
            <Button
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={() => {
                // Client-side retrieve values from input fields and reload page
                const minVal = (document.getElementById('minPriceInput') as HTMLInputElement)?.value;
                const maxVal = (document.getElementById('maxPriceInput') as HTMLInputElement)?.value;
                
                const url = new URL(window.location.href);
                if (minVal) url.searchParams.set('minPrice', minVal);
                else url.searchParams.delete('minPrice');
                
                if (maxVal) url.searchParams.set('maxPrice', maxVal);
                else url.searchParams.delete('maxPrice');
                
                url.searchParams.set('page', '1');
                window.location.href = url.pathname + url.search;
              }}
            >
              Apply Price
            </Button>
          </div>
        </div>

        {/* Products Grid Section */}
        <div className="lg:col-span-3 space-y-12">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Try clearing some filters or search for something else.
              </p>
              <Link href="/shop" className="mt-4">
                <Button size="sm">Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <Link href={`/product/${product.slug}`} className="relative h-[200px] sm:h-[280px] w-full overflow-hidden block">
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-w-768px) 50vw, 33vw"
                      />
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                          {product.categoryName || 'Apparel'}
                        </span>
                        <Link href={`/product/${product.slug}`} className="text-sm font-semibold hover:underline block line-clamp-1">
                          {product.name}
                        </Link>
                        <p className="text-sm font-bold mt-1">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                        </p>
                      </div>
                      <Link href={`/product/${product.slug}`} className="mt-4 block">
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  {/* Prev */}
                  <Link
                    href={createQueryString('page', Math.max(1, (filters.page || 1) - 1))}
                    className={`px-3 py-1.5 border border-border rounded-md text-xs font-semibold ${(filters.page || 1) <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
                  >
                    Previous
                  </Link>

                  {/* Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={createQueryString('page', p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold ${p === (filters.page || 1) ? 'bg-foreground text-background border-foreground' : 'border-input hover:bg-muted'}`}
                    >
                      {p}
                    </Link>
                  ))}

                  {/* Next */}
                  <Link
                    href={createQueryString('page', Math.min(totalPages, (filters.page || 1) + 1))}
                    className={`px-3 py-1.5 border border-border rounded-md text-xs font-semibold ${(filters.page || 1) >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
