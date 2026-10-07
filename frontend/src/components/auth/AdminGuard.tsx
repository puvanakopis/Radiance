'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // While checking auth or redirecting non-admins, show brief luxury loader
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-[#C87D55]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FAF8F5] flex items-center justify-center shadow">
            <Loader2 className="w-4 h-4 text-[#C87D55] animate-spin" />
          </div>
        </div>
        <h2 className="font-serif text-xl tracking-wider text-[#1A1A1A]">
          Verifying Authorization
        </h2>
        <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 mt-1">
          Radiance Operations Gate
        </p>
      </div>
    );
  }

  // Authorized Admin
  return <>{children}</>;
};
