'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-xs text-[#1A1A1A]/60 ${className}`}>
      <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-[#1A1A1A]/30 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-medium text-[#1A1A1A] truncate">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-[#1A1A1A] transition-colors truncate">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
