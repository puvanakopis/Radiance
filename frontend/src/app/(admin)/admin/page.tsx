'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowUpRight,
  Package,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import { AdminStats } from '@/types';
import { useToast } from '@/context/ToastContext';

const DEFAULT_STATS: AdminStats = {
  totalRevenue: 0,
  ordersCount: 0,
  customersCount: 0,
  lowStockCount: 0,
  revenueGrowth: 0,
  ordersGrowth: 0,
  recentOrders: [],
  topProducts: [],
  salesByDay: [
    { date: 'Mon', amount: 0, orders: 0 },
    { date: 'Tue', amount: 0, orders: 0 },
    { date: 'Wed', amount: 0, orders: 0 },
    { date: 'Thu', amount: 0, orders: 0 },
    { date: 'Fri', amount: 0, orders: 0 },
    { date: 'Sat', amount: 0, orders: 0 },
    { date: 'Sun', amount: 0, orders: 0 },
  ],
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);

    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
      if (isManual) {
        showToast({
          type: 'success',
          title: 'Dashboard Synchronized',
          message: 'Real-time metrics updated from database.',
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      if (isManual) {
        showToast({
          type: 'error',
          title: 'Sync Error',
          message: 'Could not connect to live backend API.',
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Compute maximum amount for dynamic chart bar scaling
  const maxDayAmount = useMemo(() => {
    if (!stats.salesByDay || stats.salesByDay.length === 0) return 100000;
    const max = Math.max(...stats.salesByDay.map((d) => d.amount), 50000);
    return max;
  }, [stats]);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block mb-1">
            Real-Time Command & Analytics
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Operational Dashboard</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Live synchronization with production catalog, active fulfillment registry, and patron directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Syncing...' : 'Refresh Analytics'}
          </Button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL REVENUE */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div className="flex items-center justify-between text-[#1A1A1A]/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#5B7065]/10 border border-[#5B7065]/20 flex items-center justify-center text-[#5B7065]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              LKR {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#5B7065] font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Real-time settled receipts</span>
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div className="flex items-center justify-between text-[#1A1A1A]/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Orders Processed</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {stats.ordersCount}
            </div>
            <Link href="/admin/orders" className="text-[11px] text-[#C87D55] hover:underline font-medium mt-1 inline-flex items-center gap-0.5">
              <span>Inspect fulfillment queue</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ACTIVE PATRONS */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div className="flex items-center justify-between text-[#1A1A1A]/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Registered Patrons</span>
            <div className="w-8 h-8 rounded-xl bg-[#8A9A86]/10 border border-[#8A9A86]/20 flex items-center justify-center text-[#8A9A86]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {stats.customersCount.toLocaleString()}
            </div>
            <Link href="/admin/customers" className="text-[11px] text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:underline font-medium mt-1 inline-flex items-center gap-0.5">
              <span>View member directory</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* LOW STOCK ALERT */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div className="flex items-center justify-between text-[#1A1A1A]/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Stock Reorder Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-[#C87D55]/10 border border-[#C87D55]/20 flex items-center justify-center text-[#C87D55]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {stats.lowStockCount}
            </div>
            <Link href="/admin/products" className="text-[11px] text-[#C87D55] hover:underline font-medium mt-1 inline-flex items-center gap-0.5">
              <span>Inspect inventory levels</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Performance Chart Bar View */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block mb-0.5">
              7-Day Rolling Trajectory
            </span>
            <h3 className="font-serif text-xl text-[#1A1A1A]">Revenue & Dispatch Distribution</h3>
            <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
              Calculated dynamically from real customer order bookings (LKR)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5B7065] bg-[#5B7065]/10 border border-[#5B7065]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live Database Telemetry</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-6 items-end h-56 pt-6 pb-2 border-b border-[#1A1A1A]/10">
          {stats.salesByDay.map((day, idx) => {
            const heightPercent = maxDayAmount > 0 ? Math.max(10, Math.round((day.amount / maxDayAmount) * 100)) : 10;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-[#1A1A1A] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#1A1A1A]/10 shadow-xs whitespace-nowrap text-center">
                  <p>LKR {day.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-[#1A1A1A]/50">{day.orders} {day.orders === 1 ? 'order' : 'orders'}</p>
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-[#1A1A1A] group-hover:bg-[#C87D55] rounded-t-xl transition-all duration-300 min-h-[8px]"
                />
                <span className="text-xs font-medium text-[#1A1A1A]/70">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Orders & Top Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block">
                  Fulfillment Pipeline
                </span>
                <h3 className="font-serif text-lg text-[#1A1A1A]">Recent Dispatches</h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs uppercase tracking-wider text-[#C87D55] hover:text-[#1A1A1A] font-semibold transition-colors flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-[#1A1A1A]/5">
                <ShoppingBag className="w-8 h-8 text-[#1A1A1A]/30 mx-auto" />
                <p className="text-xs text-[#1A1A1A]/60">No client orders recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]/10">
                {stats.recentOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#FAF8F5]/40 transition-colors px-2 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="font-serif text-sm font-semibold text-[#1A1A1A] block">
                        #{ord.orderNumber || ord.id}
                      </span>
                      <span className="text-[#1A1A1A]/50 text-[11px]">
                        {ord.customer?.name || 'Patron'} • {ord.items?.length || 0} items
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={ord.status === 'Delivered' ? 'sage' : ord.status === 'Shipped' ? 'terracotta' : ord.status === 'Processing' ? 'rose' : 'dark'}
                        size="xs"
                      >
                        {ord.status}
                      </Badge>
                      <span className="font-semibold text-xs text-[#1A1A1A] text-right min-w-[80px]">
                        LKR {(Number(ord.total) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs text-[#1A1A1A]/60">
            <span>Live status monitoring</span>
            <Link href="/admin/orders" className="text-[#C87D55] hover:underline font-medium">
              Open Order Registry →
            </Link>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-5 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block">
                  Catalog Popularity
                </span>
                <h3 className="font-serif text-lg text-[#1A1A1A]">Top Performing Rituals</h3>
              </div>
              <Link
                href="/admin/products"
                className="text-xs uppercase tracking-wider text-[#C87D55] hover:text-[#1A1A1A] font-semibold transition-colors flex items-center gap-1"
              >
                <span>Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.topProducts.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-[#1A1A1A]/5">
                <Package className="w-8 h-8 text-[#1A1A1A]/30 mx-auto" />
                <p className="text-xs text-[#1A1A1A]/60">No formulations cataloged yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]/10">
                {stats.topProducts.map(({ product, unitsSold, revenue }) => (
                  <div key={product.id} className="py-3 flex items-center gap-3 text-xs hover:bg-[#FAF8F5]/40 transition-colors px-2 rounded-xl">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-10 h-12 object-cover rounded-xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-xs font-semibold text-[#1A1A1A] truncate">{product.name}</p>
                      <span className="text-[#1A1A1A]/50 text-[10px]">{product.category} • {unitsSold} units ordered</span>
                    </div>
                    <span className="font-semibold text-[#1A1A1A] text-xs">
                      LKR {revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs text-[#1A1A1A]/60">
            <span>Inventory tracking</span>
            <Link href="/admin/products" className="text-[#C87D55] hover:underline font-medium">
              Manage Stock →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
