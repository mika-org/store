'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  Receipt,
  BarChart3,
  Home,
  LogOut,
  Menu,
  X,
  Loader2,
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, children, active, onClick }: SidebarLinkProps) {
  return (
    <Link href={href} onClick={onClick}>
      <span
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          active
            ? 'bg-foreground text-background font-bold shadow-sm'
            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
        }`}
      >
        {icon}
        {children}
      </span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Let proxy.ts handle redirection, but load details for display
      if (session?.user) {
        setEmail(session.user.email || 'Admin User');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const navLinks = [
    { href: '/admin', icon: <LayoutDashboard className="h-4.5 w-4.5" />, label: 'Dashboard' },
    { href: '/admin/categories', icon: <FolderTree className="h-4.5 w-4.5" />, label: 'Categories' },
    { href: '/admin/products', icon: <ShoppingBag className="h-4.5 w-4.5" />, label: 'Products' },
    { href: '/admin/orders', icon: <Receipt className="h-4.5 w-4.5" />, label: 'Orders' },
    { href: '/admin/reports', icon: <BarChart3 className="h-4.5 w-4.5" />, label: 'Reports' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar (Left side, sticky) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background p-5 sticky top-0 h-screen justify-between shadow-sm">
        <div className="space-y-6">
          <div className="px-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground block">
              ATELIER <span className="text-[10px] font-semibold text-muted-foreground uppercase border border-border px-1.5 py-0.5 rounded-full ml-1">Admin</span>
            </Link>
          </div>
          
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={pathname === link.href}
              >
                {link.label}
              </SidebarLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="border-t border-border pt-4 px-3">
            <span className="text-xs text-muted-foreground block truncate">{email}</span>
          </div>

          <div className="space-y-1">
            <SidebarLink href="/" icon={<Home className="h-4.5 w-4.5" />} active={false}>
              Go to Storefront
            </SidebarLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between h-16 border-b border-border bg-background px-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
            ATELIER <span className="text-[8px] font-semibold text-muted-foreground border border-border px-1 py-0.2 rounded-full ml-1">Admin</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-border rounded-md hover:bg-muted"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background/95 pt-20 px-4 space-y-6">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  active={pathname === link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </SidebarLink>
              ))}
              <hr className="border-border" />
              <SidebarLink href="/" icon={<Home className="h-4.5 w-4.5" />} active={false}>
                Go to Storefront
              </SidebarLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all text-left"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
