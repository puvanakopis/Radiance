'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { productService } from '@/services/productService';
import { Rating } from '../ui/Rating';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Vitamin C', 'Moisturizer', 'Sunscreen', 'Niacinamide', 'Hair Mask', 'Ceramides', 'Cleanser'];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts({ searchQuery: query });
        setResults(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && query.trim()) {
      onClose();
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
  };

  const handleViewAllResults = () => {
    onClose();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full bg-[#FAF8F5] border-b border-[#1A1A1A]/10 shadow-2xl px-4 sm:px-6 lg:px-8 pt-8 pb-10"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header input bar */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-[#1A1A1A] pb-3">
                <div className="flex items-center gap-3 flex-1">
                  <Search className="w-6 h-6 text-[#1A1A1A] stroke-[2]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search formulations, botanical actives, concerns..."
                    className="w-full bg-transparent font-serif text-xl sm:text-2xl text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="text-xs uppercase tracking-widest text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[#1A1A1A] hover:bg-black/10 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Popular search tags */}
              {!query && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
                    Frequently Explored
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handlePopularClick(term)}
                        className="px-3.5 py-1.5 rounded-full bg-[#EAE3D9]/60 hover:bg-[#EAE3D9] text-xs font-medium text-[#1A1A1A] transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live search results */}
              {query && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs text-[#1A1A1A]/60">
                    <span>
                      {isLoading ? 'Searching archives...' : `${results.length} results matching "${query}"`}
                    </span>
                    {results.length > 0 && (
                      <button
                        onClick={handleViewAllResults}
                        className="font-medium text-[#C87D55] hover:underline flex items-center gap-1"
                      >
                        View all in shop <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-white border border-[#1A1A1A]/5 hover:border-[#C87D55]/50 flex items-center gap-3 transition-all hover:shadow-md group"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-16 object-cover rounded-xl bg-[#FAF8F5]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-[#C87D55] font-semibold block">
                            {product.category}
                          </span>
                          <h4 className="font-serif text-sm font-medium text-[#1A1A1A] group-hover:text-[#C87D55] transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-semibold text-[#1A1A1A]">
                              LKR {product.price.toLocaleString()}
                            </span>
                            <Rating rating={product.rating} showNumber={false} size="xs" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {!isLoading && results.length === 0 && (
                    <div className="py-8 text-center text-sm text-[#1A1A1A]/60 space-y-1">
                      <p>No formulations matched "{query}".</p>
                      <p className="text-xs text-[#1A1A1A]/40">
                        Try searching by botanical active, e.g. "Niacinamide", or product types like "Serum".
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
