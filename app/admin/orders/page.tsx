'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { updateOrderStatus, verifyPayment } from '@/app/actions/admin-orders';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt, ChevronDown, ChevronUp, Check, X, Search, ExternalLink } from 'lucide-react';

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  products: {
    name: string;
  };
}

interface Order {
  id: string;
  invoice_number: string;
  total_price: number;
  shipping_cost: number;
  grand_total: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
  customers: {
    email: string;
    full_name: string;
  } | null;
  payments: {
    payment_method: string;
    payment_proof: string | null;
    status: string;
  } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  const loadOrders = async () => {
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders_shop')
        .select(`
          id,
          invoice_number,
          total_price,
          shipping_cost,
          grand_total,
          status,
          payment_status,
          created_at,
          order_items_shop (
            id,
            qty,
            price,
            products_shop (
              name
            )
          ),
          customers_shop (
            email,
            full_name
          ),
          payments_shop (
            payment_method,
            payment_proof,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (dbOrders) {
        const formatted: Order[] = dbOrders.map((o: any) => ({
          id: o.id,
          invoice_number: o.invoice_number,
          total_price: Number(o.total_price),
          shipping_cost: Number(o.shipping_cost),
          grand_total: Number(o.grand_total),
          status: o.status,
          payment_status: o.payment_status,
          created_at: o.created_at,
          order_items: (o.order_items_shop || []).map((oi: any) => ({
            id: oi.id,
            qty: oi.qty,
            price: Number(oi.price),
            products: oi.products_shop || { name: 'Deleted Product' }
          })),
          customers: o.customers_shop || { email: 'Guest', full_name: 'Guest Customer' },
          payments: o.payments_shop ? {
            payment_method: o.payments_shop.payment_method,
            payment_proof: o.payments_shop.payment_proof,
            status: o.payments_shop.status
          } : null
        }));
        setOrders(formatted);
      }
    } catch (error) {
      console.error('Failed to load orders from DB. Using mock data.', error);
      // Fallback
      setOrders([
        {
          id: '1',
          invoice_number: 'INV-20260626-4100',
          total_price: 350000,
          shipping_cost: 120000,
          grand_total: 470000,
          status: 'Paid',
          payment_status: 'Paid',
          created_at: '2026-06-26T07:15:20Z',
          order_items: [
            { id: 'oi1', qty: 1, price: 350000, products: { name: 'Oversized Grey Hoodie' } }
          ],
          customers: { email: 'customer@example.com', full_name: 'John Doe' },
          payments: { payment_method: 'Bank Transfer', payment_proof: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', status: 'Approved' }
        },
        {
          id: '2',
          invoice_number: 'INV-20260625-9031',
          total_price: 1200000,
          shipping_cost: 0,
          grand_total: 1200000,
          status: 'Pending',
          payment_status: 'Pending Verification',
          created_at: '2026-06-25T11:20:45Z',
          order_items: [
            { id: 'oi2', qty: 1, price: 1200000, products: { name: 'Classic Leather Bomber' } }
          ],
          customers: { email: 'alice@example.com', full_name: 'Alice Cooper' },
          payments: { payment_method: 'Bank Transfer', payment_proof: 'https://images.unsplash.com/photo-1548883354-7622d03aca27', status: 'Pending' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: any) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, status);
    if (result.success) {
      loadOrders();
    } else {
      alert(result.error || 'Failed to update order status');
    }
    setUpdatingId(null);
  };

  const handlePaymentVerify = async (orderId: string, approved: boolean) => {
    setUpdatingId(orderId);
    const result = await verifyPayment(orderId, approved);
    if (result.success) {
      loadOrders();
    } else {
      alert(result.error || 'Failed to verify payment');
    }
    setUpdatingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'Paid': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'Packed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Completed': return 'bg-green-600/10 text-green-700 dark:text-green-300 border-green-600/20';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customers?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customers?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const orderStatuses = ['Pending', 'Paid', 'Packed', 'Shipped', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Verify bank transfer payments and dispatch catalog orders</p>
      </div>

      {/* Control / Search */}
      <div className="flex relative max-w-sm">
        <input
          type="text"
          placeholder="Search invoice or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Grid list table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const hasProof = !!order.payments?.payment_proof;
            const needsVerification = order.payment_status === 'Pending Verification';

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Master row */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{order.invoice_number}</span>
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {needsVerification && (
                        <span className="text-[10px] font-bold bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded-full">
                          Verif Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.customers?.full_name} ({order.customers?.email}) • Placed on{' '}
                      {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground block">Grand Total</span>
                      <span className="font-bold">{formatCurrency(order.grand_total)}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-muted-foreground" /> : <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Details layout */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border bg-muted/5 space-y-6 pt-5">
                    {/* Items table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Line Items</h4>
                      <div className="divide-y divide-border border-y border-border">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between items-center gap-3">
                            <div>
                              <span className="font-semibold block">{item.products.name}</span>
                              <span className="text-xs text-muted-foreground">Qty: {item.qty}</span>
                            </div>
                            <span className="font-bold">{formatCurrency(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Settings</h4>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
                          >
                            {orderStatuses.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          {updatingId === order.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Information</h4>
                        <div className="space-y-1">
                          <p><span className="text-muted-foreground">Method:</span> <span className="font-semibold">{order.payments?.payment_method || 'Unknown'}</span></p>
                          <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold">{order.payment_status}</span></p>
                        </div>

                        {/* Payment Verification panel */}
                        {hasProof && (
                          <div className="rounded-lg border border-border p-3 space-y-3 bg-background">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold">Verification Proof:</span>
                              <a
                                href={order.payments?.payment_proof!}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline text-[10px]"
                              >
                                View Full Image <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>

                            {needsVerification && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 text-xs gap-1"
                                  onClick={() => handlePaymentVerify(order.id, true)}
                                  disabled={updatingId === order.id}
                                >
                                  <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/5"
                                  onClick={() => handlePaymentVerify(order.id, false)}
                                  disabled={updatingId === order.id}
                                >
                                  <X className="h-4 w-4" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
