'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { cartService } from '@/services/cartService';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number, selectedSize?: string) => Promise<void> | void;
  updateQuantity: (itemId: string, quantity: number) => Promise<void> | void;
  removeItem: (itemId: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  refreshCart: () => Promise<void>;
}

const STANDARD_SHIPPING_FEE = 450;
const STORAGE_KEY = 'skinova_cart_items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // 1. Synchronize / Load cart based on authentication state
  const loadAndSyncCart = useCallback(async () => {
    if (isAuthLoading) return;

    if (isAuthenticated && user) {
      setIsLoading(true);
      try {
        // Check if there are local guest items in localStorage needing merge into database
        let localItems: CartItem[] = [];
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            localItems = JSON.parse(saved);
          }
        } catch {
          // Ignore invalid local format
        }

        if (localItems.length > 0) {
          // Sync guest items to database
          const syncPayload = localItems.map((item) => ({
            productId: item.product.id || (item.product as any)._id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          }));

          const syncedItems = await cartService.syncCart(syncPayload);
          setItems(syncedItems);
          localStorage.removeItem(STORAGE_KEY);
        } else {
          // Retrieve existing customer bag from database
          const backendItems = await cartService.getCart();
          setItems(backendItems);
        }
      } catch (err) {
        console.error('[CartContext] Failed to load database cart:', err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    } else {
      // Guest mode: Read directly from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('[CartContext] Failed to load cart from localStorage:', err);
        setItems([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }
  }, [isAuthenticated, user, isAuthLoading]);

  // Trigger load whenever user authentication state transitions
  useEffect(() => {
    const currentUserId = user?.id || (isAuthenticated ? 'auth' : 'guest');
    if (prevUserIdRef.current !== currentUserId && !isAuthLoading) {
      prevUserIdRef.current = currentUserId;
      loadAndSyncCart();
    }
  }, [isAuthenticated, user, isAuthLoading, loadAndSyncCart]);

  // Persist guest items to localStorage when in unauthenticated mode
  useEffect(() => {
    if (!isInitialized || isAuthenticated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('[CartContext] Failed to save cart to localStorage:', err);
    }
  }, [items, isInitialized, isAuthenticated]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // 2. Add Item (Database Sync for authenticated users, LocalStorage for guest)
  const addItem = useCallback(
    async (product: Product, quantity = 1, selectedSize?: string) => {
      const size = selectedSize || product.size || '50ml';
      const prodId = String(product.id || (product as any)._id || '');
      const itemId = `${prodId}-${size}`;

      // Optimistic UI update
      setItems((prev) => {
        const existing = prev.find((item) => item.id === itemId);
        if (existing) {
          return prev.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...prev, { id: itemId, product, quantity, selectedSize: size }];
      });

      showToast({
        type: 'success',
        title: 'Added to your bag',
        message: `${product.name} (${size}) × ${quantity}`,
      });

      setIsDrawerOpen(true);

      // Persist to database if authenticated
      if (isAuthenticated && user) {
        try {
          const updatedItems = await cartService.addItem(prodId, quantity, size);
          setItems(updatedItems);
        } catch (err: any) {
          console.error('[CartContext] Backend addItem failed:', err);
          showToast({
            type: 'error',
            title: 'Cart sync issue',
            message: err.message || 'Could not sync cart with database.',
          });
        }
      }
    },
    [isAuthenticated, user, showToast]
  );

  // 3. Update Quantity (Database Sync for authenticated users)
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const targetItem = items.find((item) => item.id === itemId);
      if (!targetItem) return;

      const prodId = String(targetItem.product.id || (targetItem.product as any)._id || '');
      const size = targetItem.selectedSize || '50ml';

      // Optimistic update
      if (quantity <= 0) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
      }

      if (isAuthenticated && user) {
        try {
          const updatedItems = await cartService.updateQuantity(prodId, quantity, size);
          setItems(updatedItems);
        } catch (err: any) {
          console.error('[CartContext] Backend updateQuantity failed:', err);
        }
      }
    },
    [items, isAuthenticated, user]
  );

  // 4. Remove Item (Database Sync for authenticated users)
  const removeItem = useCallback(
    async (itemId: string) => {
      const itemToRemove = items.find((i) => i.id === itemId);
      if (itemToRemove) {
        showToast({
          type: 'info',
          title: 'Removed from bag',
          message: `${itemToRemove.product.name} removed`,
        });
      }

      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== itemId));

      if (itemToRemove && isAuthenticated && user) {
        const prodId = String(itemToRemove.product.id || (itemToRemove.product as any)._id || '');
        const size = itemToRemove.selectedSize || '50ml';
        try {
          const updatedItems = await cartService.removeItem(prodId, size);
          setItems(updatedItems);
        } catch (err: any) {
          console.error('[CartContext] Backend removeItem failed:', err);
        }
      }
    },
    [items, isAuthenticated, user, showToast]
  );

  // 5. Clear Cart (Database Sync for authenticated users)
  const clearCart = useCallback(async () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    if (isAuthenticated && user) {
      try {
        await cartService.clearCart();
      } catch (err: any) {
        console.error('[CartContext] Backend clearCart failed:', err);
      }
    }
  }, [isAuthenticated, user]);

  const refreshCart = useCallback(async () => {
    await loadAndSyncCart();
  }, [loadAndSyncCart]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 0), 0), [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);
  }, [items]);

  const discount = 0;

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return STANDARD_SHIPPING_FEE;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        discount,
        shipping,
        total,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
