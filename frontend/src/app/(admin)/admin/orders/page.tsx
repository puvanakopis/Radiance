'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle2, 
  Truck, 
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  MapPin,
  TrendingUp,
  ArrowUpDown,
  Phone,
  Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { orderService } from '@/services/orderService';
import { useToast } from '@/context/ToastContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';

const STATUS_LIST: OrderStatus[] = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
type SortOption = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal & inspection state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { showToast } = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Could not load orders' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, sortBy]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setSelectedOrder(updated);
      showToast({
        type: 'success',
        title: 'Fulfillment Phase Updated',
        message: `Order #${updated.orderNumber} transitioned to ${newStatus}`,
      });
      loadOrders();
    } catch {
      showToast({ type: 'error', title: 'Could not update status' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await orderService.updateOrderPayment(orderId, newPaymentStatus);
      setSelectedOrder(updated);
      showToast({
        type: 'success',
        title: 'Payment Status Updated',
        message: `Order #${updated.orderNumber} payment marked as ${newPaymentStatus}`,
      });
      loadOrders();
    } catch {
      showToast({ type: 'error', title: 'Could not update payment status' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = orders.length;
    const processing = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Processing').length;
    const shipped = orders.filter((o) => o.status === 'Shipped').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return { total, processing, shipped, delivered, totalRevenue };
  }, [orders]);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(query)) ||
          (o.customer?.phone && o.customer.phone.toLowerCase().includes(query)) ||
          (o.customer?.email && o.customer.email.toLowerCase().includes(query)) ||
          (o.deliveryAddress?.city && o.deliveryAddress.city.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        const matchesPayment = paymentFilter === 'All' || o.paymentMethod === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (sortBy === 'date-asc') return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        if (sortBy === 'total-desc') return (Number(b.total) || 0) - (Number(a.total) || 0);
        if (sortBy === 'total-asc') return (Number(a.total) || 0) - (Number(b.total) || 0);
        return 0;
      });
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || paymentFilter !== 'All' || sortBy !== 'date-desc';

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block mb-1">
            Fulfillment Registry
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Order Management</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Oversee client order dispatches, transition cleanroom lifecycle stages, and verify payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={loadOrders}
            disabled={isLoading}
          >
            {isLoading ? 'Syncing...' : 'Refresh Registry'}
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold block">
              Total Orders
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.total}
            </span>
            <span className="text-[10px] text-[#1A1A1A]/60 mt-0.5 block">
              All time client bookings
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Processing / In Progress */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block">
              Active Processing
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.processing}
            </span>
            <span className="text-[10px] text-[#C87D55] mt-0.5 block">
              Pending packing & prep
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C87D55]/10 border border-[#C87D55]/20 flex items-center justify-center text-[#C87D55]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Shipped */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8A9A86] font-semibold block">
              In Transit (Shipped)
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.shipped}
            </span>
            <span className="text-[10px] text-[#8A9A86] mt-0.5 block">
              Dispatched with courier
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#8A9A86]/10 border border-[#8A9A86]/20 flex items-center justify-center text-[#8A9A86]">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#5B7065] font-semibold block">
              Gross Value
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              LKR {(metrics.totalRevenue / 1000).toFixed(0)}k
            </span>
            <span className="text-[10px] text-[#5B7065] mt-0.5 block">
              {metrics.delivered} successfully settled
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5B7065]/10 border border-[#5B7065]/20 flex items-center justify-center text-[#5B7065]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Dropdowns */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, patron name, phone, or destination..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-all placeholder:text-[#1A1A1A]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Status: All Lifecycle</option>
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>Status: {s}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Payment Method Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Payment: All Methods</option>
                <option value="WhatsApp">WhatsApp Concierge</option>
                <option value="PayHere">PayHere Gateway</option>
                <option value="Card">Direct Card</option>
                <option value="CashOnDelivery">Cash on Delivery</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="total-desc">Total: High to Low</option>
                <option value="total-asc">Total: Low to High</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-full border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/60 hover:text-[#C87D55] hover:border-[#C87D55]/30 bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Orders Table */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Order Reference</th>
                <th className="py-4 px-6">Patron / Recipient</th>
                <th className="py-4 px-6">Date Registered</th>
                <th className="py-4 px-6">Items & Volume</th>
                <th className="py-4 px-6">Total Value</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6">Lifecycle Phase</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#1A1A1A]/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#C87D55] border-t-transparent animate-spin" />
                      <span>Loading order fulfillments...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <ShoppingBag className="w-10 h-10 text-[#1A1A1A]/20 mx-auto" />
                      <h3 className="font-serif text-lg text-[#1A1A1A]">No Orders Found</h3>
                      <p className="text-xs text-[#1A1A1A]/60">
                        {hasActiveFilters
                          ? 'No order dispatches match your search or filter parameters.'
                          : 'There are currently no recorded client orders.'}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleResetFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const itemCount = ord.items?.length || 0;
                  const formattedDate = ord.date
                    ? new Date(ord.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      {/* Order Reference */}
                      <td className="py-4 px-6">
                        <span className="font-serif font-semibold text-[#1A1A1A] block">
                          #{ord.orderNumber || ord.id}
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                          ID: {ord.id.slice(0, 10)}...
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-[#1A1A1A]">{ord.customer?.name || 'Patron'}</p>
                        <p className="text-[10px] text-[#1A1A1A]/50">
                          {ord.customer?.phone || ord.customer?.email || '—'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-[#1A1A1A]/70">
                        <span>{formattedDate}</span>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-6 text-[#1A1A1A]/80">
                        <span className="font-medium">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        {ord.items?.[0] && (
                          <span className="block text-[10px] text-[#1A1A1A]/50 truncate max-w-[140px]">
                            {ord.items[0].productName}
                          </span>
                        )}
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                        LKR {(ord.total || 0).toLocaleString()}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-[#1A1A1A]">{ord.paymentMethod}</span>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-semibold ${
                              ord.paymentStatus === 'Paid'
                                ? 'text-[#5B7065]'
                                : ord.paymentStatus === 'Failed'
                                ? 'text-[#8B3A2B]'
                                : 'text-[#C87D55]'
                            }`}
                          >
                            ● {ord.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            ord.status === 'Delivered'
                              ? 'sage'
                              : ord.status === 'Shipped'
                              ? 'terracotta'
                              : ord.status === 'Processing'
                              ? 'rose'
                              : 'dark'
                          }
                          size="xs"
                        >
                          {ord.status}
                        </Badge>
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-[#FAF8F5] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF8F5] transition-all inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                          title="Inspect order and update fulfillment"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 sm:px-6 bg-[#FAF8F5]/60 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A1A1A]/60">
          <div>
            <span>
              Showing <strong className="text-[#1A1A1A]">{filteredOrders.length === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of <strong className="text-[#1A1A1A]">{filteredOrders.length}</strong> dispatches
              {filteredOrders.length !== orders.length && ` (filtered from ${orders.length})`}
            </span>
          </div>

          {/* Previous / Next Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full font-medium text-[11px] text-[#1A1A1A]">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages || filteredOrders.length === 0}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details & Lifecycle Stepper Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Reference #${selectedOrder?.orderNumber || selectedOrder?.id}`}
        subtitle={`Current Lifecycle: ${selectedOrder?.status} • Payment: ${selectedOrder?.paymentStatus || 'Pending'}`}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Advance Status Stepper / Action Group */}
            <div className="p-4 rounded-2xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/70">
                  Update Fulfillment Lifecycle Phase
                </span>
                {isUpdatingStatus && (
                  <span className="text-[10px] text-[#C87D55] animate-pulse">Syncing change...</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_LIST.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    disabled={isUpdatingStatus}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedOrder.status === st
                        ? 'bg-[#1A1A1A] text-[#FAF8F5] shadow-xs'
                        : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    Mark as {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Payment Status Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">Payment Method & Status</span>
                <span className="font-semibold text-sm text-[#1A1A1A]">{selectedOrder.paymentMethod}</span>
              </div>

              <div className="flex items-center gap-2">
                {(['Paid', 'Pending', 'Failed'] as PaymentStatus[]).map((ps) => (
                  <button
                    key={ps}
                    onClick={() => handleUpdatePayment(selectedOrder.id, ps)}
                    disabled={isUpdatingStatus}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedOrder.paymentStatus === ps
                        ? ps === 'Paid'
                          ? 'bg-[#5B7065] text-white'
                          : ps === 'Failed'
                          ? 'bg-[#8B3A2B] text-white'
                          : 'bg-[#C87D55] text-white'
                        : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                    }`}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient and Shipping Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-[#1A1A1A]/10 bg-white space-y-1.5">
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Recipient Information
                </h4>
                <p className="font-serif text-base font-medium text-[#1A1A1A]">{selectedOrder.customer?.name || 'Patron'}</p>
                <p className="text-[#1A1A1A]/70 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#1A1A1A]/40" /> {selectedOrder.customer?.email || '—'}
                </p>
                <p className="text-[#1A1A1A]/70 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#1A1A1A]/40" /> {selectedOrder.customer?.phone || '—'}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[#1A1A1A]/10 bg-white space-y-1.5">
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Destination
                </h4>
                <p className="font-medium text-xs text-[#1A1A1A]">
                  {selectedOrder.deliveryAddress?.street || 'Address on file'}
                  {selectedOrder.deliveryAddress?.apartment ? `, ${selectedOrder.deliveryAddress.apartment}` : ''}
                </p>
                <p className="text-[#1A1A1A]/70">
                  {[selectedOrder.deliveryAddress?.city, selectedOrder.deliveryAddress?.district].filter(Boolean).join(', ')}
                </p>
                <p className="text-[#1A1A1A]/70">
                  {selectedOrder.deliveryAddress?.postalCode || '00100'} • {selectedOrder.deliveryAddress?.country || 'Sri Lanka'}
                </p>
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50">
                Formulation Breakdown ({selectedOrder.items?.length || 0} items)
              </h4>
              <div className="divide-y divide-[#1A1A1A]/10 border-t border-b border-[#1A1A1A]/10">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.productImage || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                        alt={it.productName}
                        className="w-11 h-13 object-cover rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/5"
                      />
                      <div>
                        <p className="font-serif text-sm font-medium text-[#1A1A1A]">{it.productName}</p>
                        <p className="text-[10px] text-[#1A1A1A]/50 font-mono">
                          SKU: {it.sku || it.productId?.slice(0, 8)} • {it.size} × Qty {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[#1A1A1A]">
                      LKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 bg-[#FAF8F5] p-4 rounded-2xl border border-[#1A1A1A]/10">
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Subtotal</span>
                <span>LKR {(selectedOrder.subtotal || 0).toLocaleString()}</span>
              </div>
              {Number(selectedOrder.discount) > 0 && (
                <div className="flex justify-between text-[#C87D55]">
                  <span>Discount Applied</span>
                  <span>- LKR {(selectedOrder.discount || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Standard Cleanroom Delivery</span>
                <span>LKR {(selectedOrder.shipping || 450).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#1A1A1A]/10 flex justify-between font-serif font-bold text-base text-[#1A1A1A]">
                <span>Total Settled Value</span>
                <span>LKR {(selectedOrder.total || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Registry Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
