'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface WishlistContextType {
  items: Product[];
  totalWishlist: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const STORAGE_KEY = 'velora_wishlist_items';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load wishlist from localStorage', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save wishlist', err);
    }
  }, [items, isInitialized]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((item) => item.id === productId);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast({
          type: 'info',
          title: 'Removed from wishlist',
          message: `${product.name} removed from your saved items`,
        });
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast({
          type: 'success',
          title: 'Saved to wishlist',
          message: `${product.name} added to your wishlist`,
        });
        return [...prev, product];
      }
    });
  }, [showToast]);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => {
      const target = prev.find(p => p.id === productId);
      if (target) {
        showToast({
          type: 'info',
          title: 'Removed from wishlist',
          message: `${target.name} removed`,
        });
      }
      return prev.filter((item) => item.id !== productId);
    });
  }, [showToast]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlist: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
