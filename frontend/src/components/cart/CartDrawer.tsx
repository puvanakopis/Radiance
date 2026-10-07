'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const router = useRouter();

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    router.push('/cart');
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title="Your Bag"
      subtitle={`${totalItems} ${totalItems === 1 ? 'Ritual Item' : 'Ritual Items'}`}
      maxWidth="md"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#1A1A1A]/70 uppercase tracking-wider text-xs font-medium">Subtotal</span>
              <span className="font-serif text-lg font-medium text-[#1A1A1A]">
                LKR {subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#1A1A1A]/50">
              Taxes and shipping calculated at checkout.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="md" onClick={handleViewCart}>
                View Bag
              </Button>
              <Button variant="primary" size="md" icon={ArrowRight} onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >

      {/* Cart Items List */}
      {items.length > 0 ? (
        <div className="divide-y divide-[#1A1A1A]/10">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex gap-4 items-start group">
              <Link href={`/products/${item.product.id}`} onClick={closeDrawer} className="shrink-0">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded-xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/5"
                />
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.product.id}`}
                      onClick={closeDrawer}
                      className="font-serif text-sm font-medium text-[#1A1A1A] hover:text-[#C87D55] transition-colors truncate"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#1A1A1A]/40 hover:text-[#C87D55] transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-[#1A1A1A]/60 uppercase tracking-wider block">
                    {item.selectedSize}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#1A1A1A]/15 rounded-full bg-white px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-[#1A1A1A]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    LKR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAE3D9]/60 flex items-center justify-center mx-auto text-[#1A1A1A]/50">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h4 className="font-serif text-xl text-[#1A1A1A]">Your bag is empty</h4>
          <p className="text-xs text-[#1A1A1A]/60 max-w-xs mx-auto leading-relaxed">
            Discover intentional botanical essentials formulated for radiant, healthy everyday skin.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                closeDrawer();
                router.push('/products');
              }}
            >
              Explore Products
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
