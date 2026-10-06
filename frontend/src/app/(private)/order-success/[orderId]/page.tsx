'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }
      try {
        const found = await orderService.getOrderById(orderId);
        setOrder(found);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <Skeleton variant="text" className="w-1/2 h-10 mx-auto" />
        <Skeleton variant="card" className="h-64 max-w-3xl mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="Order Details Not Found"
          description="We could not locate the details for this order reference. You can view all your orders in your account portal."
          actionText="View My Orders"
          actionHref="/orders"
        />
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="max-w-4xl mx-auto space-y-12 text-center">
        {/* Success Badge Banner */}
      <div className="space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#8A9A86]/20 text-[#8A9A86] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          Ritual Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A]">
          Thank you for choosing Skinova.
        </h1>
        <p className="text-sm text-[#1A1A1A]/70 max-w-md mx-auto leading-relaxed">
          Your botanical formulations are being carefully prepared in our cleanroom facility.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAE3D9]/60 border border-[#1A1A1A]/10 text-xs font-semibold text-[#1A1A1A]">
          <span>Order Reference: #{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-10 shadow-xs text-left space-y-8">
        {/* Timeline Stepper */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#1A1A1A]">Fulfillment Lifecycle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.completed ? 'bg-[#8A9A86]' : 'bg-[#EAE3D9]'
                      }`}
                    />
                    <div className="flex-1 h-[2px] bg-[#1A1A1A]/10 hidden sm:block" />
                  </div>
                  <span className="text-xs font-medium text-[#1A1A1A] block">{step.status}</span>
                  <span className="text-[10px] text-[#1A1A1A]/50 block">{step.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ordered items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-4 border-t border-[#1A1A1A]/10 pt-6">
            <h3 className="font-serif text-lg text-[#1A1A1A]">Formulation Summary</h3>
            <div className="divide-y divide-[#1A1A1A]/10">
              {order.items.map((item, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded-xl bg-[#EAE3D9]/40 shrink-0"
                    />
                    <div>
                      <span className="font-serif text-sm font-medium text-[#1A1A1A] block">
                        {item.productName}
                      </span>
                      <span className="text-[#1A1A1A]/50">
                        {item.size} • Qty {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1A1A1A]">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[#1A1A1A]/10 pt-4 text-xs">
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Subtotal</span>
                <span>LKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Delivery</span>
                <span>LKR {(order.shipping ?? 450).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-[#1A1A1A] pt-2 border-t border-[#1A1A1A]/10">
                <span>Total Paid</span>
                <span>LKR {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details */}
        {order.deliveryAddress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#1A1A1A]/10 pt-6 text-xs">
            <div className="space-y-1">
              <span className="font-semibold uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C87D55]" /> Delivery Address
              </span>
              <p className="text-[#1A1A1A] font-medium">{order.deliveryAddress.recipientName}</p>
              <p className="text-[#1A1A1A]/70">{order.deliveryAddress.street}</p>
              <p className="text-[#1A1A1A]/70">
                {order.deliveryAddress.city}, {order.deliveryAddress.district} ({order.deliveryAddress.postalCode})
              </p>
              <p className="text-[#1A1A1A]/70">Phone: {order.deliveryAddress.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#C87D55]" /> Payment Mode
              </span>
              <p className="text-[#1A1A1A] font-medium">{order.paymentMethod}</p>
              <p className="text-[#1A1A1A]/70">Status: {order.paymentStatus}</p>
              {order.paymentReference && (
                <p className="text-[#1A1A1A]/50">Ref: {order.paymentReference}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link href="/products">
          <Button variant="primary" size="lg" icon={ArrowRight}>
            Continue Shopping
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" size="lg">
            View All Orders
          </Button>
        </Link>
      </div>
      </div>
    </div>
  );
}
