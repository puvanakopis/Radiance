'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { productService } from '@/services/productService';
import { Product, ProductCategory, SkinType } from '@/types';

const CATEGORIES: ProductCategory[] = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
const SKIN_TYPES: SkinType[] = ['All Skin Types', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter States
  const categoryParam = searchParams.get('category');
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(
    categoryParam ? [categoryParam as ProductCategory] : []
  );
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<SkinType[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const searchQuery = searchParams.get('q') || '';

  // Synchronize URL parameters if changed from navbar
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && !selectedCategories.includes(cat as ProductCategory)) {
      setSelectedCategories([cat as ProductCategory]);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts({
          categories: selectedCategories,
          skinTypes: selectedSkinTypes,
          priceRange,
          minRating,
          sortBy,
          searchQuery,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategories, selectedSkinTypes, priceRange, minRating, sortBy, searchQuery]);

  const toggleCategory = (cat: ProductCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSkinType = (type: SkinType) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSkinTypes([]);
    setPriceRange([0, 30000]);
    setMinRating(0);
    router.push('/products');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      selectedSkinTypes.length > 0 ||
      minRating > 0 ||
      searchQuery !== ''
    );
  }, [selectedCategories, selectedSkinTypes, minRating, searchQuery]);

  const FilterPanel = () => (
    <div className="space-y-8 text-left">
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]">
          Categories
        </h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/75 hover:text-[#1A1A1A] cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-[#1A1A1A]/30 text-[#1A1A1A] focus:ring-0 focus:ring-offset-0"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skin Type */}
      <div className="space-y-3 border-t border-[#1A1A1A]/10 pt-6">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]">
          Skin Type
        </h4>
        <div className="space-y-2">
          {SKIN_TYPES.map((st) => (
            <label
              key={st}
              className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/75 hover:text-[#1A1A1A] cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedSkinTypes.includes(st)}
                onChange={() => toggleSkinType(st)}
                className="w-4 h-4 rounded border-[#1A1A1A]/30 text-[#1A1A1A] focus:ring-0 focus:ring-offset-0"
              />
              <span>{st}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 border-t border-[#1A1A1A]/10 pt-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]">
          <span>Max Price</span>
          <span className="text-[#C87D55]">LKR {priceRange[1].toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="4000"
          max="30000"
          step="500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full accent-[#1A1A1A] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#1A1A1A]/40">
          <span>LKR 4,000</span>
          <span>LKR 30,000</span>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t border-[#1A1A1A]/10">
          <button
            onClick={clearAllFilters}
            className="w-full py-2.5 rounded-full border border-[#1A1A1A]/20 text-xs uppercase tracking-wider font-medium text-[#1A1A1A] hover:bg-black/5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Shop All Formulations' }]} />

      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A]">
            {searchQuery ? `Inquiry: "${searchQuery}"` : 'Shop All Formulations'}
          </h1>
          <span className="text-xs px-3 py-1 rounded-full bg-[#EAE3D9]/60 text-[#1A1A1A] font-medium">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60 max-w-2xl font-light leading-relaxed">
          Explore biocompatible botanical rituals designed to restore equilibrium and dermal luminosity.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1A1A1A]/10">
        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden px-4 py-2.5 rounded-full border border-[#1A1A1A]/20 bg-white text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
        </button>

        {/* Active Chips */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 flex-1">
          {selectedCategories.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A]"
            >
              <span>{c}</span>
              <button onClick={() => toggleCategory(c)} className="hover:text-[#C87D55]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedSkinTypes.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A]"
            >
              <span>{st}</span>
              <button onClick={() => toggleSkinType(st)} className="hover:text-[#C87D55]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#C87D55] font-medium hover:underline ml-2 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs uppercase tracking-wider text-[#1A1A1A]/60 hidden sm:inline">Sort By</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-[#1A1A1A]/15 rounded-full px-4 py-2 pr-9 text-xs uppercase tracking-wider font-medium text-[#1A1A1A] outline-none cursor-pointer focus:border-[#1A1A1A]"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Shop Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs">
            <FilterPanel />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-9">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            columns={3}
            onQuickView={(p) => setQuickViewProduct(p)}
            onClearFilters={clearAllFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Formulations"
        subtitle="Refine your botanical rituals"
        position="left"
        footer={
          <Button
            variant="primary"
            fullWidth
            onClick={() => setIsMobileFilterOpen(false)}
          >
            Show {products.length} Results
          </Button>
        }
      >
        <FilterPanel />
      </Drawer>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="pt-36 pb-24 text-center">Loading formulations...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
