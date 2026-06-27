'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">ATELIER</h3>
            <p className="text-sm text-muted-foreground">
              A modern, minimal clothing store providing premium organic apparel designed for timeless style.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Shopping</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-foreground">All Products</Link>
              </li>
              <li>
                <Link href="/shop?gender=Men" className="hover:text-foreground">Men's Collection</Link>
              </li>
              <li>
                <Link href="/shop?gender=Women" className="hover:text-foreground">Women's Collection</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-foreground">New Arrivals</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/profile" className="hover:text-foreground">My Account</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-foreground">Track Order</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground">Shopping Cart</Link>
              </li>
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ring focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} ATELIER. All rights reserved.</p>
          <div className="flex space-x-4">
            <span>Indonesia</span>
            <span>English (USD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
