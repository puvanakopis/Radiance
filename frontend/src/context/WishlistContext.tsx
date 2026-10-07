'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { wishlistService } from '@/services/wishlistService';

interface WishlistContextType {
  items: Product[];
  totalWishlist: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // 1. Load wishlist directly from database (via wishlistService)
  const loadWishlist = useCallback(async () => {
    if (isAuthLoading) return;

    if (isAuthenticated && user) {
      setIsLoading(true);
      try {
        const fetchedItems = await wishlistService.getWishlist();
        setItems(fetchedItems);
      } catch (err) {
        console.error('[WishlistContext] Failed to load database wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, isAuthLoading]);

  // Sync state whenever authentication status changes
  useEffect(() => {
    const currentUserId = user?.id || (isAuthenticated ? 'auth' : null);
    if (prevUserIdRef.current !== currentUserId && !isAuthLoading) {
      prevUserIdRef.current = currentUserId;
      loadWishlist();
    }
  }, [isAuthenticated, user, isAuthLoading, loadWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => String(item.id) === String(productId));
    },
    [items]
  );

  // 2. Toggle product in database wishlist
  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!isAuthenticated) {
        showToast({
          type: 'info',
          title: 'Sign In Required',
          message: 'Please sign in to your account to save items to your wishlist.',
        });
        return;
      }

      const exists = items.some((item) => String(item.id) === String(product.id));
      const prevItems = [...items];

      if (exists) {
        // Optimistic remove
        setItems((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
        showToast({
          type: 'info',
          title: 'Removed from wishlist',
          message: `${product.name} removed from your saved items`,
        });

        try {
          const updatedItems = await wishlistService.removeFromWishlist(product.id);
          setItems(updatedItems);
        } catch (err: any) {
          console.error('[WishlistContext] Backend remove failed:', err);
          setItems(prevItems);
          showToast({
            type: 'error',
            title: 'Wishlist update failed',
            message: err.message || 'Unable to update wishlist.',
          });
        }
      } else {
        // Optimistic add
        setItems((prev) => [...prev, product]);
        showToast({
          type: 'success',
          title: 'Saved to wishlist',
          message: `${product.name} added to your wishlist`,
        });

        try {
          const updatedItems = await wishlistService.addToWishlist(product.id);
          setItems(updatedItems);
        } catch (err: any) {
          console.error('[WishlistContext] Backend add failed:', err);
          setItems(prevItems);
          showToast({
            type: 'error',
            title: 'Wishlist update failed',
            message: err.message || 'Unable to update wishlist.',
          });
        }
      }
    },
    [items, isAuthenticated, showToast]
  );

  // 3. Remove product from database wishlist
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        showToast({
          type: 'info',
          title: 'Sign In Required',
          message: 'Please sign in to manage your wishlist.',
        });
        return;
      }

      const prevItems = [...items];
      const target = items.find((p) => String(p.id) === String(productId));

      // Optimistic remove
      setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
      if (target) {
        showToast({
          type: 'info',
          title: 'Removed from wishlist',
          message: `${target.name} removed`,
        });
      }

      try {
        const updatedItems = await wishlistService.removeFromWishlist(productId);
        setItems(updatedItems);
      } catch (err: any) {
        console.error('[WishlistContext] Backend remove failed:', err);
        setItems(prevItems);
        showToast({
          type: 'error',
          title: 'Wishlist update failed',
          message: err.message || 'Failed to remove item.',
        });
      }
    },
    [items, isAuthenticated, showToast]
  );

  // 4. Clear all products from database wishlist
  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    const prevItems = [...items];
    setItems([]);

    try {
      await wishlistService.clearWishlist();
      showToast({
        type: 'info',
        title: 'Wishlist Cleared',
        message: 'All items removed from your wishlist.',
      });
    } catch (err: any) {
      console.error('[WishlistContext] Clear failed:', err);
      setItems(prevItems);
      showToast({
        type: 'error',
        title: 'Failed to clear wishlist',
        message: err.message || 'Unable to clear saved items.',
      });
    }
  }, [items, isAuthenticated, showToast]);

  const refreshWishlist = useCallback(async () => {
    await loadWishlist();
  }, [loadWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlist: items.length,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
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
