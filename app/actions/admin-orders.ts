'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth';

export async function updateOrderStatus(orderId: string, status: 'Pending' | 'Paid' | 'Packed' | 'Shipped' | 'Completed' | 'Cancelled') {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    // Update order status
    const { error } = await supabase
      .from('orders_shop')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;

    revalidatePath('/admin/orders');
    revalidatePath('/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(orderId: string, approved: boolean) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const supabase = await createServerSupabaseClient();

    const paymentStatus = approved ? 'Paid' : 'Unpaid';
    const orderStatus = approved ? 'Paid' : 'Cancelled';
    const paymentRecordStatus = approved ? 'Approved' : 'Rejected';

    // 1. Update payments table
    const { error: paymentError } = await supabase
      .from('payments_shop')
      .update({ status: paymentRecordStatus })
      .eq('order_id', orderId);

    if (paymentError) throw paymentError;

    // 2. Update orders table
    const { error: orderError } = await supabase
      .from('orders_shop')
      .update({
        payment_status: paymentStatus,
        status: orderStatus
      })
      .eq('id', orderId);

    if (orderError) throw orderError;

    revalidatePath('/admin/orders');
    revalidatePath('/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
