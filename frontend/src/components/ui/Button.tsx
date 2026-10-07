'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'terracotta' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'group relative inline-flex items-center justify-center font-medium tracking-wider uppercase rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-[11px] tracking-[0.12em] px-4 py-2 gap-2',
    md: 'text-xs tracking-[0.15em] px-6 py-3.5 gap-3',
    lg: 'text-xs tracking-[0.18em] px-8 py-4 gap-3.5'
  };

  const variantStyles = {
    primary: 'bg-[#1A1A1A] text-[#FAF8F5] hover:bg-[#2E2825] active:scale-[0.98] shadow-[0_4px_14px_rgba(26,26,26,0.12)]',
    secondary: 'bg-[#EAE3D9] text-[#1A1A1A] hover:bg-[#DFD6C9] active:scale-[0.98]',
    outline: 'border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 active:scale-[0.98]',
    ghost: 'text-[#1A1A1A] hover:bg-black/5 active:scale-[0.98]',
    dark: 'bg-[#2B2523] text-[#FAF8F5] hover:bg-[#1A1A1A] active:scale-[0.98]',
    terracotta: 'bg-[#C87D55] text-white hover:bg-[#B36C45] active:scale-[0.98] shadow-[0_4px_14px_rgba(200,125,85,0.2)]',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.98] shadow-[0_4px_14px_rgba(37,211,102,0.25)]'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:-translate-x-0.5">
              <Icon className="w-3 h-3 text-current stroke-[1.75]" />
            </span>
          )}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && (
            <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-[1px]">
              <Icon className="w-3 h-3 text-current stroke-[1.75]" />
            </span>
          )}
        </>
      )}
    </motion.button>
  );
};
