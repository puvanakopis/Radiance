'use client';

import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Rating } from '../ui/Rating';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#EAE3D9]/40 border border-[#1A1A1A]/10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            {product.status === 'Low Stock' && <Badge variant="terracotta" size="xs">Low Stock</Badge>}
            {product.status === 'Out of Stock' && <Badge variant="dark" size="xs">Sold Out</Badge>}
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-medium">
              {product.category}
            </span>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] font-medium leading-tight">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-serif text-xl font-medium text-[#1A1A1A]">
              LKR {product.price.toLocaleString()}
            </span>
            <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          <p className="text-xs text-[#1A1A1A]/70 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-3 pt-2 border-t border-[#1A1A1A]/10">
            {/* Quantity Selector & Add to Bag */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#1A1A1A]/15 rounded-full bg-white px-2 py-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold text-[#1A1A1A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.status === 'Out of Stock'}
              >
                {product.status !== 'Out of Stock' ? `Add to Bag • LKR ${(product.price * quantity).toLocaleString()}` : 'Out of Stock'}
              </Button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-11 h-11 rounded-full border border-[#1A1A1A]/15 flex items-center justify-center transition-colors cursor-pointer ${
                  isSaved ? 'bg-[#C87D55] text-white border-transparent' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs text-[#C87D55] font-semibold hover:underline"
              >
                <span>View Full Clinical Details & Ritual Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
