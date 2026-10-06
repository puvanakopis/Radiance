'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { Button } from '@/components/ui/Button';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';

export default function WishlistPage() {
  const { items, totalWishlist, clearWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <AccountLayout
      subtitle="Saved Formulations"
      title="Saved Wishlist"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Patron Sanctuary', href: '/account' },
        { label: 'Saved Wishlist' },
      ]}
      action={
        <Link href="/products">
          <Button variant="outline" size="sm" icon={Sparkles}>
            Explore Catalog
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Wishlist Header / Stats Bar */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87D55]/15 text-[#C87D55] flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A]">
                Earmarked Botanical Formulas
              </h2>
              <p className="text-xs text-[#1A1A1A]/50">
                {totalWishlist} {totalWishlist === 1 ? 'item saved' : 'items saved'} for your forthcoming rituals
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={clearWishlist}
                className="text-xs text-[#1A1A1A]/50 hover:text-red-600 transition-colors underline cursor-pointer"
              >
                Clear All
              </button>
              <Link href="/products">
                <Button variant="primary" size="sm">
                  Add More Items
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#EAE3D9]/60 flex items-center justify-center mx-auto text-[#1A1A1A]/50">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A]">Nothing Saved Yet</h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto leading-relaxed">
              Save the botanical formulas and skincare essentials you wish to revisit for your future rituals.
            </p>
            <div className="pt-2">
              <Link href="/products">
                <Button variant="primary" size="sm">
                  Explore All Formulations
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </AccountLayout>
  );
}
