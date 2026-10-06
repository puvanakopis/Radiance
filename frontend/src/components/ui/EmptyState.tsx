'use client';

import React from 'react';
import { Button } from './Button';
import { LucideIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 px-6 max-w-md mx-auto flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#EAE3D9]/50 flex items-center justify-center mb-6 text-[#1A1A1A]/70">
          <Icon className="w-7 h-7 stroke-[1.5]" />
        </div>
      )}
      <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-sm text-[#1A1A1A]/60 leading-relaxed mb-8">{description}</p>
      
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" icon={ArrowRight}>
            {actionText}
          </Button>
        </Link>
      )}

      {actionText && !actionHref && onAction && (
        <Button variant="primary" icon={ArrowRight} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
