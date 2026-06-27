'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard, History } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    // Get initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(session.user.user_metadata?.role === 'admin');
        
        // Double check database if metadata role is not present
        if (session.user.user_metadata?.role !== 'admin') {
          const { data: customer } = await supabase
            .from('customers_shop')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (customer?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(session.user.user_metadata?.role === 'admin');
        if (session.user.user_metadata?.role !== 'admin') {
          const { data: customer } = await supabase
            .from('customers_shop')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (customer?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-90">
          ATELIER
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
            Home
          </Link>
          <Link href="/shop" className="transition-colors hover:text-foreground/80 text-foreground">
            Shop
          </Link>
          <Link href="/shop?gender=Men" className="transition-colors hover:text-foreground/80 text-foreground">
            Men
          </Link>
          <Link href="/shop?gender=Women" className="transition-colors hover:text-foreground/80 text-foreground">
            Women
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative max-w-sm flex-1 mx-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-input bg-muted/50 px-4 py-1.5 pl-10 text-sm focus:border-ring focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </form>

        {/* Right Section Icons */}
        <div className="flex items-center space-x-4">
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-foreground hover:opacity-80">
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* User Menu / Controls */}
          <div className="hidden md:flex items-center space-x-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    {isAdmin && (
                      <Link href="/admin">
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <History className="h-4 w-4" />
                        Orders
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-destructive hover:text-destructive">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground md:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-input bg-muted/50 px-4 py-2 pl-10 text-sm focus:border-ring focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3 font-medium">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-muted-foreground">
              Home
            </Link>
            <Link href="/shop" onClick={() => setIsOpen(false)} className="hover:text-muted-foreground">
              Shop
            </Link>
            <Link href="/shop?gender=Men" onClick={() => setIsOpen(false)} className="hover:text-muted-foreground">
              Men
            </Link>
            <Link href="/shop?gender=Women" onClick={() => setIsOpen(false)} className="hover:text-muted-foreground">
              Women
            </Link>
            <hr className="border-border" />

            {!loading && (
              <>
                {user ? (
                  <div className="flex flex-col space-y-3">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:text-muted-foreground">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:text-muted-foreground">
                      <History className="h-4 w-4" /> Order History
                    </Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:text-muted-foreground">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-left text-destructive hover:text-destructive/80 font-medium"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
