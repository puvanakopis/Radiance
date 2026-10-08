'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  image?: string;
  images?: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ image, images, productName }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80';
  
  // Aggregate all available images into a unified array
  const rawList = images && images.length > 0 ? images : image ? [image] : [fallbackImage];
  const allImages = Array.from(new Set(rawList.filter(Boolean)));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe active image
  const activeImage = allImages[selectedIndex] || allImages[0] || fallbackImage;

  // Track mouse coordinates for hover zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // Lightbox keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, allImages.length]);

  return (
    <div className="w-full space-y-4 lg:sticky lg:top-28">
      {/* Main Image Frame with Double Bezel */}
      <div className="double-bezel-outer w-full shadow-lg">
        <div className="double-bezel-inner relative aspect-[4/5] overflow-hidden bg-[#FAF8F5] rounded-[calc(1.75rem-0.375rem)] group">
          {/* Zoomable / Clickable Container */}
          <div
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
            className="w-full h-full cursor-zoom-in overflow-hidden relative"
            title="Click to expand full resolution image"
          >
            <motion.img
              key={activeImage}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage}
              alt={`${productName} - View ${selectedIndex + 1}`}
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
              }}
              className="w-full h-full object-cover transition-transform duration-200 ease-out select-none"
            />
          </div>

          {/* Quick Zoom / Fullscreen Button Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#1A1A1A] hover:scale-105 transition-all cursor-pointer opacity-90 group-hover:opacity-100"
            aria-label="Expand image fullscreen"
            title="View Full Resolution"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Inline Gallery Prev/Next Overlay Arrows (for multi-image products) */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % allImages.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails row if multiple images exist */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? 'border-[#C87D55] ring-2 ring-[#C87D55]/30 scale-95 shadow-sm'
                  : 'border-[#1A1A1A]/10 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal Portal (Rendered directly at body root to avoid stacking context issues) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isLightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsLightboxOpen(false)}
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 select-none"
              >
                {/* Close Button Header */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100000] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-lg border border-white/20 shadow-lg text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
                    aria-label="Close fullscreen view"
                  >
                    <span>Close</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Lightbox Navigation - Previous */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                    }}
                    className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Lightbox Image Container */}
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-4xl max-h-[82vh] sm:max-h-[85vh] w-auto h-auto flex flex-col items-center justify-center"
                >
                  <img
                    src={activeImage}
                    alt={productName}
                    className="max-h-[78vh] sm:max-h-[82vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl"
                  />
                  
                  {/* Image Counter & Product Name */}
                  <div className="mt-3 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium">
                    <span>{productName}</span>
                    {allImages.length > 1 && (
                      <span className="text-white/60">
                        • {selectedIndex + 1} / {allImages.length}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Lightbox Navigation - Next */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex((prev) => (prev + 1) % allImages.length);
                    }}
                    className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

