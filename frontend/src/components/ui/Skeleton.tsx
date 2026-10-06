import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  if (variant === 'card') {
    return (
      <div className="double-bezel-outer animate-pulse">
        <div className="double-bezel-inner p-3 bg-white space-y-4">
          <div className="w-full aspect-[4/5] bg-[#EAE3D9]/60 rounded-2xl" />
          <div className="space-y-2 px-1">
            <div className="h-3 w-1/3 bg-[#EAE3D9]/80 rounded-full" />
            <div className="h-4 w-4/5 bg-[#EAE3D9] rounded-full" />
            <div className="h-3 w-1/2 bg-[#EAE3D9]/60 rounded-full" />
            <div className="h-4 w-1/4 bg-[#EAE3D9] rounded-full pt-1" />
          </div>
        </div>
      </div>
    );
  }

  const variantStyles = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-full h-3 w-full',
  };

  return (
    <div
      className={`bg-[#EAE3D9]/60 animate-pulse ${variantStyles[variant]} ${className}`}
    />
  );
};
