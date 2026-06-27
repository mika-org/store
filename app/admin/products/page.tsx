'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  gender: 'Men' | 'Women' | 'Unisex';
  size: string[];
  color: string[];
  image: string | null;
  is_active: boolean;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  category_id: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().min(0, 'Stock must be 0 or greater'),
  gender: z.enum(['Men', 'Women', 'Unisex']),
  sizeInput: z.string(), // comma separated, e.g. "S, M, L"
  colorInput: z.string(), // comma separated, e.g. "Black, White"
  description: z.string().optional(),
  image: z.string().url('Please enter a valid image URL').or(z.string().length(0)),
  is_active: z.boolean(),
});

type ProductInput = z.infer<typeof productSchema>;

export default function ProductsCrudPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories for dropdown
      const { data: dbCategories } = await supabase
        .from('categories_shop')
        .select('id, name')
        .order('name');
      if (dbCategories) setCategories(dbCategories);

      // 2. Fetch products
      const { data: dbProducts, error } = await supabase
        .from('products_shop')
        .select('*, categories_shop(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (dbProducts) {
        const formatted = dbProducts.map((p: any) => ({
          ...p,
          price: Number(p.price),
          categoryName: p.categories_shop?.name || 'Uncategorized'
        }));
        setProducts(formatted);
      }
    } catch (error) {
      console.error('Failed to load products/categories from DB. Using mock data.', error);
      // Fallback
      setCategories([
        { id: '11111111-1111-1111-1111-111111111111', name: 'T-Shirts' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Hoodies' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Pants' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Jackets' },
      ]);
      setProducts([
        { id: 'a1111111-1111-1111-1111-111111111111', category_id: '11111111-1111-1111-1111-111111111111', name: 'Classic White Tee', slug: 'classic-white-tee', description: 'Organic cotton white tee.', price: 150000, stock: 50, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['White'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100', is_active: true, categoryName: 'T-Shirts' },
        { id: 'a1111112-1111-1111-1111-111111111112', category_id: '11111111-1111-1111-1111-111111111111', name: 'Vintage Black Tee', slug: 'vintage-black-tee', description: 'Premium heavyweight faded black tee.', price: 180000, stock: 30, gender: 'Unisex', size: ['M', 'L', 'XL'], color: ['Black'], image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100', is_active: true, categoryName: 'T-Shirts' },
        { id: 'a2222221-2222-2222-2222-222222222221', category_id: '22222222-2222-2222-2222-222222222222', name: 'Oversized Grey Hoodie', slug: 'oversized-grey-hoodie', description: 'Cozy oversized fleece hoodie.', price: 350000, stock: 40, gender: 'Unisex', size: ['S', 'M', 'L', 'XL'], color: ['Grey'], image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100', is_active: true, categoryName: 'Hoodies' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      price: 0,
      stock: 0,
      gender: 'Unisex',
      sizeInput: 'S, M, L, XL',
      colorInput: 'Black, White, Grey',
      description: '',
      image: '',
      is_active: true,
    });
    setErrorMsg(null);
    setFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('slug', product.slug);
    setValue('category_id', product.category_id);
    setValue('price', product.price);
    setValue('stock', product.stock);
    setValue('gender', product.gender);
    setValue('sizeInput', product.size.join(', '));
    setValue('colorInput', product.color.join(', '));
    setValue('description', product.description || '');
    setValue('image', product.image || '');
    setValue('is_active', product.is_active);
    setErrorMsg(null);
    setFormOpen(true);
  };

  const onSubmit = async (data: ProductInput) => {
    setSubmitting(true);
    setErrorMsg(null);

    // Parse array variables
    const size = data.sizeInput.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    const color = data.colorInput.split(',').map((c) => c.trim()).filter((c) => c.length > 0);

    const payload = {
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      stock: data.stock,
      gender: data.gender,
      size,
      color,
      image: data.image || null,
      is_active: data.is_active,
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result.success) {
      setFormOpen(false);
      reset();
      loadData();
    } else {
      setErrorMsg(result.error || 'Something went wrong.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const result = await deleteProduct(id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || 'Failed to delete product');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage catalog inventory, sizes, and pricing</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4.5 w-4.5" /> Add Product
        </Button>
      </div>

      {/* Filter / Search section */}
      <div className="flex relative max-w-sm">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Grid List / Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-xs font-semibold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="p-4 w-20">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/10">
                  <td className="p-4">
                    <div className="relative h-12 w-12 rounded overflow-hidden border border-border">
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-xs font-semibold">{product.categoryName}</td>
                  <td className="p-4 font-bold">{formatCurrency(product.price)}</td>
                  <td className="p-4">{product.stock} pcs</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${product.is_active ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(product)} className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Product Name
                  </label>
                  <Input
                    placeholder="e.g. Premium Fleece Hoodie"
                    disabled={submitting}
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Slug
                  </label>
                  <Input
                    placeholder="e.g. premium-fleece-hoodie"
                    disabled={submitting}
                    {...register('slug')}
                    className={errors.slug ? 'border-destructive' : ''}
                  />
                  {errors.slug && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Category
                  </label>
                  <select
                    disabled={submitting}
                    {...register('category_id')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Gender Segment
                  </label>
                  <select
                    disabled={submitting}
                    {...register('gender')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Price (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="150000"
                    disabled={submitting}
                    {...register('price')}
                    className={errors.price ? 'border-destructive' : ''}
                  />
                  {errors.price && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    disabled={submitting}
                    {...register('stock')}
                    className={errors.stock ? 'border-destructive' : ''}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.stock.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Sizes Options
                  </label>
                  <Input
                    placeholder="S, M, L, XL (comma separated)"
                    disabled={submitting}
                    {...register('sizeInput')}
                    className={errors.sizeInput ? 'border-destructive' : ''}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Colors Options
                  </label>
                  <Input
                    placeholder="Black, White, Blue (comma separated)"
                    disabled={submitting}
                    {...register('colorInput')}
                    className={errors.colorInput ? 'border-destructive' : ''}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Image URL
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/... (required for display)"
                    disabled={submitting}
                    {...register('image')}
                    className={errors.image ? 'border-destructive' : ''}
                  />
                  {errors.image && (
                    <p className="mt-1 text-[10px] text-destructive">{errors.image.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe product materials, cut, and styles..."
                    disabled={submitting}
                    {...register('description')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    disabled={submitting}
                    {...register('is_active')}
                    className="h-4 w-4 rounded border-input focus:ring-ring"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
                    Active (visible in Catalog)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border mt-4">
                <Button variant="ghost" type="button" onClick={() => setFormOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
