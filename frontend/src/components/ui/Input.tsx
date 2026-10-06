'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightElement,
      className = '',
      id,
      type,
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const hasRightElement = !!rightElement || (isPassword && showPasswordToggle);

    const renderRightElement = () => {
      if (rightElement) return rightElement;
      if (isPassword && showPasswordToggle) {
        return (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors p-1 cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        );
      }
      return null;
    };

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70">
            {label} {props.required && <span className="text-[#C87D55]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={`
              w-full bg-[#FFFFFF] text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 text-sm
              border border-[#1A1A1A]/15 rounded-xl px-4 py-3.5
              transition-all duration-200 outline-none
              focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/5
              disabled:opacity-50 disabled:bg-[#FAF8F5]
              ${icon ? 'pl-10' : ''}
              ${hasRightElement ? 'pr-12' : ''}
              ${error ? '!border-[#C87D55] !ring-1 !ring-[#C87D55]/20' : ''}
              ${className}
            `}
            {...props}
          />
          {hasRightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {renderRightElement()}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#C87D55] mt-0.5 tracking-wide">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

