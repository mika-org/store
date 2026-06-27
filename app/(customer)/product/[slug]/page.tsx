import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ProductPurchaseSection from '@/components/product-purchase-section';
import { Star, ArrowLeft, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

// Mock data fallbacks for when Supabase is not connected
const MOCK_PRODUCTS = [
  { id: 'a1111111-1111-1111-1111-111111111111', category_id: '11111111-1111-1111-1111-111111111111', name: 'Classic White Tee', slug: 'classic-white-tee', description: 'A timeless, comfortable, and durable white crewneck t-shirt made of 100% organic cotton. Pre-shrunk fabric to keep its shape after washes.', price: 150000, stock: 50, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['White'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'T-Shirts' },
  { id: 'a1111112-1111-1111-1111-111111111112', category_id: '11111111-1111-1111-1111-111111111111', name: 'Vintage Black Tee', slug: 'vintage-black-tee', description: 'Slightly faded black graphic t-shirt crafted with a premium heavyweight cotton blend.', price: 180000, stock: 30, gender: 'Unisex', size: ['M', 'L', 'XL'], color: ['Black'], image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'T-Shirts' },
  { id: 'a1111113-1111-1111-1111-111111111113', category_id: '11111111-1111-1111-1111-111111111111', name: 'Stripped Cotton Shirt', slug: 'stripped-cotton-shirt', description: 'Slim-fit striped casual t-shirt for daily comfort.', price: 175000, stock: 25, gender: 'Men', size: ['S', 'M', 'L'], color: ['Blue', 'White'], image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'T-Shirts' },
  { id: 'a2222221-2222-2222-2222-222222222221', category_id: '22222222-2222-2222-2222-222222222222', name: 'Oversized Grey Hoodie', slug: 'oversized-grey-hoodie', description: 'Cozy oversized fleece hoodie featuring a double-lined hood and spacious kangaroo pocket.', price: 350000, stock: 40, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['Grey'], image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Hoodies' },
  { id: 'a2222222-2222-2222-2222-222222222222', category_id: '22222222-2222-2222-2222-222222222222', name: 'Pastel Pink Hoodie', slug: 'pastel-pink-hoodie', description: 'Soft pastel pink cotton hoodie, perfect for relaxed layering.', price: 320000, stock: 15, gender: 'Women', size: ['XS', 'S', 'M'], color: ['Pink'], image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Hoodies' },
  { id: 'a3333331-3333-3333-3333-333333333331', category_id: '33333333-3333-3333-3333-333333333333', name: 'Relaxed Denim Jeans', slug: 'relaxed-denim-jeans', description: 'Vintage-wash relaxed fit denim jeans with a straight leg cut.', price: 450000, stock: 35, gender: 'Men', size: ['S', 'M', 'L'], color: ['Blue'], image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Pants' },
  { id: 'a3333332-3333-3333-3333-333333333332', category_id: '33333333-3333-3333-3333-333333333333', name: 'Cargo Jogger Pants', slug: 'cargo-jogger-pants', description: 'Utility cargo joggers featuring multiple pockets and elastic ankle cuffs.', price: 380000, stock: 20, gender: 'Unisex', size: ['S', 'M', 'L'], color: ['Black', 'Green'], image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Pants' },
  { id: 'a4444441-4444-4444-4444-444444444441', category_id: '44444444-4444-4444-4444-444444444444', name: 'Classic Leather Bomber', slug: 'classic-leather-bomber', description: 'Premium genuine leather bomber jacket with ribbed collar and zipped cuffs.', price: 1200000, stock: 10, gender: 'Men', size: ['M', 'L', 'XL'], color: ['Black', 'Brown'], image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Jackets' },
  { id: 'a4444442-4444-4444-4444-444444444442', category_id: '44444444-4444-4444-4444-444444444444', name: 'Windbreaker Shell Jacket', slug: 'windbreaker-shell-jacket', description: 'Water-resistant lightweight windbreaker featuring adjustable toggle hood.', price: 290000, stock: 30, gender: 'Unisex', size: ['S', 'M', 'L'], color: ['Yellow', 'Black'], image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80', is_active: true, categoryName: 'Jackets' },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
  let name = mockProduct?.name || 'Product Details';
  let description = mockProduct?.description || '';
  let image = mockProduct?.image || '';

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('products_shop')
      .select('name, description, image')
      .eq('slug', slug)
      .single();
    if (data) {
      name = data.name;
      description = data.description || '';
      image = data.image || '';
    }
  } catch (error) {
    // ignore
  }

  return {
    title: `${name} | ATELIER`,
    description,
    openGraph: {
      title: name,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: any = null;
  let productImages: string[] = [];
  let relatedProducts: any[] = [];
  let isDbConnected = false;

  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch product details
    const { data: dbProduct } = await supabase
      .from('products_shop')
      .select('*, categories_shop(name)')
      .eq('slug', slug)
      .single();

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        category_id: dbProduct.category_id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        price: Number(dbProduct.price),
        stock: dbProduct.stock,
        gender: dbProduct.gender,
        size: dbProduct.size || [],
        color: dbProduct.color || [],
        image: dbProduct.image,
        categoryName: dbProduct.categories_shop?.name || 'Apparel'
      };
      isDbConnected = true;

      // Fetch product multi images
      const { data: dbImages } = await supabase
        .from('product_images_shop')
        .select('image_url')
        .eq('product_id', product.id);

      if (dbImages && dbImages.length > 0) {
        productImages = dbImages.map((img: any) => img.image_url);
      } else if (product.image) {
        productImages = [product.image];
      }

      // Fetch related products
      const { data: dbRelated } = await supabase
        .from('products_shop')
        .select('id, name, slug, price, image, categories_shop(name)')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .eq('is_active', true)
        .limit(4);

      if (dbRelated) {
        relatedProducts = dbRelated.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          image: p.image,
          categoryName: p.categories_shop?.name || 'Apparel'
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load detail page from database. Using mock data.', error);
  }

  // Fallback if not database connected
  if (!isDbConnected) {
    const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (mockProduct) {
      product = mockProduct;
      productImages = [product.image];
      
      relatedProducts = MOCK_PRODUCTS.filter(
        (p) => p.category_id === product.category_id && p.id !== product.id
      ).slice(0, 4);
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      {/* Back button */}
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div className="relative h-[400px] md:h-[550px] w-full rounded-2xl overflow-hidden bg-muted/20 border border-border shadow-sm">
            <Image
              src={productImages[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-w-768px) 100vw, 50vw"
            />
          </div>

          {/* Gallery selector thumbnail list */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-85"
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} gallery ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted px-2.5 py-1 rounded-full">
              {product.categoryName}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">{product.name}</h1>
            
            {/* Review placeholder display */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 text-muted" />
              </div>
              <span className="text-xs text-muted-foreground">(12 verified customer reviews)</span>
            </div>
          </div>

          <div className="text-2xl font-extrabold text-foreground">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
          </div>

          <hr className="border-border" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <hr className="border-border" />

          {/* Purchasing Form Actions Client Component */}
          <ProductPurchaseSection product={product} />

          <hr className="border-border" />

          {/* Quality Guarantees */}
          <div className="rounded-xl border border-border/70 p-4 space-y-3 bg-muted/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div className="text-xs">
                <span className="font-semibold block">Quality Assured</span>
                <span className="text-muted-foreground">Every piece is verified for sewing strength and colorfastness.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 border-t border-border pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-center md:text-left">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                <Link href={`/product/${p.slug}`} className="relative h-[200px] sm:h-[280px] w-full overflow-hidden block">
                  <Image
                    src={p.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-w-768px) 50vw, 25vw"
                  />
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase block">{p.categoryName}</span>
                    <Link href={`/product/${p.slug}`} className="text-sm font-semibold hover:underline block line-clamp-1">
                      {p.name}
                    </Link>
                    <p className="text-sm font-bold mt-1">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                    </p>
                  </div>
                  <Link href={`/product/${p.slug}`} className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
