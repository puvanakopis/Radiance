'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { productService } from '@/services/productService';
import { useToast } from '@/context/ToastContext';
import { Product, ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
type StockFilter = 'All' | 'In Stock' | 'Out of Stock';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states matching product.model.js
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateStock = async (product: Product, newStock: number) => {
    try {
      await productService.updateProduct(product.id, {
        stock: Math.max(0, newStock),
      });
      showToast({
        type: 'success',
        title: 'Inventory Updated',
        message: `${product.name} stock updated to ${Math.max(0, newStock)} units`,
      });
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Could not update stock count' });
    }
  };

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this product formulation from the catalog?')) {
      await productService.deleteProduct(id);
      showToast({ type: 'info', title: 'Product Deleted' });
      loadProducts();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
        showToast({ type: 'success', title: 'New Product Created' });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Error saving product' });
    }
  };

  const outOfStockCount = products.filter(p => (p.stock ?? 0) === 0).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'In Stock' ? (p.stock ?? 0) > 0 : (p.stock ?? 0) === 0);

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-1">
            Cleanroom Catalog & Inventory
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Products & Stock Management</h1>
        </div>

        <div className="flex items-center gap-3">
          {outOfStockCount > 0 && (
            <button
              onClick={() => setStockFilter('Out of Stock')}
              className="px-4 py-2 rounded-2xl bg-[#C87D55]/15 border border-[#C87D55]/30 flex items-center gap-2 text-xs font-semibold text-[#C87D55] hover:bg-[#C87D55]/25 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{outOfStockCount} Out of Stock Alerts</span>
            </button>
          )}

          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAddModal}>
            Add Formulation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulations by name, ID, or subcategory..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          {/* Stock state pills: In Stock (Stock > 0), Out of Stock (Stock = 0) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(['All', 'In Stock', 'Out of Stock'] as StockFilter[]).map((st) => (
              <button
                key={st}
                onClick={() => setStockFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  stockFilter === st
                    ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                    : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
              >
                {st === 'In Stock' ? 'In Stock' : st === 'Out of Stock' ? 'Out of Stock ' : 'All Stock'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#1A1A1A]/5">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C87D55] text-white font-semibold'
                  : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Product Table */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category & Subcategory</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Rating / Reviews</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
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
                        <span className="text-[10px] text-[#1A1A1A]/50">ID: {prod.id} • {prod.size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-[#1A1A1A]/80">
                    <div>
                      <span>{prod.category}</span>
                      <span className="block text-[10px] text-[#1A1A1A]/50">{prod.subcategory || 'General'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                    LKR {prod.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-[#1A1A1A]/70">
                    {prod.rating !== null && prod.rating !== undefined
                      ? `★ ${Number(prod.rating).toFixed(1)} (${prod.reviewCount || 0} reviews)`
                      : '★ New (0 reviews)'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold ${
                          (prod.stock ?? 0) > 10
                            ? 'bg-[#8A9A86]/15 text-[#6B7B67] border border-[#8A9A86]/30'
                            : (prod.stock ?? 0) > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {(prod.stock ?? 0) > 0 ? `${prod.stock} in stock` : '0 (Out of stock)'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-1.5 rounded-lg border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        title="Edit Formulation & Stock"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 rounded-lg border border-[#1A1A1A]/10 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Formulation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Formulation & Stock' : 'Create New Formulation'}
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
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
              label="Unit Volume / Size"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="30ml / 50ml"
            />

            <Input
              label="Current Stock (Quantity) *"
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 25"
            />
          </div>

          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Short Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of the product formulation..."
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Long Formulation & Science Description
            </label>
            <textarea
              rows={3}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="In-depth clinical formulation details, molecular weights, and mechanisms..."
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="How To Use (The Ritual)"
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              placeholder="e.g. Dispense 3-4 drops onto cleansed skin..."
            />

            <Input
              label="Skin Types (Comma separated)"
              value={skinTypesText}
              onChange={(e) => setSkinTypesText(e.target.value)}
              placeholder="All Skin Types, Dry, Sensitive"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Ingredients List (Comma separated)
            </label>
            <textarea
              rows={2}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="Aqua, Niacinamide, Sodium Hyaluronate, Camellia Sinensis..."
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#1A1A1A]/10">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingProduct ? 'Save Changes' : 'Publish to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
