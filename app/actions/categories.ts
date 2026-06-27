'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth';

interface CategoryInput {
  name: string;
  slug: string;
  image: string | null;
}

export async function createCategory(input: CategoryInput) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized admin permission required' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('categories_shop')
      .insert({
        name: input.name,
        slug: input.slug,
        image: input.image,
      });

    if (error) throw error;
    
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, input: CategoryInput) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('categories_shop')
      .update({
        name: input.name,
        slug: input.slug,
        image: input.image,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('categories_shop')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
