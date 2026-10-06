'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          Formulation Not Found
        </span>

        <h1 className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] font-medium">
          404
        </h1>

        <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
          The botanical ritual or page you are looking for has been archived or does not exist in our sanctuary.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary" size="md" icon={Home}>
              Return Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="md">
              Explore Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
