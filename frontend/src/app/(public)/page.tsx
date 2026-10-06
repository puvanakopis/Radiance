'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flower2, ShieldCheck, Leaf, Truck, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const [cats, best, arrivals] = await Promise.all([
        productService.getCategories(),
        productService.getBestSellers(),
        productService.getNewArrivals()
      ]);
      setCategories(cats);
      setBestSellers(best);
      setNewArrivals(arrivals);
    };
    loadData();
  }, []);

  const ingredients = [
    {
      name: 'Niacinamide (Vitamin B3)',
      category: 'Cellular Restoration',
      description: 'Strengthens epidermal moisture barrier integrity, reduces micro-inflammation, and refines pore diameter.',
      benefit: 'Smooths and evens tone'
    },
    {
      name: 'Quadruple Hyaluronic Complex',
      category: 'Deep Hydration',
      description: 'Four distinct molecular weights ensure progressive multi-layer water binding from stratum corneum to dermis.',
      benefit: 'Plumps & cushions deep skin'
    },
    {
      name: 'Skin-Identical Ceramides (1, 3, 6-II)',
      category: 'Barrier Architecture',
      description: 'Mimics natural intercellular lipid matrices to halt trans-epidermal water depletion and soothe reactivity.',
      benefit: 'Rebuilds compromised barrier'
    },
    {
      name: 'Ceylon Green Tea Bio-Actives',
      category: 'Botanical Antioxidant',
      description: 'Cold-extracted high-potency EGCG polyphenols that defend against tropical UV stress and urban particulate oxidants.',
      benefit: 'Defends against oxidative stress'
    }
  ];

  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-4rem)] flex items-center justify-center pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-32 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FAF8F5]">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#EAE3D9]/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE3D9]/60 border border-[#1A1A1A]/5 text-[#1A1A1A]">
              <Flower2 className="w-3.5 h-3.5 text-[#C87D55] stroke-[1.75]" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-medium">
                The New Standard of Restorative Care
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1A1A1A] leading-[1.08] tracking-tight">
              Beauty, <br />
              <span className="italic font-light text-[#2B2523]">thoughtfully</span> made.
            </h1>

            <p className="text-sm sm:text-base text-[#1A1A1A]/70 max-w-lg leading-relaxed font-light">
              Intentional skincare and sensory rituals formulated with pharmaceutical-grade active botanicals. Crafted for everyday equilibrium.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/products?category=Skincare">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Shop Skincare
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Our Philosophy
                </Button>
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-[#1A1A1A]/10 max-w-md">
              <div>
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">100%</span>
                <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mt-0.5">Cruelty Free</p>
              </div>
              <div>
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">0%</span>
                <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mt-0.5">Parabens / Sulfates</p>
              </div>
              <div>
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">4.9★</span>
                <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mt-0.5">Islandwide Reviews</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Display with Double Bezel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-6 relative w-full flex justify-center lg:justify-end"
          >
            <div className="double-bezel-outer w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] mx-auto lg:ml-auto lg:mr-0 shadow-2xl">
              <div className="double-bezel-inner relative w-full aspect-[4/4.5] sm:aspect-[4/4.8] overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[#1A1A1A]">
                <img
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85"
                  alt="Velora Velvet Glow Serum"
                  className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {/* Floating Product Highlight Card */}
                <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/50 shadow-xl flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80"
                      alt="Velvet Glow Serum"
                      className="w-12 h-12 rounded-xl object-cover border border-[#1A1A1A]/5 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold flex items-center gap-1">
                        <Flower2 className="w-2.5 h-2.5 stroke-[1.75]" /> Award Winner
                      </span>
                      <h4 className="font-serif text-sm font-medium text-[#1A1A1A] truncate">Velvet Glow Serum</h4>
                      <span className="text-xs text-[#1A1A1A]/70 font-semibold">LKR 8,900</span>
                    </div>
                  </div>
                  <Link href="/products/velvet-glow-serum" className="shrink-0 ml-2">
                    <Button variant="primary" size="sm" icon={ArrowRight} className="text-xs px-3.5 py-1.5 h-auto whitespace-nowrap">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. BRAND VALUES TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#FFFFFF] border border-[#1A1A1A]/5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
              <Leaf className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">Pure Botanical Actives</h4>
              <p className="text-[11px] text-[#1A1A1A]/60">Sustainably sourced Ceylon extracts</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">Dermatologist Tested</h4>
              <p className="text-[11px] text-[#1A1A1A]/60">Safe for high-sensitivity skin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">Islandwide Delivery</h4>
              <p className="text-[11px] text-[#1A1A1A]/60">Free on orders above LKR 10,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
              <Droplets className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">Clean Formulations</h4>
              <p className="text-[11px] text-[#1A1A1A]/60">Zero mineral oils or toxins</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES (EDITORIAL CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-2">
              Formulation Spectrum
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A] hover:text-[#C87D55] transition-colors inline-flex items-center gap-1.5"
          >
            <span>View all formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-[380px] rounded-3xl overflow-hidden bg-[#1A1A1A] shadow-md flex flex-col justify-end p-6"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#FAF8F5]/60 font-medium block">
                  {cat.itemCount} Formulations
                </span>
                <h3 className="font-serif text-2xl text-[#FAF8F5] group-hover:text-[#EAE3D9] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#FAF8F5]/70 line-clamp-2 leading-relaxed font-light">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#FAF8F5] group-hover:text-[#C87D55] transition-colors">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-2">
              Most Cherished
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?sort=rating"
            className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A] hover:text-[#C87D55] transition-colors inline-flex items-center gap-1.5"
          >
            <span>View all best sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL EDITORIAL SPLIT SECTION ("THE DAILY RITUAL") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAE3D9]/60 rounded-3xl sm:rounded-[2.5rem] border border-[#1A1A1A]/10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative w-full aspect-[4/3.2] sm:aspect-[4/3.5] lg:aspect-[4/3.8] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-[#1A1A1A]">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80"
              alt="Editorial Daily Ritual"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white space-y-1 z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C87D55]">The Morning Sequence</span>
              <p className="font-serif text-lg">Cleanse • Hydrate • Fortify</p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55]">
              <Flower2 className="w-3.5 h-3.5 stroke-[1.75]" /> Editorial Highlight
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] leading-tight">
              The Daily Ritual. <br />
              <span className="italic font-light text-[#2B2523]">Simple products. Thoughtful formulas. Everyday results.</span>
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-light">
              We believe great skin is not created through complex 12-step regimens, but through intentional botanical consistency. Every Velora formulation is engineered to blend seamlessly without pilling or heavy occlusives.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link href="/about">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Discover Our Philosophy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INGREDIENT SPOTLIGHT (FORMULATED WITH INTENTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
            Cellular Integrity
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
            Formulated With Intention
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/60 font-light">
            We isolate biocompatible actives at efficacious concentrations to reinforce the moisture barrier naturally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-8 shadow-xs">
          {/* Active selection pills */}
          <div className="md:col-span-5 space-y-3">
            {ingredients.map((ing, idx) => (
              <button
                key={ing.name}
                onClick={() => setSelectedIngredient(idx)}
                className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                  selectedIngredient === idx
                    ? 'bg-[#1A1A1A] text-[#FAF8F5] border-[#1A1A1A] shadow-md'
                    : 'bg-[#FAF8F5] text-[#1A1A1A] border-transparent hover:border-[#1A1A1A]/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-medium">{ing.name}</span>
                  <span className={`text-[10px] uppercase tracking-wider ${selectedIngredient === idx ? 'text-[#C87D55]' : 'text-[#1A1A1A]/40'}`}>
                    {ing.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Ingredient Detail Display */}
          <div className="md:col-span-7 md:border-l border-[#1A1A1A]/10 md:pl-8 space-y-5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C87D55] font-semibold">
              Efficacy Profile
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">
              {ingredients[selectedIngredient].name}
            </h3>
            <p className="text-sm text-[#1A1A1A]/75 leading-relaxed font-light">
              {ingredients[selectedIngredient].description}
            </p>
            <div className="p-4 rounded-2xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 flex items-center gap-3">
              <Flower2 className="w-4 h-4 text-[#C87D55] shrink-0 stroke-[1.75]" />
              <span className="text-xs font-medium text-[#1A1A1A]">
                Primary Benefit: {ingredients[selectedIngredient].benefit}
              </span>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" icon={ArrowRight} className="mt-2">
                Find formulas containing this active
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS HORIZONTAL CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-2">
              Fresh From The Cleanroom
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A] hover:text-[#C87D55] transition-colors inline-flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {newArrivals.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
