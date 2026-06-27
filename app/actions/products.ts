'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth';

interface ProductInput {
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
}

export async function createProduct(input: ProductInput) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized admin permission required' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('products_shop')
      .insert({
        category_id: input.category_id || null,
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        stock: input.stock,
        gender: input.gender,
        size: input.size,
        color: input.color,
        image: input.image,
        is_active: input.is_active,
      });

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('products_shop')
      .update({
        category_id: input.category_id || null,
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        stock: input.stock,
        gender: input.gender,
        size: input.size,
        color: input.color,
        image: input.image,
        is_active: input.is_active,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath(`/product/${input.slug}`);
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('products_shop')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
