'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function uploadPaymentProof(orderId: string, proofUrl: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User is not authenticated' };
    }

    // Verify order owner
    const { data: order } = await supabase
      .from('orders_shop')
      .select('customer_id')
      .eq('id', orderId)
      .single();

    if (!order || order.customer_id !== user.id) {
      return { success: false, error: 'Unauthorized to update this order' };
    }

    // 1. Update the payments table
    const { error: paymentError } = await supabase
      .from('payments_shop')
      .update({
        payment_proof: proofUrl,
        status: 'Pending', // resets to pending verification
      })
      .eq('order_id', orderId);

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    // 2. Update the orders table payment status to Pending Verification
    const { error: orderError } = await supabase
      .from('orders_shop')
      .update({
        payment_status: 'Pending Verification',
      })
      .eq('id', orderId);

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error uploading payment proof:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
