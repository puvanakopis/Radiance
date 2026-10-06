'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, Address } from '../types';
import {
  AuthContextType,
  RegisterSendOtpParams,
  OtpResponseData,
  ApiResponse,
} from '@/types/auth.interface';
import { authService } from '@/services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Restore current session on mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Sign In ---
  const login = useCallback(
    async (email: string, password?: string): Promise<Customer> => {
      try {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
        showToast({
          type: 'success',
          title: 'Welcome back',
          message: `Signed in as ${loggedUser.name}`,
        });
        return loggedUser;
      } catch (err: any) {
        const message = err.message || 'Invalid email or password.';
        showToast({
          type: 'error',
          title: 'Sign in failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Registration OTP Request ---
  const sendRegistrationOtp = useCallback(
    async (params: RegisterSendOtpParams): Promise<ApiResponse<OtpResponseData>> => {
      try {
        const res = await authService.sendRegistrationOtp(params);
        showToast({
          type: 'success',
          title: 'Verification Code Sent',
          message: `6-digit verification code sent to ${params.email}`,
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Failed to send verification code.';
        showToast({
          type: 'error',
          title: 'Could not send code',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Resend Registration OTP ---
  const resendRegistrationOtp = useCallback(
    async (email: string): Promise<ApiResponse<OtpResponseData>> => {
      try {
        const res = await authService.resendRegistrationOtp(email);
        showToast({
          type: 'success',
          title: 'New Code Sent',
          message: `A new verification code was sent to ${email}`,
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Failed to resend code.';
        showToast({
          type: 'error',
          title: 'Resend Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Verify Registration OTP & Complete Sign Up ---
  const verifyRegistrationOtp = useCallback(
    async (email: string, otp: string): Promise<Customer> => {
      try {
        const verifiedUser = await authService.verifyRegistrationOtp(email, otp);
        setUser(verifiedUser);
        showToast({
          type: 'success',
          title: 'Account verified',
          message: `Welcome to VELORA, ${verifiedUser.name}`,
        });
        return verifiedUser;
      } catch (err: any) {
        const message = err.message || 'Invalid or expired verification code.';
        showToast({
          type: 'error',
          title: 'Verification Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Forgot Password OTP Request ---
  const sendForgotPasswordOtp = useCallback(
    async (email: string): Promise<ApiResponse<OtpResponseData>> => {
      try {
        const res = await authService.sendForgotPasswordOtp(email);
        showToast({
          type: 'success',
          title: 'Reset Code Sent',
          message: `6-digit password reset code sent to ${email}`,
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Failed to send reset code.';
        showToast({
          type: 'error',
          title: 'Could not send code',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Resend Forgot Password OTP ---
  const resendForgotPasswordOtp = useCallback(
    async (email: string): Promise<ApiResponse<OtpResponseData>> => {
      try {
        const res = await authService.resendForgotPasswordOtp(email);
        showToast({
          type: 'success',
          title: 'New Code Sent',
          message: `A new reset code was sent to ${email}`,
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Failed to resend reset code.';
        showToast({
          type: 'error',
          title: 'Resend Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Verify Forgot Password OTP & Set New Password ---
  const verifyForgotPasswordOtp = useCallback(
    async (
      email: string,
      otp: string,
      newPassword?: string
    ): Promise<ApiResponse<OtpResponseData>> => {
      try {
        const res = await authService.verifyForgotPasswordOtp(email, otp, newPassword);
        showToast({
          type: 'success',
          title: newPassword ? 'Password Reset Successful' : 'Code Verified',
          message: res.message || 'Verification complete.',
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Invalid or expired verification code.';
        showToast({
          type: 'error',
          title: 'Reset Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Logout ---
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'You have been successfully signed out.',
    });
  }, [showToast]);

  // --- Update Profile ---
  const updateProfile = useCallback(
    async (updates: Partial<Customer>): Promise<Customer> => {
      try {
        const updated = await authService.updateProfile(updates);
        setUser(updated);
        showToast({
          type: 'success',
          title: 'Profile updated',
          message: 'Your personal details have been saved.',
        });
        return updated;
      } catch (err: any) {
        const message = err.message || 'Failed to update profile.';
        showToast({
          type: 'error',
          title: 'Update Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Change Password ---
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
      try {
        const res = await authService.changePassword(currentPassword, newPassword);
        showToast({
          type: 'success',
          title: 'Password Updated',
          message: res.message || 'Your password has been changed successfully.',
        });
        return res;
      } catch (err: any) {
        const message = err.message || 'Could not update password. Check your current password.';
        showToast({
          type: 'error',
          title: 'Password Change Failed',
          message,
        });
        throw err;
      }
    },
    [showToast]
  );

  // --- Address Management ---
  const addAddress = useCallback(
    async (newAddress: Omit<Address, 'id'>): Promise<void> => {
      if (!user) return;
      const address: Address = {
        ...newAddress,
        id: `addr-${Date.now()}`,
      };
      const updatedAddresses = [...user.addresses, address];
      const updated = await authService.updateProfile({ addresses: updatedAddresses });
      setUser(updated);
      showToast({
        type: 'success',
        title: 'Address added',
        message: 'New shipping destination saved to your profile.',
      });
    },
    [user, showToast]
  );

  const setDefaultAddress = useCallback(
    async (addressId: string): Promise<void> => {
      if (!user) return;
      const updatedAddresses = user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      const updated = await authService.updateProfile({ addresses: updatedAddresses });
      setUser(updated);
    },
    [user]
  );

  const deleteAddress = useCallback(
    async (addressId: string): Promise<void> => {
      if (!user) return;
      const updatedAddresses = user.addresses.filter((a) => a.id !== addressId);
      const updated = await authService.updateProfile({ addresses: updatedAddresses });
      setUser(updated);
      showToast({
        type: 'info',
        title: 'Address removed',
        message: 'Shipping address removed from account.',
      });
    },
    [user, showToast]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        sendRegistrationOtp,
        resendRegistrationOtp,
        verifyRegistrationOtp,
        sendForgotPasswordOtp,
        resendForgotPasswordOtp,
        verifyForgotPasswordOtp,
        logout,
        updateProfile,
        changePassword,
        addAddress,
        setDefaultAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
