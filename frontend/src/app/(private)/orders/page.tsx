'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, ArrowRight, Truck, Package, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = filterStatus === 'All' || ord.status === filterStatus;
    const matchesSearch =
      ord.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some((it) => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <AccountLayout
      subtitle="Dispatch Archives"
      title="Order History & Tracking"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Patron Sanctuary', href: '/account' },
        { label: 'Order Archives' },
      ]}
      action={
        <Link href="/products">
          <Button variant="outline" size="sm">
            Discover Catalog
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or formulation..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-2xl text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Placed', 'Processing', 'Shipped', 'Delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-44" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EAE3D9]/60 flex items-center justify-center mx-auto text-[#1A1A1A]/50">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A]">No Dispatches Found</h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'All'
                ? 'No matching orders found. Try adjusting your search query or status filter.'
                : 'You have not placed any orders yet. Discover our pure botanical collections.'}
            </p>
            <Link href="/products">
              <Button variant="primary" size="sm">Explore Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 hover:border-[#1A1A1A]/30 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A]">
                        Order #{ord.orderNumber}
                      </span>
                      <Badge
                        variant={
                          ord.status === 'Delivered'
                            ? 'sage'
                            : ord.status === 'Shipped' || ord.status === 'Processing'
                            ? 'terracotta'
                            : 'dark'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/50">
                      Placed on {new Date(ord.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Payment: {ord.paymentMethod}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">Total Amount</span>
                    <span className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                      LKR {(ord.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="divide-y divide-[#1A1A1A]/5">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <img
                          src={it.productImage}
                          alt={it.productName}
                          className="w-12 h-14 object-cover rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/5"
                        />
                        <div>
                          <p className="font-serif text-sm font-medium text-[#1A1A1A]">{it.productName}</p>
                          <p className="text-[11px] text-[#1A1A1A]/50">SKU: {it.sku} • {it.size} • Qty {it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-[#1A1A1A]">
                        LKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-[#1A1A1A]/60">
                    <Truck className="w-4 h-4 text-[#8A9A86]" />
                    <span>Delivering to: {ord.deliveryAddress?.street}, {ord.deliveryAddress?.city}</span>
                  </div>

                  <Link
                    href={`/order-success/${ord.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C87D55] hover:underline"
                  >
                    <span>View Live Dispatch & Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
