'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value?: number;
  rating?: number;
  max?: number;
  count?: number;
  reviewCount?: number;
  showText?: boolean;
  showNumber?: boolean;
  size?: 'xs' | 'sm' | 'md';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  rating,
  max = 5,
  count,
  reviewCount,
  showText,
  showNumber,
  size = 'sm',
  interactive = false,
  onChange,
  className = '',
}) => {
  const currentRating = value ?? rating ?? 5;
  const currentCount = count ?? reviewCount;
  const shouldShowText = showText ?? showNumber ?? true;

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i + 1 <= Math.round(currentRating);
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(i + 1)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} text-[#C87D55]`}
              aria-label={`Rate ${i + 1} stars`}
            >
              <Star
                className={`${iconSizes[size]} ${
                  filled ? 'fill-[#C87D55] text-[#C87D55]' : 'fill-transparent text-[#1A1A1A]/20'
                }`}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {shouldShowText && (
        <span className="text-xs text-[#1A1A1A]/70 font-medium tracking-tight">
          {currentRating.toFixed(1)}
          {currentCount !== undefined && (
            <span className="text-[#1A1A1A]/40 font-normal ml-1">({currentCount})</span>
          )}
        </span>
      )}
    </div>
  );
};
