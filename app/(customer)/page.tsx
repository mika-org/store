import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';

// Mock data fallbacks for when Supabase credentials are not connected yet
const MOCK_CATEGORIES = [
  { id: '1', name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Pants', slug: 'pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60' },
  { id: '4', name: 'Jackets', slug: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60' },
];

const MOCK_PRODUCTS = [
  { id: 'a1', name: 'Classic White Tee', slug: 'classic-white-tee', price: 150000, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80', categories: { name: 'T-Shirts' } },
  { id: 'a2', name: 'Oversized Grey Hoodie', slug: 'oversized-grey-hoodie', price: 350000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=80', categories: { name: 'Hoodies' } },
  { id: 'a3', name: 'Relaxed Denim Jeans', slug: 'relaxed-denim-jeans', price: 450000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80', categories: { name: 'Pants' } },
  { id: 'a4', name: 'Classic Leather Bomber', slug: 'classic-leather-bomber', price: 1200000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80', categories: { name: 'Jackets' } },
];

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let categories = MOCK_CATEGORIES;
  let featuredProducts = MOCK_PRODUCTS;
  
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch categories
    const { data: dbCategories } = await supabase
      .from('categories_shop')
      .select('*')
      .limit(4);
      
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
    }
    
    // Fetch featured products
    const { data: dbProducts } = await supabase
      .from('products_shop')
      .select('id, name, slug, price, image, categories_shop(name)')
      .eq('is_active', true)
      .limit(4);
      
    if (dbProducts && dbProducts.length > 0) {
      featuredProducts = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image: p.image,
        categories: p.categories_shop || { name: 'Uncategorized' }
      }));
    }
  } catch (error) {
    console.error('Failed to load landing page data from database. Using mock data.', error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative bg-muted/40 py-20 md:py-32 overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-muted rounded-full">
              New Season Arrivals
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Timeless Design.<br />Uncompromising Quality.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
              Discover our collection of minimal and premium essentials made from 100% organic materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Shop Collection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop?gender=Women">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Women's
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[350px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-lg group">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80"
              alt="Hero image"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-w-768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Store Features Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4">
            <div className="rounded-full bg-muted p-3">
              <Truck className="h-6 w-6 text-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-muted-foreground">On all orders over Rp 500.000 across Indonesia.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4">
            <div className="rounded-full bg-muted p-3">
              <RefreshCw className="h-6 w-6 text-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">30-Day Easy Returns</h4>
              <p className="text-xs text-muted-foreground">Return or exchange any unworn items within 30 days.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4">
            <div className="rounded-full bg-muted p-3">
              <ShieldCheck className="h-6 w-6 text-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Secure Payment System</h4>
              <p className="text-xs text-muted-foreground">Encrypted payments supporting bank transfer & e-wallets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
              <p className="text-sm text-muted-foreground">Explore our tailored segments designed for your daily routine.</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-1.5 text-sm font-semibold text-primary">
              View All Products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative h-[250px] md:h-[350px] w-full rounded-xl overflow-hidden shadow-sm flex items-end p-4 border border-border/50"
              >
                <Image
                  src={category.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-w-768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="relative z-10 w-full text-white">
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  <span className="text-xs text-white/80 group-hover:underline flex items-center gap-1 mt-1">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-muted/10 border-t border-border">
        <div className="container mx-auto px-4 space-y-12">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
            <p className="text-sm text-muted-foreground">Freshly curated garments featuring our latest seasonal cuts.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                <Link href={`/product/${product.slug}`} className="relative h-[250px] md:h-[350px] w-full overflow-hidden block">
                  <Image
                    src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-w-768px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm">
                    {product.categories.name}
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Link href={`/product/${product.slug}`} className="text-sm font-semibold hover:underline block line-clamp-1">
                      {product.name}
                    </Link>
                    <p className="text-sm font-bold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                    </p>
                  </div>
                  <Link href={`/product/${product.slug}`} className="mt-4 block">
                    <Button variant="outline" className="w-full text-xs font-semibold py-1 gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ethos / Banner Section */}
      <section className="relative bg-foreground py-20 text-background text-center overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
            alt="Atelier workshop"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 max-w-xl space-y-6 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">Sustainability At Our Core</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Every thread, button, and dye is sourced from suppliers adhering to the highest environmental standard. We design products built to last, reducing fashion waste one garment at a time.
          </p>
          <Link href="/shop" className="inline-block pt-2">
            <Button variant="secondary" size="lg" className="font-semibold">
              Browse Sustainable Apparel
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
