import React from 'react';
import { ProductBadge } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  badge?: ProductBadge | string;
  variant?: 'dark' | 'sage' | 'terracotta' | 'ivory' | 'outline' | 'rose';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  badge,
  variant,
  size = 'xs',
  className = '',
}) => {
  const content = children || badge;
  if (!content) return null;

  // Derive variant if not explicitly provided
  let determinedVariant = variant;
  if (!determinedVariant && badge) {
    switch (badge) {
      case 'BEST SELLER':
        determinedVariant = 'dark';
        break;
      case 'NEW ARRIVAL':
        determinedVariant = 'terracotta';
        break;
      case 'CLEAN FORMULA':
      case 'ORGANIC ACTIVES':
        determinedVariant = 'sage';
        break;
      case 'AWARD WINNER':
        determinedVariant = 'rose';
        break;
      case 'LIMITED EDITION':
        determinedVariant = 'ivory';
        break;
      default:
        determinedVariant = 'dark';
    }
  }

  const variantStyles = {
    dark: 'bg-[#1A1A1A] text-[#FAF8F5]',
    sage: 'bg-[#8A9A86] text-white',
    terracotta: 'bg-[#C87D55] text-white',
    rose: 'bg-[#D9A08B] text-[#1A1A1A]',
    ivory: 'bg-[#F4EFEA] text-[#1A1A1A] border border-[#1A1A1A]/10',
    outline: 'border border-[#1A1A1A]/20 text-[#1A1A1A] bg-white/50 backdrop-blur-sm'
  };

  const sizeStyles = {
    xs: 'text-[9px] tracking-[0.2em] px-2.5 py-1',
    sm: 'text-[10px] tracking-[0.18em] px-3 py-1.2',
    md: 'text-xs tracking-[0.15em] px-3.5 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium uppercase rounded-full select-none ${
        variantStyles[determinedVariant || 'dark']
      } ${sizeStyles[size]} ${className}`}
    >
      {content}
    </span>
  );
};
