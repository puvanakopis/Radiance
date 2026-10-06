'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Settings,
  Heart,
  LogOut,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  PackageCheck,
  Bell,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { orderService } from '@/services/orderService';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  const { user, logout, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { totalWishlist } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      const fetchOrderStats = async () => {
        try {
          const orders = await orderService.getOrders();
          setOrderCount(orders.length);
        } catch (err) {
          console.error('Failed to load order count', err);
        }
      };
      fetchOrderStats();
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-48 bg-[#1A1A1A]/10 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-3 h-80 bg-white border border-[#1A1A1A]/10 rounded-3xl" />
            <div className="lg:col-span-9 h-96 bg-white border border-[#1A1A1A]/10 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: 'Personal Sanctuary',
      href: '/account',
      icon: User,
      badge: null,
      description: 'Profile & saved addresses',
    },
    {
      label: 'Order Archives',
      href: '/orders',
      icon: ShoppingBag,
      badge: orderCount > 0 ? `${orderCount}` : null,
      description: 'Order tracking & history',
    },
    {
      label: 'Security & Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
      description: 'Password & account controls',
    },
    {
      label: 'Saved Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: totalWishlist > 0 ? `${totalWishlist}` : null,
      description: 'Saved botanical items',
    },
  ];

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const defaultBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Patron Sanctuary', href: '/account' },
  ];

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs || defaultBreadcrumbs} />

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Patron Identification Card */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 relative overflow-hidden">
            {/* Subtle luxury ambient accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C87D55]/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#C87D55] text-white flex items-center justify-center font-serif text-xl font-semibold shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-[#C87D55]" />
                </div>
              </div>

              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block truncate">
                  Conscious Patron
                </span>
                <h2 className="font-serif text-lg font-medium text-[#1A1A1A] truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-[#1A1A1A]/50 truncate">{user.email}</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#1A1A1A]/10">
              <Link
                href="/orders"
                className="bg-[#FAF8F5] border border-[#1A1A1A]/5 rounded-2xl p-3 text-center hover:bg-[#F2ECE4] transition-colors"
              >
                <span className="text-base font-serif font-semibold text-[#1A1A1A] block">
                  {orderCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  {orderCount === 1 ? 'Order' : 'Orders'}
                </span>
              </Link>
              <Link
                href="/wishlist"
                className="bg-[#FAF8F5] border border-[#1A1A1A]/5 rounded-2xl p-3 text-center hover:bg-[#F2ECE4] transition-colors"
              >
                <span className="text-base font-serif font-semibold text-[#1A1A1A] block">
                  {totalWishlist}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  Saved
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Links Menu */}
          <nav className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-3 sm:p-4 shadow-xs space-y-1.5">
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]/40">
              Patron Portal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${isActive
                      ? 'bg-[#1A1A1A] text-[#FAF8F5] shadow-xs'
                      : 'text-[#1A1A1A]/80 hover:bg-[#FAF8F5] hover:text-[#1A1A1A]'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive
                          ? 'bg-white/15 text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#1A1A1A]/60 group-hover:text-[#1A1A1A] group-hover:bg-[#EAE3D9]/60'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium tracking-wide truncate ${isActive ? 'text-[#FAF8F5]' : 'text-[#1A1A1A]'
                          }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-[#1A1A1A]/45'
                          }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                            ? 'bg-[#C87D55] text-white'
                            : 'bg-[#FAF8F5] text-[#C87D55] border border-[#1A1A1A]/10'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive
                          ? 'text-white/70 translate-x-0.5'
                          : 'text-[#1A1A1A]/30 group-hover:text-[#1A1A1A]/70 group-hover:translate-x-0.5'
                        }`}
                    />
                  </div>
                </Link>
              );
            })}

            {/* Admin Command Panel Link if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="group flex items-center justify-between p-3 rounded-2xl text-[#C87D55] hover:bg-[#C87D55]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C87D55]/15 text-[#C87D55] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Admin Command Panel</p>
                    <p className="text-[10px] text-[#C87D55]/70">Store management</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#C87D55]/60 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-[#1A1A1A]/10 mt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-medium text-red-600/80 hover:text-red-700 hover:bg-red-50/60 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Sign Out of Sanctuary</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Right Content Area */}
        <section className="lg:col-span-9 space-y-8">
          {/* Header Bar if provided */}
          {(title || subtitle || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
              <div>
                {subtitle && (
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block mb-1">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
                    {title}
                  </h1>
                )}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}

          {/* Child Content */}
          <div>{children}</div>
        </section>
      </div>
    </div>
  );
};
