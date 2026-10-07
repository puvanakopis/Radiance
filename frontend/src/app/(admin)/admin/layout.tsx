'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
  ];

  return (
    <div className="h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar - Fixed to Screen Height */}
      <aside className="w-full md:w-64 bg-[#1A1A1A] text-[#FAF8F5] p-6 flex flex-col justify-between shrink-0 border-r border-white/10 md:h-screen overflow-y-auto z-30">
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#FAF8F5] group-hover:text-[#C87D55] transition-colors">
                SKINOVA
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-[#FAF8F5]/50 block">
                Command Sanctuary
              </span>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-medium transition-all ${isActive
                      ? 'bg-white/15 text-[#FAF8F5] shadow-xs'
                      : 'text-[#FAF8F5]/60 hover:text-[#FAF8F5] hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C87D55]' : 'text-current'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom user & quick storefront link */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#FAF8F5]/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C87D55] text-white flex items-center justify-center font-serif text-xs font-semibold">
                A
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-[#FAF8F5] leading-none">Admin</p>
                <p className="text-[10px] text-[#FAF8F5]/40 mt-0.5">Concierge</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="text-[#FAF8F5]/40 hover:text-[#C87D55] transition-colors p-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#1A1A1A]/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8A9A86]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70">
              Cleanroom Production Operations
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#1A1A1A]/50">
              Live Gateway Active
            </span>
            <div className="w-2 h-2 rounded-full bg-[#8A9A86] animate-pulse" />
          </div>
        </header>

        <div className="p-6 sm:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
