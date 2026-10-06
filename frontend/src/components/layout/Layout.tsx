'use client';

import React from 'react';
import { Navbar } from '../navigation/Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1A1A] relative selection:bg-[#EAE3D9]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};
