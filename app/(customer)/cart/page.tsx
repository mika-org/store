'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 500000 || subtotal === 0 ? 0 : 20000;
  const grandTotal = subtotal + shippingCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/shop" className="mt-6">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm font-semibold text-muted-foreground">Product Details</span>
              <button
                onClick={clearCart}
                className="text-xs text-destructive hover:underline font-medium"
              >
                Remove All
              </button>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="py-4 flex gap-4 flex-col sm:flex-row sm:items-center justify-between"
                >
                  {/* Thumbnail & Description */}
                  <div className="flex gap-4 items-center">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-sm font-semibold hover:underline block line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Size: <span className="font-semibold uppercase text-foreground">{item.size}</span></span>
                        <span>•</span>
                        <span>Color: <span className="font-semibold uppercase text-foreground">{item.color}</span></span>
                      </div>
                      <p className="text-sm font-bold sm:hidden pt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Actions & pricing details */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12">
                    {/* Qty selectors */}
                    <div className="flex items-center border border-input rounded-md bg-background">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)}
                        className="p-1.5 text-muted-foreground hover:text-foreground"
                        disabled={item.qty <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)}
                        className="p-1.5 text-muted-foreground hover:text-foreground"
                        disabled={item.qty >= item.stock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">{formatCurrency(item.price * item.qty)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/shop">
                <Button variant="outline" size="sm">
                  ← Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="h-fit rounded-xl border border-border p-6 bg-muted/10 space-y-6">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Cost</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                </span>
              </div>
              {subtotal < 500000 && (
                <div className="rounded-lg bg-primary/5 p-2.5 text-xs text-primary/80 font-medium">
                  Add <span className="font-bold">{formatCurrency(500000 - subtotal)}</span> more for Free Shipping!
                </div>
              )}
              
              <hr className="border-border" />
              
              <div className="flex justify-between text-base font-bold">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full gap-2 font-semibold" size="lg">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
