import React, { Suspense } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-border bg-background" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
