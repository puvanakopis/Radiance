'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowUpRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminService } from '@/services/adminService';
import { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <Skeleton variant="text" className="w-1/4 h-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-1">
            Real-Time Analytics
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Operational Dashboard</h1>
        </div>
        <div className="text-xs text-[#1A1A1A]/60">
          Last synchronization: Just now
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL REVENUE */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#1A1A1A]/50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#8A9A86]" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            LKR {stats.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8A9A86] font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{stats.revenueGrowth}% from last cycle</span>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#1A1A1A]/50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Orders Processed</span>
            <ShoppingBag className="w-4 h-4 text-[#1A1A1A]/70" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            {stats.ordersCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8A9A86] font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{stats.ordersGrowth}% volume increment</span>
          </div>
        </div>

        {/* ACTIVE PATRONS */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#1A1A1A]/50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Active Patrons</span>
            <Users className="w-4 h-4 text-[#1A1A1A]/70" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            {stats.customersCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50">84% repeat ritual index</p>
        </div>

        {/* LOW STOCK ALERT */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#1A1A1A]/50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Stock Reorder Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#C87D55]" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            {stats.lowStockCount}
          </div>
          <Link href="/admin/products" className="text-[11px] text-[#C87D55] hover:underline font-medium block">
            Inspect inventory thresholds →
          </Link>
        </div>
      </div>

      {/* Revenue Performance Chart Bar View */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A]">Weekly Revenue Distribution</h3>
            <p className="text-xs text-[#1A1A1A]/50">Sri Lankan Rupees (LKR)</p>
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8A9A86] bg-[#8A9A86]/10 px-3 py-1 rounded-full">
            Optimal Growth
          </span>
        </div>

        <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-56 pt-6 pb-2 border-b border-[#1A1A1A]/10">
          {stats.salesByDay.map((day) => {
            const maxAmount = 450000;
            const heightPercent = Math.round((day.amount / maxAmount) * 100);
            return (
              <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#1A1A1A]/10">
                  LKR {(day.amount / 1000).toFixed(0)}k
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-[#1A1A1A] group-hover:bg-[#C87D55] rounded-t-xl transition-all duration-300"
                />
                <span className="text-xs font-medium text-[#1A1A1A]/70">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Orders & Top Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#1A1A1A]">Recent Dispatches</h3>
            <Link href="/admin/orders" className="text-xs uppercase tracking-wider text-[#C87D55] hover:underline font-medium">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-[#1A1A1A]/10">
            {stats.recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-serif text-sm font-medium text-[#1A1A1A] block">
                    #{ord.orderNumber}
                  </span>
                  <span className="text-[#1A1A1A]/50">{ord.customer?.name || 'Patron'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={ord.status === 'Delivered' ? 'sage' : ord.status === 'Shipped' ? 'terracotta' : 'dark'}
                    size="xs"
                  >
                    {ord.status}
                  </Badge>
                  <span className="font-semibold text-[#1A1A1A]">
                    LKR {ord.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-5 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#1A1A1A]">Top Performing Rituals</h3>
            <Link href="/admin/products" className="text-xs uppercase tracking-wider text-[#C87D55] hover:underline font-medium">
              Catalog
            </Link>
          </div>

          <div className="divide-y divide-[#1A1A1A]/10">
            {stats.topProducts.map(({ product, unitsSold, revenue }) => (
              <div key={product.id} className="py-3 flex items-center gap-3 text-xs">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-10 h-12 object-cover rounded-lg bg-[#EAE3D9]/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs font-medium text-[#1A1A1A] truncate">{product.name}</p>
                  <span className="text-[#1A1A1A]/50">{unitsSold} units sold</span>
                </div>
                <span className="font-semibold text-[#1A1A1A]">
                  LKR {revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
