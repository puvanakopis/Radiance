'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ProductGalleryProps {
  image?: string;
  images?: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ image, images, productName }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const activeImage = image || (images && images[0]) || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="w-full lg:sticky lg:top-28">
      {/* Main Image Frame with Double Bezel */}
      <div className="double-bezel-outer w-full shadow-lg">
        <div className="double-bezel-inner relative aspect-[4/5] overflow-hidden bg-[#FAF8F5] rounded-[calc(1.75rem-0.375rem)]">
          {/* Zoomable Container */}
          <div
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="w-full h-full cursor-crosshair overflow-hidden relative"
          >
            <motion.img
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage}
              alt={productName}
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
              }}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
            />
          </div>

          {/* Fullscreen Lightbox trigger */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-xs flex items-center justify-center text-[#1A1A1A] hover:bg-white hover:scale-105 transition-all cursor-pointer"
            aria-label="Expand photo"
            title="View Full Resolution"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl"
            >
              <img
                src={activeImage}
                alt={productName}
                className="max-h-[85vh] w-auto object-contain mx-auto rounded-3xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
