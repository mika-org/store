'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/store/cart';
import { createClient } from '@/lib/supabase';
import { placeOrder } from '@/app/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, Landmark, Truck } from 'lucide-react';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().min(5, 'Please enter a complete shipping address'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  paymentMethod: z.enum(['Bank Transfer', 'GoPay', 'Cash on Delivery']),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();
  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 500000 || subtotal === 0 ? 0 : 20000;
  const grandTotal = subtotal + shippingCost;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'Bank Transfer',
    },
  });

  // Pre-fill profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: customer } = await supabase
            .from('customers_shop')
            .select('full_name, phone, address, city, province, postal_code')
            .eq('id', session.user.id)
            .single();

          if (customer) {
            if (customer.full_name) setValue('fullName', customer.full_name);
            if (customer.phone) setValue('phone', customer.phone);
            if (customer.address) setValue('address', customer.address);
            if (customer.city) setValue('city', customer.city);
            if (customer.province) setValue('province', customer.province);
            if (customer.postal_code) setValue('postalCode', customer.postal_code);
          }
        }
      } catch (error) {
        console.error('Error fetching profile for checkout:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  // If cart is empty, redirect back to shop
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      router.push('/shop');
    }
  }, [items, router, isLoading]);

  const onSubmit = async (data: CheckoutInput) => {
    setIsLoading(true);
    setErrorMsg(null);

    const itemsInput = items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
      price: item.price,
    }));

    const result = await placeOrder({
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      paymentMethod: data.paymentMethod,
      items: itemsInput,
      totalPrice: subtotal,
      shippingCost,
      grandTotal,
    });

    if (result.success) {
      clearCart();
      router.push(`/orders?success=true&invoice=${result.invoiceNumber}`);
    } else {
      setErrorMsg(result.error || 'Failed to place order.');
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (items.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

      {errorMsg && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border p-6 bg-card shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Shipping Information</h2>
            
            {profileLoading ? (
              <div className="flex items-center space-x-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pre-filling from profile...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    Receiver Full Name
                  </label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...register('fullName')}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="081234567890"
                    disabled={isLoading}
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    Street Address
                  </label>
                  <Input
                    id="address"
                    placeholder="Sudirman Street No. 45, Apartment 3B"
                    disabled={isLoading}
                    {...register('address')}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="Central Jakarta"
                    disabled={isLoading}
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="province" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    Province
                  </label>
                  <Input
                    id="province"
                    placeholder="DKI Jakarta"
                    disabled={isLoading}
                    {...register('province')}
                    className={errors.province ? 'border-destructive' : ''}
                  />
                  {errors.province && (
                    <p className="mt-1 text-xs text-destructive">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                    Postal Code
                  </label>
                  <Input
                    id="postalCode"
                    placeholder="10110"
                    disabled={isLoading}
                    {...register('postalCode')}
                    className={errors.postalCode ? 'border-destructive' : ''}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-destructive">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-xl border border-border p-6 bg-card shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="relative flex flex-col items-center justify-between rounded-lg border border-input bg-background p-4 hover:bg-muted/40 cursor-pointer [&:has([value='Bank Transfer']:checked)]:border-foreground [&:has([value='Bank Transfer']:checked)]:bg-muted/30">
                <input
                  type="radio"
                  value="Bank Transfer"
                  disabled={isLoading}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <Landmark className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs font-bold text-center">Bank Transfer</span>
              </label>

              <label className="relative flex flex-col items-center justify-between rounded-lg border border-input bg-background p-4 hover:bg-muted/40 cursor-pointer [&:has([value='GoPay']:checked)]:border-foreground [&:has([value='GoPay']:checked)]:bg-muted/30">
                <input
                  type="radio"
                  value="GoPay"
                  disabled={isLoading}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <CreditCard className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs font-bold text-center">GoPay e-Wallet</span>
              </label>

              <label className="relative flex flex-col items-center justify-between rounded-lg border border-input bg-background p-4 hover:bg-muted/40 cursor-pointer [&:has([value='Cash on Delivery']:checked)]:border-foreground [&:has([value='Cash on Delivery']:checked)]:bg-muted/30">
                <input
                  type="radio"
                  value="Cash on Delivery"
                  disabled={isLoading}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <Truck className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs font-bold text-center">Cash on Delivery</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary list */}
        <div className="h-fit rounded-xl border border-border p-6 bg-muted/10 space-y-6">
          <h2 className="text-lg font-bold">Review Order Items</h2>

          {/* Mini product details list */}
          <div className="divide-y divide-border max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="py-3 flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded overflow-hidden border border-border">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block line-clamp-1">{item.name}</span>
                    <span className="text-muted-foreground block uppercase">
                      {item.size} / {item.color} x {item.qty}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          {/* Pricing Totals */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Shipping Fee</span>
              <span className="font-bold">
                {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-sm font-bold pt-1">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
