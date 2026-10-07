'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Heart, Plus, Minus, Check, Share2 } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviewSection } from '@/components/product/ProductReviewSection';
import { ProductCard } from '@/components/product/ProductCard';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { Product, Review } from '@/types';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const found = await productService.getProductBySlug(slug);
        if (found) {
          setProduct(found);
          setSelectedSize(found.size);
          const [related, revs] = await Promise.all([
            productService.getRelatedProducts(found.category, found.id, 4),
            productService.getReviewsForProduct(found.id)
          ]);
          setRelatedProducts(related);
          setReviews(revs);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <Skeleton variant="card" className="h-[500px]" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton variant="text" className="w-1/3 h-4" />
            <Skeleton variant="text" className="w-3/4 h-8" />
            <Skeleton variant="text" className="w-1/4 h-6" />
            <Skeleton variant="text" className="w-full h-24" />
            <Skeleton variant="rectangular" className="w-full h-14" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <EmptyState
          title="Product Formulation Not Found"
          description="The requested ritual item may have been discontinued or moved."
          actionText="Return to Collection"
          actionHref="/products"
        />
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        type: 'success',
        title: 'Link copied',
        message: 'Product URL copied to clipboard.',
      });
    }
  };

  const handleAddReview = async (newRev: { productId: string; rating: number; feedback: string; userName?: string }) => {
    const created = await productService.addReview(newRev);
    const updatedProduct = await productService.getProductById(newRev.productId);
    if (updatedProduct) {
      setProduct(updatedProduct);
      const revs = await productService.getReviewsForProduct(newRev.productId);
      setReviews(revs);
    } else {
      setReviews((prev) => [created, ...prev]);
    }
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'science-desc',
      title: 'Formulation & Science',
      defaultOpen: true,
      content: (
        <div className="space-y-4">
          <p>{product.longDescription || product.description || 'Clinical formulation meticulously crafted with high-performance botanicals.'}</p>
          {Array.isArray(product.activeIngredients) && product.activeIngredients.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {product.activeIngredients.map((act) => (
                <div key={act.name} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#1A1A1A]/5">
                  <span className="text-xs font-semibold text-[#1A1A1A] block">{act.name}</span>
                  <span className="text-[11px] text-[#1A1A1A]/70">{act.benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'ingredients-list',
      title: 'Full Ingredients (INCI)',
      content: (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#1A1A1A]/75">
            {Array.isArray(product.ingredients) && product.ingredients.length > 0
              ? `${product.ingredients.join(', ')}.`
              : 'Aqua, Botanical Glycerin, Plant Extracts, Natural Preservatives.'}
          </p>
          <p className="text-[11px] text-[#1A1A1A]/50 italic">
            Formulated without sulfates (SLS/SLES), parabens, formaldehydes, phthalates, mineral oil, retinyl palmitate, or synthetic fragrance.
          </p>
        </div>
      ),
    },
    {
      id: 'the-ritual',
      title: 'How To Use (The Ritual)',
      content: (
        <div className="space-y-2">
          <p>{product.howToUse || 'Dispense a modest amount onto cleansed fingertips. Gently press and massage into face and neck using upward rhythmic motions.'}</p>
        </div>
      ),
    },
    {
      id: 'delivery-returns',
      title: 'Delivery & Guarantee',
      content: (
        <div className="space-y-3 text-xs">
          <p>
            <strong>Islandwide Sri Lanka:</strong> 2-3 business days standard delivery. Express same-day courier available for Colombo 01-15.
          </p>
          <p>
            <strong>Reliable Delivery:</strong> Flat rate LKR 450 tracked courier dispatch islandwide.
          </p>
          <p>
            <strong>30-Day Satisfaction Guarantee:</strong> If our botanical formulation does not agree with your skin, contact our concierge for a seamless exchange or refund.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16 sm:space-y-24">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start w-full">
        {/* Gallery column */}
        <div className="lg:col-span-5 w-full">
          <ProductGallery image={product.image} productName={product.name} />
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-7 w-full space-y-7 text-left">
          {/* Header Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.stock <= 0 && <Badge variant="dark">Sold Out</Badge>}
                <span className="text-xs uppercase tracking-[0.18em] font-medium text-[#1A1A1A]/50">
                  {product.category}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors p-1 cursor-pointer"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] leading-tight">
              {product.name}
            </h1>

            {/* Rating & Review Counter */}
            <div className="flex items-center gap-3 pt-1">
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
              <span className="text-xs text-[#1A1A1A]/30">•</span>
              <span className="text-xs text-[#8A9A86] font-medium">Dermatologist Approved</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 py-2 border-y border-[#1A1A1A]/10">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
              LKR {product.price.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] text-[#1A1A1A]/60">
              Tax included • Free returns
            </span>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-[#1A1A1A]/75 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Skin Type tags */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/60 block">
              Ideal For Skin Types
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.skinTypes.map((st) => (
                <span
                  key={st}
                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/80 font-medium"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          {/* Size Options */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/60">
              <span>Selected Volume</span>
              <span className="text-[#1A1A1A] font-bold">{selectedSize}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-medium border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] shadow-xs"
              >
                {product.size} (Standard)
              </button>
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-[#1A1A1A]/20 rounded-full px-3 py-2 bg-white shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold text-[#1A1A1A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(product.stock > 0 ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#1A1A1A] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : product.stock <= 0 ? (
                  'Out of Stock'
                ) : (
                  `Add to Bag • LKR ${(product.price * quantity).toLocaleString()}`
                )}
              </Button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 rounded-full border border-[#1A1A1A]/20 bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-all shrink-0 cursor-pointer"
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#C87D55] text-[#C87D55]' : ''}`} />
              </button>
            </div>

            {/* Stock status indicator */}
            <div className="flex items-center justify-between text-xs text-[#1A1A1A]/60 pt-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#8A9A86]' : 'bg-[#C87D55]'}`} />
                {product.stock > 0
                  ? `In Stock (${product.stock} units available)`
                  : 'Currently Out of Stock'}
              </span>
              <span className="text-[11px] text-[#1A1A1A]/40">ID: {product.id}</span>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="pt-4">
            <Accordion items={accordionItems} />
          </div>
        </div>
      </div>

      {/* Product Reviews & Breakdown */}
      <section className="pt-12 border-t border-[#1A1A1A]/10">
        <ProductReviewSection
          productId={product.id}
          productName={product.name}
          reviews={reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
          onAddReview={handleAddReview}
        />
      </section>

      {/* You May Also Like / Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#1A1A1A]/10 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-2">
                Harmonious Pairings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A] hover:text-[#C87D55] transition-colors"
            >
              View Full Collection
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
