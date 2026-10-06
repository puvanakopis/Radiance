'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  isDrawerOpen: boolean;
  appliedCoupon: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number, selectedSize?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const STANDARD_SHIPPING_FEE = 450;
const STORAGE_KEY = 'skinova_cart_items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items, isInitialized]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  const addItem = useCallback((product: Product, quantity = 1, selectedSize?: string) => {
    const size = selectedSize || product.size;
    const itemId = `${product.id}-${size}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
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
  }, [showToast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find(i => i.id === itemId);
      if (itemToRemove) {
        showToast({
          type: 'info',
          title: 'Removed from bag',
          message: `${itemToRemove.product.name} removed`,
        });
      }
      return prev.filter((item) => item.id !== itemId);
    });
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SKINOVA10') {
      setAppliedCoupon('SKINOVA10');
      setCouponDiscountPercent(0.10);
      showToast({
        type: 'success',
        title: 'Coupon applied',
        message: '10% discount applied to your order',
      });
      return true;
    } else if (cleanCode === 'WELCOME15') {
      setAppliedCoupon('WELCOME15');
      setCouponDiscountPercent(0.15);
      showToast({
        type: 'success',
        title: 'Welcome voucher applied',
        message: '15% welcome discount applied',
      });
      return true;
    } else {
      showToast({
        type: 'error',
        title: 'Invalid coupon code',
        message: 'Try code "SKINOVA10" for 10% off',
      });
      return false;
    }
  }, [showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    showToast({
      type: 'info',
      title: 'Coupon removed',
      message: 'Discount code was cleared',
    });
  }, [showToast]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    return Math.round(subtotal * couponDiscountPercent);
  }, [subtotal, couponDiscountPercent]);

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
        isDrawerOpen,
        appliedCoupon,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
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
