import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1A1A]">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
