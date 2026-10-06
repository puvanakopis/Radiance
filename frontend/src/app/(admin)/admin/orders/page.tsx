'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle2, 
  Truck, 
  Package, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { orderService } from '@/services/orderService';
import { useToast } from '@/context/ToastContext';
import { Order, OrderStatus } from '@/types';

const STATUS_TABS: (OrderStatus | 'All')[] = ['All', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { showToast } = useToast();

  const loadOrders = async () => {
    const data = await orderService.getOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setSelectedOrder(updated);
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order #${updated.orderNumber} moved to ${newStatus}`,
      });
      loadOrders();
    } catch (err) {
      showToast({ type: 'error', title: 'Could not update status' });
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = activeStatus === 'All' || o.status === activeStatus;
    const matchesSearch = 
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-1">
          Fulfillment Registry
        </span>
        <h1 className="font-serif text-3xl text-[#1A1A1A]">Order Management</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === st
                  ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                  : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="py-4 px-6 font-serif font-semibold text-[#1A1A1A]">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-[#1A1A1A]">{ord.customer?.name || 'Patron'}</p>
                    <p className="text-[10px] text-[#1A1A1A]/50">{ord.customer?.phone || '—'}</p>
                  </td>
                  <td className="py-4 px-6 text-[#1A1A1A]/70">
                    {ord.date ? new Date(ord.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="py-4 px-6 text-[#1A1A1A]/70">
                    {ord.items?.length || 0} {(ord.items?.length || 0) === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                    LKR {(ord.total || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-[#1A1A1A]/80">{ord.paymentMethod}</span>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        ord.status === 'Delivered'
                          ? 'sage'
                          : ord.status === 'Shipped'
                          ? 'terracotta'
                          : 'dark'
                      }
                      size="xs"
                    >
                      {ord.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs font-medium hover:bg-[#1A1A1A] hover:text-[#FAF8F5] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Lifecycle Stepper Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Reference #${selectedOrder?.orderNumber}`}
        subtitle={`Current Lifecycle: ${selectedOrder?.status}`}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Advance Status Action */}
            <div className="p-4 rounded-2xl bg-[#EAE3D9]/50 border border-[#1A1A1A]/10 space-y-3">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/60 block">
                Update Fulfillment Phase
              </span>
              <div className="flex flex-wrap gap-2">
                {(['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedOrder.status === st
                        ? 'bg-[#1A1A1A] text-[#FAF8F5] shadow-sm'
                        : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    Mark as {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50 mb-1">
                  Recipient Information
                </h4>
                <p className="font-semibold text-sm text-[#1A1A1A]">{selectedOrder.customer?.name || 'Patron'}</p>
                <p className="text-[#1A1A1A]/70">{selectedOrder.customer?.email || '—'}</p>
                <p className="text-[#1A1A1A]/70">{selectedOrder.customer?.phone || '—'}</p>
              </div>

              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50 mb-1">
                  Delivery Destination
                </h4>
                <p className="text-[#1A1A1A]">{selectedOrder.deliveryAddress?.street || 'Address on file'}</p>
                <p className="text-[#1A1A1A]/70">
                  {selectedOrder.deliveryAddress?.city || ''}, {selectedOrder.deliveryAddress?.district || ''} ({selectedOrder.deliveryAddress?.postalCode || ''})
                </p>
                <p className="text-[#1A1A1A]/70">{selectedOrder.deliveryAddress?.country || 'Sri Lanka'}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/50">
                Formulation Breakdown
              </h4>
              <div className="divide-y divide-[#1A1A1A]/10">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.productImage || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'} alt={it.productName} className="w-10 h-12 object-cover rounded-lg bg-[#FAF8F5]" />
                      <div>
                        <p className="font-serif text-sm font-medium text-[#1A1A1A]">{it.productName}</p>
                        <p className="text-[10px] text-[#1A1A1A]/50">SKU: {it.sku} • {it.size} × Qty {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">
                      LKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-[#1A1A1A]/10 pt-3 flex justify-between font-serif font-semibold text-base text-[#1A1A1A]">
              <span>Total Value</span>
              <span>LKR {(selectedOrder.total || 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
