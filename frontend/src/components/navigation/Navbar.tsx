'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementBar } from '../layout/AnnouncementBar';
import { SearchOverlay } from './SearchOverlay';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { totalItems, openDrawer } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Shop', href: '/products' },
    { label: 'Skincare', href: '/products?category=Skincare' },
    { label: 'Haircare', href: '/products?category=Haircare' },
    { label: 'Bodycare', href: '/products?category=Body%20Care' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 flex flex-col pointer-events-none">
        {/* Top Announcement Bar - smoothly collapses and hides upon scrolling */}
        <div
          className={`pointer-events-auto w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${
            isScrolled ? 'max-h-0 opacity-0 -translate-y-full pointer-events-none' : 'max-h-12 opacity-100 translate-y-0'
          }`}
        >
          <AnnouncementBar />
        </div>

        {/* Main Nav Bar */}
        <div
          className={`pointer-events-auto w-full transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isScrolled || !isHomePage
              ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#1A1A1A]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-3 sm:py-3.5'
              : 'bg-[#FAF8F5]/80 sm:bg-transparent backdrop-blur-xs py-3.5 sm:py-4.5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 sm:h-11">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[1.75]" />
              </button>

              {/* Desktop Brand Logo */}
              <div className="flex items-center gap-10">
                <Link href="/" className="group flex flex-col items-start">
                  <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-[#1A1A1A] group-hover:text-[#C87D55] transition-colors leading-none">
                    Radiance
                  </span>
                  <span className="text-[7.5px] uppercase tracking-[0.28em] text-[#1A1A1A]/50 mt-1 hidden sm:block">
                    Beauty, thoughtfully made
                  </span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center space-x-7">
                  {navLinks.map((link) => (
                    <div
                      key={link.label}
                      className="relative"
                    >
                      <Link
                        href={link.href}
                        className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A]/80 hover:text-[#1A1A1A] py-2 transition-colors flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C87D55] group-hover:w-full transition-all duration-300 ease-out" />
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Action Icons: Search, Wishlist, Account, Bag */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Search Trigger */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-black/5 transition-all cursor-pointer"
                  aria-label="Search products"
                >
                  <Search className="w-4.5 h-4.5 stroke-[1.75]" />
                </button>

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-black/5 transition-all"
                  aria-label="Saved items"
                >
                  <Heart className="w-4.5 h-4.5 stroke-[1.75]" />
                  {totalWishlist > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C87D55] text-white text-[9px] font-bold flex items-center justify-center animate-in zoom-in-50">
                      {totalWishlist}
                    </span>
                  )}
                </Link>

                {/* Account / Admin Link */}
                <Link
                  href={isAuthenticated ? (isAdmin ? '/admin' : '/account') : '/login'}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-black/5 transition-all"
                  aria-label="Account"
                  title={isAuthenticated ? (isAdmin ? 'Admin Dashboard' : `Signed in as ${user?.name}`) : 'Sign In'}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-4.5 h-4.5 text-[#C87D55] stroke-[1.75]" />
                  ) : (
                    <User className="w-4.5 h-4.5 stroke-[1.75]" />
                  )}
                </Link>

                {/* Bag Button */}
                <button
                  onClick={openDrawer}
                  className="group relative ml-1 pl-3 pr-4 py-2 rounded-full bg-[#1A1A1A] text-[#FAF8F5] hover:bg-[#2E2825] flex items-center gap-2 text-xs font-medium tracking-wider uppercase transition-all duration-300 shadow-xs cursor-pointer active:scale-95"
                  aria-label="View shopping bag"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                  <span className="hidden sm:inline">Bag</span>
                  <span className="w-5 h-5 rounded-full bg-[#C87D55] text-white text-[10px] font-bold flex items-center justify-center -mr-1">
                    {totalItems}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9990] lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-[85%] max-w-sm h-full bg-[#FAF8F5] border-r border-[#1A1A1A]/10 shadow-2xl flex flex-col justify-between p-6"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
                  <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#1A1A1A]">
                    Radiance
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[#1A1A1A]"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-serif text-xl text-[#1A1A1A] hover:text-[#C87D55] transition-colors block py-1"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="pt-2 border-t border-[#1A1A1A]/10">
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A]/80 hover:text-[#1A1A1A] py-2 flex items-center justify-between"
                    >
                      <span>Wishlist</span>
                      <span className="text-xs text-[#C87D55] font-semibold">{totalWishlist} items</span>
                    </Link>
                    <Link
                      href={isAuthenticated ? '/account' : '/login'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs uppercase tracking-[0.16em] font-medium text-[#1A1A1A]/80 hover:text-[#1A1A1A] py-2 block"
                    >
                      {isAuthenticated ? `Account (${user?.name})` : 'Sign In / Register'}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs uppercase tracking-[0.16em] font-medium text-[#C87D55] py-2 block"
                      >
                        Admin Control Center
                      </Link>
                    )}
                  </div>
                </nav>
              </div>

              <div className="pt-6 border-t border-[#1A1A1A]/10 text-center">
                <p className="text-[11px] text-[#1A1A1A]/50 uppercase tracking-widest">
                  Colombo • London • Singapore
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
