'use client';

import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Search } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  onQuickView?: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  columns = 4,
  onQuickView,
  emptyTitle = 'No botanical formulas match your filters',
  emptyDescription = 'Try resetting or broadening your filter criteria to discover our curated rituals.',
  onClearFilters,
}) => {
  const gridColumns = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridColumns[columns]} gap-6 sm:gap-8`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'Reset All Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className={`grid ${gridColumns[columns]} gap-6 sm:gap-8`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
