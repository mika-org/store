'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { uploadPaymentProof } from '@/app/actions/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, UploadCloud, Landmark, QrCode } from 'lucide-react';

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  products: {
    name: string;
    image: string | null;
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
  payments: {
    payment_method: string;
    payment_proof: string | null;
    status: string;
  } | null;
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [uploadingOrder, setUploadingOrder] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const showSuccessBanner = searchParams.get('success') === 'true';
  const successInvoice = searchParams.get('invoice') || '';

  const fetchOrders = async () => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    try {
      const sessionVal = getCookie('user_session');
      if (sessionVal) {
        let decoded = decodeURIComponent(sessionVal);
        if (decoded.startsWith('"') && decoded.endsWith('"')) {
          decoded = decoded.slice(1, -1);
        }
        const session = JSON.parse(decoded);
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
                name,
                image
              )
            ),
            payments_shop (
              payment_method,
              payment_proof,
              status
            )
          `)
          .eq('customer_id', session.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (dbOrders) {
          // Normalize structure
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
              products: oi.products_shop || { name: 'Deleted Product', image: null }
            })),
            payments: o.payments_shop ? {
              payment_method: o.payments_shop.payment_method,
              payment_proof: o.payments_shop.payment_proof,
              status: o.payments_shop.status
            } : null
          }));
          setOrders(formatted);
        }
      }
    } catch (error) {
      console.error('Error loading customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProofSubmit = async (orderId: string) => {
    if (!proofInput.trim() && !fileToUpload) return;
    setSubmitting(true);

    try {
      let finalProofUrl = proofInput.trim();

      // If a file is selected, try to upload to Supabase storage
      if (fileToUpload) {
        const fileName = `${orderId}-${Date.now()}-${fileToUpload.name}`;
        
        // Upload to storage bucket 'payments_shop'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payments_shop')
          .upload(fileName, fileToUpload);

        if (uploadError) {
          console.warn('Storage bucket upload failed, using simulated path:', uploadError.message);
          // Fallback url for demo purposes if bucket doesn't exist
          finalProofUrl = `/uploads/payments/${fileName}`;
        } else if (uploadData) {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('payments_shop')
            .getPublicUrl(uploadData.path);
          finalProofUrl = publicUrlData.publicUrl;
        }
      }

      const result = await uploadPaymentProof(orderId, finalProofUrl);
      if (result.success) {
        setProofInput('');
        setFileToUpload(null);
        setUploadingOrder(null);
        fetchOrders();
      } else {
        alert(result.error || 'Failed to submit payment proof.');
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      {showSuccessBanner && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 mb-8 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-green-800 dark:text-green-400">Order Placed Successfully!</h2>
            <p className="text-sm text-green-700/90 dark:text-green-500/95">
              Your order <span className="font-bold">{successInvoice}</span> is now recorded.
            </p>
            <p className="text-xs text-green-700/80 dark:text-green-500/80 pt-1">
              If you selected Bank Transfer, please submit your payment proof receipt below.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">My Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
          <h2 className="text-lg font-bold">No orders found</h2>
          <p className="text-sm text-muted-foreground mt-1">You haven't placed any orders yet.</p>
          <Link href="/shop" className="mt-6">
            <Button size="sm">Shop Now</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isUploading = uploadingOrder === order.id;
            const needsVerification = order.payment_status === 'Unpaid' && order.payments?.payment_method !== 'Cash on Delivery';

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Header Summary row */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.invoice_number}</span>
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground block">Total Amount</span>
                      <span className="font-bold text-sm">{formatCurrency(order.grand_total)}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-muted-foreground" /> : <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border bg-muted/5 space-y-6 pt-5">
                    {/* Items table list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Items ordered</h4>
                      <div className="divide-y divide-border border-y border-border">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="py-2.5 flex justify-between items-center gap-3">
                            <div className="text-sm">
                              <span className="font-semibold block">{item.products.name}</span>
                              <span className="text-xs text-muted-foreground">Qty: {item.qty}</span>
                            </div>
                            <span className="text-sm font-bold">{formatCurrency(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta information grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Information</h4>
                        <div className="space-y-1">
                          <p><span className="text-muted-foreground">Method:</span> <span className="font-semibold">{order.payments?.payment_method || 'Unknown'}</span></p>
                          <p>
                            <span className="text-muted-foreground">Status:</span>{' '}
                            <span className="font-semibold">
                              {order.payment_status === 'Pending Verification' ? 'Pending Admin Verification' : order.payment_status}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-left sm:text-right">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Breakdown</h4>
                        <div className="space-y-1">
                          <p><span className="text-muted-foreground">Subtotal:</span> {formatCurrency(order.total_price)}</p>
                          <p><span className="text-muted-foreground">Shipping:</span> {formatCurrency(order.shipping_cost)}</p>
                          <p className="font-bold"><span className="text-muted-foreground font-normal">Grand Total:</span> {formatCurrency(order.grand_total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Verification / Upload Proof Section */}
                     {needsVerification && (
                      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          {order.payments?.payment_method === 'QRIS' ? (
                            <QrCode className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Landmark className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="text-xs space-y-1 w-full">
                            <span className="font-bold block text-yellow-700 dark:text-yellow-400">Payment Verification Required</span>
                            {order.payments?.payment_method === 'QRIS' ? (
                              <div className="space-y-3">
                                <span className="text-muted-foreground">
                                  Please scan the QRIS code below and pay <span className="font-bold text-foreground">{formatCurrency(order.grand_total)}</span>:
                                </span>
                                <div className="border border-border p-2 bg-white rounded-lg w-40 h-40 flex items-center justify-center">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ATELIER-STORE-QRIS-INVOICE-${order.invoice_number}`} 
                                    alt="QRIS QR Code" 
                                    className="w-36 h-36 object-contain"
                                  />
                                </div>
                                <span className="block font-semibold text-[10px] text-muted-foreground">
                                  ATELIER STORE - QRIS MERCHANT
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Please transfer <span className="font-bold text-foreground">{formatCurrency(order.grand_total)}</span> to 
                                BCA Bank Account <span className="font-bold text-foreground">123-456-7890</span> (ATELIER STORE).
                              </span>
                            )}
                          </div>
                        </div>

                        {order.payments?.payment_proof ? (
                          <div className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            ✓ Payment proof submitted. Awaiting verification.
                          </div>
                        ) : isUploading ? (
                          <div className="space-y-3 pt-2">
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-muted-foreground uppercase">
                                Upload Receipt File (Image)
                              </label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                                  disabled={submitting}
                                  className="text-xs flex-1 cursor-pointer bg-background"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-muted-foreground uppercase">
                                Or Paste Receipt URL (For Local Testing)
                              </label>
                              <Input
                                type="text"
                                placeholder="https://example.com/receipt.jpg"
                                value={proofInput}
                                onChange={(e) => setProofInput(e.target.value)}
                                disabled={submitting}
                                className="text-xs"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={submitting || (!proofInput && !fileToUpload)}
                                onClick={() => handleProofSubmit(order.id)}
                                className="gap-1 text-xs"
                              >
                                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                                Submit Receipt
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadingOrder(null)}
                                className="text-xs"
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full sm:w-auto gap-2"
                            onClick={() => setUploadingOrder(order.id)}
                          >
                            <UploadCloud className="h-4 w-4" /> Upload Transfer Receipt
                          </Button>
                        )}
                      </div>
                    )}
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

export default function OrdersPage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center py-20 flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrdersPageContent />
    </React.Suspense>
  );
}
