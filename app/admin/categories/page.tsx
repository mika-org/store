'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  image: z.string().url('Please enter a valid image URL').or(z.string().length(0)),
});

type CategoryInput = z.infer<typeof categorySchema>;

export default function CategoriesCrudPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories_shop')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Failed to load categories, using mock data:', error);
      // Fallback
      setCategories([
        { id: '11111111-1111-1111-1111-111111111111', name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Pants', slug: 'pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Jackets', slug: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: '', slug: '', image: '' });
    setErrorMsg(null);
    setFormOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('image', category.image || '');
    setErrorMsg(null);
    setFormOpen(true);
  };

  const onSubmit = async (data: CategoryInput) => {
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
    };

    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, payload);
    } else {
      result = await createCategory(payload);
    }

    if (result.success) {
      setFormOpen(false);
      reset();
      loadCategories();
    } else {
      setErrorMsg(result.error || 'Something went wrong.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect products in this category.')) return;
    
    const result = await deleteCategory(id);
    if (result.success) {
      loadCategories();
    } else {
      alert(result.error || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product segments and category cards</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4.5 w-4.5" /> Add Category
        </Button>
      </div>

      {/* Control / Search section */}
      <div className="flex relative max-w-sm">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* List Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No categories found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-xs font-semibold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="p-4 w-20">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/10">
                  <td className="p-4">
                    <div className="relative h-10 w-10 rounded overflow-hidden border border-border">
                      <Image
                        src={category.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold">{category.name}</td>
                  <td className="p-4 font-mono text-xs">{category.slug}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(category)} className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg">
                {editingCategory ? 'Edit Category' : 'Add Category'}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Category Name
                </label>
                <Input
                  placeholder="e.g. Jackets"
                  disabled={submitting}
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Category Slug
                </label>
                <Input
                  placeholder="e.g. jackets"
                  disabled={submitting}
                  {...register('slug')}
                  className={errors.slug ? 'border-destructive' : ''}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Image URL
                </label>
                <Input
                  placeholder="https://images.unsplash.com/... (optional)"
                  disabled={submitting}
                  {...register('image')}
                  className={errors.image ? 'border-destructive' : ''}
                />
                {errors.image && (
                  <p className="mt-1 text-xs text-destructive">{errors.image.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" type="button" onClick={() => setFormOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
