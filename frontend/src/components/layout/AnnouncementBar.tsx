'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2 } from 'lucide-react';

const announcements = [
  'Islandwide Express Delivery • Direct to Doorstep across Sri Lanka',
  'Crafted in Sri Lanka with pure bio-compatible botanical actives',
  '100% Cruelty-Free • Paraben-Free • Dermatologist Formulated',
  'Complimentary islandwide delivery on bespoke ritual packages'
];

interface AnnouncementBarProps {
  onDismiss?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="h-9 w-full bg-[#1A1A1A] text-[#FAF8F5] px-4 flex items-center justify-center relative z-50 border-b border-white/5 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full relative h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 flex items-center justify-center gap-2 text-[10.5px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-center px-4"
          >
            <Flower2 className="w-3.5 h-3.5 text-[#C87D55] shrink-0 stroke-[1.75]" />
            <span className="truncate max-w-[85vw] sm:max-w-none">{announcements[currentIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
