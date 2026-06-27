'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSessionUser } from './auth';

interface OrderItemInput {
  productId: string;
  qty: number;
  price: number;
}

interface PlaceOrderInput {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: string;
  items: OrderItemInput[];
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}

export async function placeOrder(input: PlaceOrderInput) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: 'User is not authenticated' };
    }

    const supabase = await createServerSupabaseClient();

    // 1. Update customer profile details if needed
    await supabase
      .from('users_shop')
      .update({
        full_name: input.fullName,
        phone: input.phone,
        address: input.address,
        city: input.city,
        province: input.province,
        postal_code: input.postalCode,
      })
      .eq('id', user.id);

    // 2. Generate a unique invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    // 3. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders_shop')
      .insert({
        customer_id: user.id,
        invoice_number: invoiceNumber,
        total_price: input.totalPrice,
        shipping_cost: input.shippingCost,
        grand_total: input.grandTotal,
        status: 'Pending',
        payment_status: 'Unpaid',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }

    // 4. Create the order items
    const orderItems = input.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      qty: item.qty,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items_shop')
      .insert(orderItems);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // 5. Create payment entry
    const { error: paymentError } = await supabase
      .from('payments_shop')
      .insert({
        order_id: order.id,
        payment_method: input.paymentMethod,
        status: 'Pending',
      });

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    // 6. Reduce stock of products (optional but professional)
    for (const item of input.items) {
      const { data: prod } = await supabase
        .from('products_shop')
        .select('stock')
        .eq('id', item.productId)
        .single();
      
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.qty);
        await supabase
          .from('products_shop')
          .update({ stock: newStock })
          .eq('id', item.productId);
      }
    }

    return { success: true, orderId: order.id, invoiceNumber };
  } catch (error: any) {
    console.error('Error placing order:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
