'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, Address } from '../types';
import { authService } from '@/services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: Customer | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Customer>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error restoring user session', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      showToast({
        type: 'success',
        title: 'Welcome back',
        message: `Signed in as ${loggedUser.name}`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: 'Please check your email and credentials.',
      });
      throw err;
    }
  }, [showToast]);

  const register = useCallback(async (name: string, email: string, phone: string, password?: string) => {
    try {
      const newUser = await authService.register(name, email, phone, password);
      setUser(newUser);
      showToast({
        type: 'success',
        title: 'Account created',
        message: `Welcome to VELORA, ${newUser.name}`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: 'Could not create account at this time.',
      });
      throw err;
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'You have been successfully signed out.',
    });
  }, [showToast]);

  const updateProfile = useCallback(async (updates: Partial<Customer>) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    showToast({
      type: 'success',
      title: 'Profile updated',
      message: 'Your personal details have been saved.',
    });
  }, [showToast]);

  const addAddress = useCallback(async (newAddress: Omit<Address, 'id'>) => {
    if (!user) return;
    const address: Address = {
      ...newAddress,
      id: `addr-${Date.now()}`
    };
    const updatedAddresses = [...user.addresses, address];
    const updated = await authService.updateProfile({ addresses: updatedAddresses });
    setUser(updated);
    showToast({
      type: 'success',
      title: 'Address added',
      message: 'New shipping destination saved to your profile.',
    });
  }, [user, showToast]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    const updated = await authService.updateProfile({ addresses: updatedAddresses });
    setUser(updated);
  }, [user]);

  const deleteAddress = useCallback(async (addressId: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
    const updated = await authService.updateProfile({ addresses: updatedAddresses });
    setUser(updated);
    showToast({
      type: 'info',
      title: 'Address removed',
      message: 'Shipping address deleted from account.',
    });
  }, [user, showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        setDefaultAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
