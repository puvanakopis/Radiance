'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Tag, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function CartPage() {
  const {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const [couponCode, setCouponCode] = useState('');
  const router = useRouter();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  const handleSaveForLater = (item: any) => {
    toggleWishlist(item.product);
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#EAE3D9]/60 flex items-center justify-center mx-auto text-[#1A1A1A]/50">
          <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Your Bag Is Empty</h1>
        <p className="text-sm text-[#1A1A1A]/60 max-w-md mx-auto leading-relaxed">
          Discover our curated collection of botanical skincare, haircare, and body rituals formulated for everyday radiance.
        </p>
        <div className="pt-2">
          <Link href="/products">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Explore Formulations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div className="flex items-baseline justify-between border-b border-[#1A1A1A]/10 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Your Shopping Bag</h1>
        <span className="text-xs uppercase tracking-widest text-[#1A1A1A]/60">
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="hidden sm:grid grid-cols-12 text-xs uppercase tracking-widest text-[#1A1A1A]/50 pb-3 border-b border-[#1A1A1A]/10 font-semibold">
            <span className="col-span-6">Formulation</span>
            <span className="col-span-3 text-center">Quantity</span>
            <span className="col-span-3 text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-[#1A1A1A]/10">
            {items.map((item) => (
              <div key={item.id} className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Product details */}
                <div className="sm:col-span-6 flex items-center gap-4">
                  <Link href={`/products/${item.product.id}`} className="shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-2xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/5"
                    />
                  </Link>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-medium">
                      {item.product.category}
                    </span>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-serif text-base text-[#1A1A1A] hover:text-[#C87D55] transition-colors block font-medium"
                    >
                      {item.product.name}
                    </Link>
                    <span className="text-xs text-[#1A1A1A]/60 block">{item.selectedSize}</span>
                    <span className="text-xs font-semibold text-[#1A1A1A] sm:hidden block pt-1">
                      LKR {item.product.price.toLocaleString()}
                    </span>

                    {/* Quick actions */}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="text-[11px] text-[#1A1A1A]/60 hover:text-[#C87D55] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-3 h-3" /> Save for later
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-[#1A1A1A]/60 hover:text-[#C87D55] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-3 flex sm:justify-center">
                  <div className="flex items-center border border-[#1A1A1A]/20 rounded-full px-3 py-1.5 bg-white shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="sm:col-span-3 text-left sm:text-right">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    LKR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link
              href="/products"
              className="text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C87D55] transition-colors font-medium"
            >
              ← Continue Browsing
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-serif text-xl text-[#1A1A1A]">Order Summary</h3>

            {/* Subtotal breakdown */}
            <div className="space-y-3 text-xs border-b border-[#1A1A1A]/10 pb-5">
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-[#1A1A1A]">LKR {subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#8A9A86] font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Discount ({appliedCoupon})
                  </span>
                  <span>-LKR {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Islandwide Delivery</span>
                <span className="font-medium text-[#1A1A1A]">
                  {shipping === 0 ? 'FREE' : `LKR ${shipping.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#1A1A1A]">Estimated Total</span>
              <span className="font-serif text-2xl font-medium text-[#1A1A1A]">
                LKR {total.toLocaleString()}
              </span>
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2 pt-2">
              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-[#8A9A86]/15 border border-[#8A9A86]/30 flex items-center justify-between text-xs text-[#1A1A1A]">
                  <span className="font-semibold">{appliedCoupon} Applied</span>
                  <button onClick={removeCoupon} className="text-[#C87D55] hover:underline font-medium">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. SKINOVA10)"
                    className="flex-1 bg-[#FAF8F5] border border-[#1A1A1A]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#1A1A1A]/50">
              <ShieldCheck className="w-4 h-4 text-[#8A9A86]" />
              <span>Encrypted SSL 256-Bit Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
