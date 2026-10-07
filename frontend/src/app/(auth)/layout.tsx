import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col justify-between selection:bg-[#C87D55]/20 selection:text-[#1A1A1A]">
      {/* Top minimalistic header */}
      <header className="px-6 py-6 sm:px-12 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Return to Sanctuary</span>
        </Link>

        <Link href="/" className="font-serif text-2xl tracking-[0.25em] font-medium text-[#1A1A1A]">
          Radiance
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8A9A86] font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pure Botanicals</span>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Minimalistic footer */}
      <footer className="py-6 px-6 text-center text-xs text-[#1A1A1A]/40 border-t border-[#1A1A1A]/5">
        <p>© {new Date().getFullYear()} Radiance Botanicals. Handcrafted conscious beauty.</p>
      </footer>
    </div>
  );
}
