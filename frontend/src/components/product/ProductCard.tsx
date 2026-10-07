'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);
  const productImage = product.image;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div className="group relative flex flex-col h-full double-bezel-outer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-xl">
      <div className="double-bezel-inner flex flex-col h-full p-2.5 bg-white relative overflow-hidden">
        {/* Single Image Frame */}
        <div className="relative aspect-[4/5] rounded-[calc(1.75rem-0.75rem)] overflow-hidden bg-[#FAF8F5]">
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Status Indicator Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.status === 'Low Stock' && <Badge variant="terracotta" size="xs">Low Stock</Badge>}
            {product.status === 'Out of Stock' && <Badge variant="dark" size="xs">Sold Out</Badge>}
          </div>

          {/* Top-right Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              isSaved
                ? 'bg-[#C87D55] text-white shadow-md'
                : 'bg-white/80 backdrop-blur-md text-[#1A1A1A]/70 hover:bg-white hover:text-[#1A1A1A]'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom Action overlay (Desktop) */}
          <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-between gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
            {onQuickView && (
              <button
                onClick={handleQuickViewClick}
                className="flex-1 py-2 px-3 rounded-xl bg-white/95 backdrop-blur-md text-[#1A1A1A] text-xs font-medium uppercase tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
            )}

            <button
              onClick={handleQuickAdd}
              disabled={product.status === 'Out of Stock'}
              className="py-2 px-3 rounded-xl bg-[#1A1A1A] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider hover:bg-[#C87D55] transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A]/50 font-medium">
                {product.category}
              </span>
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="xs" />
            </div>

            <Link href={`/products/${product.id}`} className="block group-hover:text-[#C87D55] transition-colors">
              <h3 className="font-serif text-base font-normal text-[#1A1A1A] line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Pricing & Mobile Quick Add */}
          <div className="flex items-center justify-between pt-1 border-t border-[#1A1A1A]/5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-medium text-xs text-[#1A1A1A]">
                LKR {product.price.toLocaleString()}
              </span>
            </div>

            {/* Mobile Add to Cart button */}
            <button
              onClick={handleQuickAdd}
              disabled={product.status === 'Out of Stock'}
              className="sm:hidden w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#C87D55] transition-colors active:scale-95 disabled:opacity-50"
              aria-label="Add to bag"
            >
              {isAdded ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
