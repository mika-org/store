import React from 'react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Receipt, Users, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

interface RecentOrder {
  id: string;
  invoice_number: string;
  grand_total: number;
  status: string;
  created_at: string;
  customer_email: string;
}

// Mock details if Supabase is disconnected
const MOCK_STATS = {
  totalProducts: 9,
  totalOrders: 15,
  totalCustomers: 12,
  revenue: 4200000,
};

const MOCK_RECENT_ORDERS: RecentOrder[] = [
  { id: '1', invoice_number: 'INV-20260626-4100', grand_total: 470000, status: 'Paid', created_at: '2026-06-26T07:15:20Z', customer_email: 'customer@example.com' },
  { id: '2', invoice_number: 'INV-20260625-9031', grand_total: 1200000, status: 'Pending', created_at: '2026-06-25T11:20:45Z', customer_email: 'alice@example.com' },
  { id: '3', invoice_number: 'INV-20260624-1189', grand_total: 350000, status: 'Completed', created_at: '2026-06-24T15:40:10Z', customer_email: 'bob@example.com' },
  { id: '4', invoice_number: 'INV-20260623-8822', grand_total: 180000, status: 'Cancelled', created_at: '2026-06-23T09:05:00Z', customer_email: 'charlie@example.com' },
];

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let stats = MOCK_STATS;
  let recentOrders = MOCK_RECENT_ORDERS;
  let isDbConnected = false;

  try {
    const supabase = await createServerSupabaseClient();

    // 1. Get counts
    const { count: productsCount } = await supabase.from('products_shop').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders_shop').select('*', { count: 'exact', head: true });
    const { count: customersCount } = await supabase.from('users_shop').select('*', { count: 'exact', head: true }).eq('role', 'customer');

    // 2. Sum revenue (Paid, Packed, Shipped, Completed statuses)
    const { data: revenueData } = await supabase
      .from('orders_shop')
      .select('grand_total')
      .in('status', ['Paid', 'Packed', 'Shipped', 'Completed']);

    // 3. Get recent orders
    const { data: dbOrders } = await supabase
      .from('orders_shop')
      .select(`
        id,
        invoice_number,
        grand_total,
        status,
        created_at,
        users_shop (
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (productsCount !== null) {
      isDbConnected = true;
      const totalRev = (revenueData || []).reduce((acc, curr) => acc + Number(curr.grand_total), 0);
      
      stats = {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        revenue: totalRev,
      };

      if (dbOrders) {
        recentOrders = dbOrders.map((o: any) => ({
          id: o.id,
          invoice_number: o.invoice_number,
          grand_total: Number(o.grand_total),
          status: o.status,
          created_at: o.created_at,
          customer_email: o.users_shop?.email || 'Guest User'
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load admin stats from DB. Using mock data.', error);
  }

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Realtime analytics on products, sales, and accounts</p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Revenue</span>
            <h3 className="text-xl font-bold">{formatCurrency(stats.revenue)}</h3>
          </div>
          <div className="rounded-lg bg-green-500/10 p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Orders</span>
            <h3 className="text-xl font-bold">{stats.totalOrders}</h3>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3">
            <Receipt className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Total Products */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Products</span>
            <h3 className="text-xl font-bold">{stats.totalProducts}</h3>
          </div>
          <div className="rounded-lg bg-yellow-500/10 p-3">
            <ShoppingBag className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        {/* Customers count */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Customers</span>
            <h3 className="text-xl font-bold">{stats.totalCustomers}</h3>
          </div>
          <div className="rounded-lg bg-purple-500/10 p-3">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Body: chart & orders list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly sales report info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-green-600" /> Monthly Sales Chart
            </h3>
            <Link href="/admin/reports" className="text-xs text-muted-foreground hover:underline">
              View Detailed Reports
            </Link>
          </div>
          
          <div className="h-64 flex flex-col justify-end pt-4 space-y-4">
            {/* Visual simulation of bar graph */}
            <div className="flex items-end justify-between h-44 px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 bg-foreground/15 rounded-t h-16" />
                <span className="text-[10px] text-muted-foreground">Mar</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 bg-foreground/15 rounded-t h-28" />
                <span className="text-[10px] text-muted-foreground">Apr</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 bg-foreground/15 rounded-t h-20" />
                <span className="text-[10px] text-muted-foreground">May</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 bg-foreground rounded-t h-36" />
                <span className="text-[10px] text-muted-foreground font-bold">Jun</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
              Store sales grew by <span className="text-green-600 font-bold">14.2%</span> compared to last month.
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{order.invoice_number}</span>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                      {order.customer_email}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold block">{formatCurrency(order.grand_total)}</span>
                    <span className={`text-[8px] font-semibold border px-1.5 py-0.2 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Link href="/admin/orders" className="block w-full pt-4">
            <Button variant="outline" className="w-full text-xs gap-1">
              Manage Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
