'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus,
  Search, 
  Edit3, 
  Trash2,
  AlertTriangle,
  Package,
  Boxes,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { productService } from '@/services/productService';
import { useToast } from '@/context/ToastContext';
import { Product, ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
type StockFilter = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Skincare');
  const [price, setPrice] = useState(8900);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(25);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [size, setSize] = useState('30ml');
  const [description, setDescription] = useState('');
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

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const newStatus =
      newStock === 0
        ? 'Out of Stock'
        : newStock <= product.lowStockThreshold
        ? 'Low Stock'
        : 'In Stock';

    try {
      await productService.updateProduct(product.id, {
        stock: newStock,
        status: newStatus,
      });
      showToast({
        type: 'success',
        title: 'Stock Updated',
        message: `${product.name} inventory set to ${newStock} units`,
      });
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Could not update stock' });
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSubtitle('Pure Ceylon Bio-Actives');
    setSku(`VEL-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Skincare');
    setPrice(6500);
    setOriginalPrice(undefined);
    setStock(20);
    setLowStockThreshold(10);
    setSize('50ml');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSubtitle(p.subtitle || '');
    setSku(p.sku);
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold);
    setSize(p.size);
    setDescription(p.description);
    setImageUrl(p.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
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
      const statusVal = stock === 0 ? 'Out of Stock' : stock <= lowStockThreshold ? 'Low Stock' : 'In Stock';
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name,
          subtitle,
          sku,
          category,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          stock: Number(stock),
          lowStockThreshold: Number(lowStockThreshold),
          size,
          description,
          images: [imageUrl],
          status: statusVal
        });
        showToast({ type: 'success', title: 'Product Updated Successfully' });
      } else {
        await productService.createProduct({
          name,
          subtitle,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku,
          category,
          subcategory: 'Formulation',
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          size,
          description,
          longDescription: description,
          ingredients: ['Pure Distilled Aqua', 'Botanical Bio-Lipids', 'Hyaluronic Acid'],
          activeIngredients: [{ name: 'Ceylon Botanical Extract', benefit: 'Barrier fortification & antioxidant repair' }],
          howToUse: 'Dispense 2-3 drops into palms and press gently into cleansed face.',
          skinTypes: ['All Skin Types'],
          concerns: ['Hydration'],
          images: [imageUrl],
          rating: 5.0,
          reviewCount: 0,
          stock: Number(stock),
          lowStockThreshold: Number(lowStockThreshold),
          status: statusVal
        });
        showToast({ type: 'success', title: 'New Product Created' });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch {
      showToast({ type: 'error', title: 'Error saving product' });
    }
  };

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'In Stock' && p.stock > p.lowStockThreshold) ||
      (stockFilter === 'Low Stock' && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
      (stockFilter === 'Out of Stock' && p.stock === 0);

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
          {lowStockCount > 0 && (
            <button
              onClick={() => setStockFilter('Low Stock')}
              className="px-4 py-2 rounded-2xl bg-[#C87D55]/15 border border-[#C87D55]/30 flex items-center gap-2 text-xs font-semibold text-[#C87D55] hover:bg-[#C87D55]/25 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStockCount} Low Stock Alerts</span>
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
              placeholder="Search formulations by name or SKU..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          {/* Stock state pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as StockFilter[]).map((st) => (
              <button
                key={st}
                onClick={() => setStockFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  stockFilter === st
                    ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                    : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
              >
                {st}
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

      {/* Unified Product & Inventory Table */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Product / SKU</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                        alt={prod.name}
                        className="w-12 h-14 rounded-xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                      />
                      <div>
                        <span className="font-serif text-sm font-medium text-[#1A1A1A] block">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/50">SKU: {prod.sku} • {prod.size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-[#1A1A1A]/80">{prod.category}</td>
                  <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                    LKR {prod.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStock(prod, -1)}
                        className="w-7 h-7 rounded-lg border border-[#1A1A1A]/15 bg-white flex items-center justify-center hover:bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                        title="Reduce stock by 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-semibold text-[#1A1A1A] min-w-[2.5rem] text-center">
                        {prod.stock}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(prod, 1)}
                        className="w-7 h-7 rounded-lg border border-[#1A1A1A]/15 bg-white flex items-center justify-center hover:bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                        title="Add 1 unit"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-[#1A1A1A]/40 ml-1">Min: {prod.lowStockThreshold}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        prod.stock === 0
                          ? 'dark'
                          : prod.stock <= prod.lowStockThreshold
                          ? 'terracotta'
                          : 'sage'
                      }
                      size="xs"
                    >
                      {prod.stock === 0 ? 'Out of Stock' : prod.stock <= prod.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-1.5 rounded-lg border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        title="Edit Formulation"
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
        title={editingProduct ? 'Edit Formulation' : 'Create New Formulation'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Formulation Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Velvet Botanical Elixir"
            />
            <Input
              label="Subtitle / Active Note"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. 10% Niacinamide + Ceylon Green Tea"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block mb-1">
                Category
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
              label="SKU Code"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="VEL-SER-001"
            />

            <Input
              label="Unit Volume / Size"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="30ml / 50ml"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Retail Price (LKR)"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <Input
              label="Original Price (Optional)"
              type="number"
              value={originalPrice || ''}
              onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="For discounts"
            />
            <Input
              label="Available Stock"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
            <Input
              label="Reorder Alert Threshold"
              type="number"
              required
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
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
              Formulation Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the sensory ritual and botanical benefits..."
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
