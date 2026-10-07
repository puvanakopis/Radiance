'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Package,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { productService } from '@/services/productService';
import { useToast } from '@/context/ToastContext';
import { Product, ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
type StockFilter = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-desc' | 'stock-asc';

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states matching product schema
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Skincare');
  const [subcategory, setSubcategory] = useState('General');
  const [price, setPrice] = useState(8900);
  const [size, setSize] = useState('50ml');
  const [stock, setStock] = useState<number>(25);
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [skinTypesText, setSkinTypesText] = useState('All Skin Types');
  const [imageUrl, setImageUrl] = useState('');

  const { showToast } = useToast();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Could not load products' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, sortBy]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Skincare');
    setSubcategory('General');
    setPrice(6500);
    setSize('50ml');
    setStock(25);
    setDescription('');
    setLongDescription('');
    setHowToUse('');
    setIngredientsText('Aqua, Glycerin, Botanical Extract, Hyaluronic Acid');
    setSkinTypesText('All Skin Types');
    setImageUrl('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setSubcategory(p.subcategory || 'General');
    setPrice(p.price);
    setSize(p.size || '50ml');
    setStock(p.stock ?? 0);
    setDescription(p.description);
    setLongDescription(p.longDescription || '');
    setHowToUse(p.howToUse || '');
    setIngredientsText((p.ingredients || []).join(', '));
    setSkinTypesText((p.skinTypes || ['All Skin Types']).join(', '));
    setImageUrl(p.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProduct(deletingProduct.id);
      showToast({ type: 'info', title: 'Product Deleted', message: `${deletingProduct.name} removed from catalog.` });
      setDeletingProduct(null);
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Failed to delete product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedIngredients = ingredientsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedSkinTypes = skinTypesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name,
          category,
          subcategory,
          price: Number(price),
          size,
          description,
          longDescription: longDescription || description,
          howToUse,
          ingredients: parsedIngredients,
          skinTypes: parsedSkinTypes.length > 0 ? (parsedSkinTypes as any) : ['All Skin Types'],
          image: imageUrl,
          stock: Math.max(0, Number(stock)),
        });
        showToast({ type: 'success', title: 'Product Updated Successfully' });
      } else {
        await productService.createProduct({
          name,
          category,
          subcategory: subcategory || 'General',
          price: Number(price),
          size: size || '50ml',
          description,
          longDescription: longDescription || description,
          ingredients: parsedIngredients.length > 0 ? parsedIngredients : ['Pure Distilled Aqua', 'Botanical Bio-Lipids', 'Hyaluronic Acid'],
          activeIngredients: [{ name: 'Botanical Bio-Actives', benefit: 'Barrier fortification & dermal hydration' }],
          howToUse: howToUse || 'Dispense 2-3 drops into palms and press gently into cleansed skin.',
          skinTypes: parsedSkinTypes.length > 0 ? (parsedSkinTypes as any) : ['All Skin Types'],
          image: imageUrl,
          rating: 5.0,
          reviewCount: 0,
          reviews: [],
          stock: Math.max(0, Number(stock)),
        });
        showToast({ type: 'success', title: 'New Formulation Created' });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Error saving product formulation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStockFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => (p.stock ?? 0) > 0).length;
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
    const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stock ?? 0)), 0);

    return { total, inStock, outOfStock, lowStock, totalInventoryValue };
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query);

        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

        const currentStock = p.stock ?? 0;
        let matchesStock = true;
        if (stockFilter === 'In Stock') matchesStock = currentStock > 0;
        else if (stockFilter === 'Low Stock') matchesStock = currentStock > 0 && currentStock <= 5;
        else if (stockFilter === 'Out of Stock') matchesStock = currentStock === 0;

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'stock-desc') return (b.stock ?? 0) - (a.stock ?? 0);
        if (sortBy === 'stock-asc') return (a.stock ?? 0) - (b.stock ?? 0);
        return 0; // Default order
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || stockFilter !== 'All' || sortBy !== 'newest';

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block mb-1">
            Cleanroom Catalog & Inventory
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Products & Stock Management</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Maintain formulation catalog, oversee batch stocks, and configure pricing tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={loadProducts}
            disabled={isLoading}
          >
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>

          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddModal}>
            Add Formulation
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Formulations */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold block">
              Total Formulations
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.total}
            </span>
            <span className="text-[10px] text-[#1A1A1A]/60 mt-0.5 block">
              Across {CATEGORIES.length} categories
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#5B7065] font-semibold block">
              Available in Stock
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.inStock}
            </span>
            <span className="text-[10px] text-[#5B7065] mt-0.5 block">
              {metrics.total > 0 ? Math.round((metrics.inStock / metrics.total) * 100) : 0}% fulfillment ready
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5B7065]/10 border border-[#5B7065]/20 flex items-center justify-center text-[#5B7065]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Low / Out of Stock */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block">
              Stock Alerts
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {metrics.outOfStock + metrics.lowStock}
            </span>
            <span className="text-[10px] text-[#C87D55] mt-0.5 block">
              {metrics.outOfStock} out of stock • {metrics.lowStock} low
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C87D55]/10 border border-[#C87D55]/20 flex items-center justify-center text-[#C87D55]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Valuation */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold block">
              Inventory Value
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              LKR {(metrics.totalInventoryValue / 1000).toFixed(0)}k
            </span>
            <span className="text-[10px] text-[#1A1A1A]/60 mt-0.5 block">
              Live valuation at retail
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAE3D9] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Dropdowns */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations by name, ID, or subcategory..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-all placeholder:text-[#1A1A1A]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Category: All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Stock Status Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Stock: All Levels</option>
                <option value="In Stock">Stock: Available In Stock</option>
                <option value="Low Stock">Stock: Low (≤ 5 units)</option>
                <option value="Out of Stock">Stock: Out of Stock (0)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="newest">Sort: Catalog Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="stock-desc">Stock: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-full border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/60 hover:text-[#C87D55] hover:border-[#C87D55]/30 bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Table View */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Product Formulation</th>
                <th className="py-4 px-6">Category & Type</th>
                <th className="py-4 px-6">Retail Price</th>
                <th className="py-4 px-6">Feedback / Rating</th>
                <th className="py-4 px-6">Inventory Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#1A1A1A]/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#C87D55] border-t-transparent animate-spin" />
                      <span>Loading formulations from catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <Package className="w-10 h-10 text-[#1A1A1A]/20 mx-auto" />
                      <h3 className="font-serif text-lg text-[#1A1A1A]">No Formulations Found</h3>
                      <p className="text-xs text-[#1A1A1A]/60">
                        {hasActiveFilters
                          ? 'No products match the selected criteria or search query. Try clearing your filters.'
                          : 'There are currently no products registered in your catalog.'}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleResetFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const stockCount = prod.stock ?? 0;
                  const isOutOfStock = stockCount === 0;
                  const isLowStock = stockCount > 0 && stockCount <= 5;

                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      {/* Product Formulation & ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                            alt={prod.name}
                            className="w-12 h-14 rounded-xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                          />
                          <div>
                            <span className="font-serif text-sm font-medium text-[#1A1A1A] block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-[#1A1A1A]/50 font-mono">
                              {prod.id} • {prod.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-4 px-6 font-medium text-[#1A1A1A]/80">
                        <div>
                          <span className="font-medium text-[#1A1A1A]">{prod.category}</span>
                          <span className="block text-[10px] text-[#1A1A1A]/50">
                            {prod.subcategory || 'General Care'}
                          </span>
                        </div>
                      </td>

                      {/* Retail Price */}
                      <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                        LKR {prod.price.toLocaleString()}
                      </td>

                      {/* Rating / Reviews */}
                      <td className="py-4 px-6 text-[#1A1A1A]/70">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#C87D55] font-semibold">★ {Number(prod.rating || 5).toFixed(1)}</span>
                          <span className="text-[10px] text-[#1A1A1A]/40">({prod.reviewCount || 0})</span>
                        </div>
                      </td>

                      {/* Stock Level & Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium ${
                            isOutOfStock
                              ? 'bg-[#8B3A2B]/10 text-[#8B3A2B] border border-[#8B3A2B]/20'
                              : isLowStock
                              ? 'bg-[#C87D55]/10 text-[#C87D55] border border-[#C87D55]/20'
                              : 'bg-[#5B7065]/10 text-[#5B7065] border border-[#5B7065]/20'
                          }`}
                        >
                          {isOutOfStock ? (
                            '0 in stock (Out of Stock)'
                          ) : isLowStock ? (
                            `${stockCount} remaining (Low)`
                          ) : (
                            `${stockCount} units available`
                          )}
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect */}
                          <button
                            onClick={() => setInspectProduct(prod)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                            title="Inspect formulation details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#C87D55] text-[#C87D55] hover:bg-[#C87D55]/10 transition-colors cursor-pointer"
                            title="Edit Formulation & Inventory"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#8B3A2B] text-[#1A1A1A]/50 hover:text-[#8B3A2B] hover:bg-[#8B3A2B]/5 transition-colors cursor-pointer"
                            title="Delete Formulation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 sm:px-6 bg-[#FAF8F5]/60 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A1A1A]/60">
          <div>
            <span>
              Showing <strong className="text-[#1A1A1A]">{filteredProducts.length === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> formulations
              {filteredProducts.length !== products.length && ` (filtered from ${products.length})`}
            </span>
          </div>

          {/* Previous / Next Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full font-medium text-[11px] text-[#1A1A1A]">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages || filteredProducts.length === 0}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Product Modal */}
      <Modal
        isOpen={!!inspectProduct}
        onClose={() => setInspectProduct(null)}
        title={inspectProduct?.name || 'Product Details'}
        subtitle={`ID: ${inspectProduct?.id} • Category: ${inspectProduct?.category}`}
        maxWidth="md"
      >
        {inspectProduct && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#1A1A1A]/10">
              <img
                src={inspectProduct.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                alt={inspectProduct.name}
                className="w-16 h-20 rounded-xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/10 shrink-0"
              />
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">{inspectProduct.name}</h3>
                <p className="text-sm font-semibold text-[#1A1A1A]">LKR {inspectProduct.price.toLocaleString()}</p>
                <p className="text-[11px] text-[#1A1A1A]/60">{inspectProduct.size} • {inspectProduct.subcategory || 'General'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">Current Stock</span>
                <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                  {inspectProduct.stock ?? 0} units
                </span>
              </div>
              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">Customer Rating</span>
                <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                  ★ {Number(inspectProduct.rating || 5).toFixed(1)} ({inspectProduct.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/60">Description</h4>
              <p className="text-[#1A1A1A]/80 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#1A1A1A]/5">
                {inspectProduct.description}
              </p>
            </div>

            {inspectProduct.ingredients && inspectProduct.ingredients.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/60">Key Botanical Actives</h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectProduct.ingredients.map((ing, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#1A1A1A]/10 text-[10px] text-[#1A1A1A]/70">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-[#1A1A1A]/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = inspectProduct;
                  setInspectProduct(null);
                  handleOpenEditModal(p);
                }}
              >
                Edit Formulation
              </Button>
              <Button variant="primary" size="sm" onClick={() => setInspectProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Formulation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Formulation & Stock' : 'Create New Formulation'}
        subtitle={editingProduct ? `Modifying formulation: ${editingProduct.name}` : 'Register a new botanical formulation in the catalog'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <Input
            label="Formulation Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Velvet Glow Serum"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block mb-1.5">
                Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full appearance-none bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#1A1A1A] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#1A1A1A]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Input
              label="Subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Serums, Moisturizers"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Retail Price (LKR) *"
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <Input
              label="Unit Volume / Size *"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="30ml / 50ml"
            />

            <Input
              label="Current Stock *"
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 25"
            />
          </div>

          <Input
            label="Product Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
              Short Summary Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of formulation benefits..."
              className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-xl p-3.5 text-sm outline-none focus:border-[#1A1A1A] placeholder:text-[#1A1A1A]/35"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
              Long Formulation Science Description
            </label>
            <textarea
              rows={3}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="In-depth scientific rationale and molecular mechanism..."
              className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-xl p-3.5 text-sm outline-none focus:border-[#1A1A1A] placeholder:text-[#1A1A1A]/35"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="How To Use (The Ritual)"
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              placeholder="e.g. Dispense 2-3 drops into palms..."
            />

            <Input
              label="Skin Types (Comma separated)"
              value={skinTypesText}
              onChange={(e) => setSkinTypesText(e.target.value)}
              placeholder="All Skin Types, Dry, Sensitive"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
              Ingredients List (Comma separated)
            </label>
            <textarea
              rows={2}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="Aqua, Niacinamide, Sodium Hyaluronate, Camellia Sinensis..."
              className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-xl p-3.5 text-sm outline-none focus:border-[#1A1A1A] placeholder:text-[#1A1A1A]/35"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#1A1A1A]/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Remove Formulation from Catalog"
        maxWidth="sm"
      >
        {deletingProduct && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-[#8B3A2B]/10 rounded-2xl border border-[#8B3A2B]/20 text-[#8B3A2B]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Delete {deletingProduct.name}?</p>
                <p className="text-[11px] text-[#8B3A2B]/80 mt-1">
                  This action will permanently delete this formulation ({deletingProduct.id}) from the active catalog and inventory tracking.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="bg-[#8B3A2B] hover:bg-[#722f23] text-white border-none"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
