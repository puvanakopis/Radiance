'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flower2 } from 'lucide-react';
import { mockCategories } from '../../data/mockProducts';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[#FAF8F5]/98 backdrop-blur-xl border-b border-[#1A1A1A]/10 shadow-2xl py-10 px-8 z-40 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Categories columns */}
        <div className="col-span-8 grid grid-cols-3 gap-8">
          {mockCategories.slice(0, 3).map((category) => (
            <div key={category.id} className="space-y-4">
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                onClick={onClose}
                className="font-serif text-lg tracking-wide text-[#1A1A1A] hover:text-[#C87D55] transition-colors flex items-center gap-1.5 group"
              >
                <span>{category.name}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>

              <ul className="space-y-2.5">
                {category.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link
                      href={`/products?category=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`}
                      onClick={onClose}
                      className="text-xs uppercase tracking-[0.14em] text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Editorial Featured Card */}
        <div className="col-span-4 border-l border-[#1A1A1A]/10 pl-8">
          <div className="relative rounded-2xl overflow-hidden group aspect-[16/10] bg-[#1A1A1A]">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              alt="The Morning Ritual Discovery Set"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-[#C87D55] mb-1">
                <Flower2 className="w-3 h-3 stroke-[1.75]" /> Featured Ritual
              </span>
              <h4 className="font-serif text-lg text-[#FAF8F5] leading-snug mb-1">
                The Morning Glow Trilogy
              </h4>
              <p className="text-[11px] text-[#FAF8F5]/70 mb-3 line-clamp-2">
                Restores cellular vitality with cold-pressed green tea bio-actives and quadruple hyaluronic acid.
              </p>
              <Link
                href="/products?category=Gift%20Sets"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FAF8F5] hover:text-[#C87D55] transition-colors uppercase tracking-wider"
              >
                <span>Shop Discovery Set</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
