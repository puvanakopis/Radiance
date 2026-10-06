import { Address, Customer } from './index';

export type UserRole = 'customer' | 'admin' | 'CUSTOMER' | 'ADMIN';

export interface BackendUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  avatar?: string;
  orders_count?: number;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// Request Types
export interface RegisterSendOtpParams {
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  password?: string;
  address?: string;
  city?: string;
  district?: string;
}

export interface RegisterVerifyOtpParams {
  email: string;
  otp: string;
}

export interface ResendOtpParams {
  email: string;
}

export interface ForgotPasswordSendOtpParams {
  email: string;
}

export interface ForgotPasswordVerifyParams {
  email: string;
  otp: string;
  newPassword?: string;
  password?: string;
}

export interface LoginParams {
  email: string;
  password?: string;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  avatar?: string;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  stack?: string;
}

export interface AuthResponseData {
  token: string;
  user: BackendUser;
}

export interface OtpResponseData {
  email: string;
  expiresInSeconds?: number;
  verified?: boolean;
  reset?: boolean;
}

// Auth Context State and Actions
export interface AuthContextType {
  user: Customer | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<Customer>;
  sendRegistrationOtp: (params: RegisterSendOtpParams) => Promise<ApiResponse<OtpResponseData>>;
  resendRegistrationOtp: (email: string) => Promise<ApiResponse<OtpResponseData>>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<Customer>;
  sendForgotPasswordOtp: (email: string) => Promise<ApiResponse<OtpResponseData>>;
  resendForgotPasswordOtp: (email: string) => Promise<ApiResponse<OtpResponseData>>;
  verifyForgotPasswordOtp: (
    email: string,
    otp: string,
    newPassword?: string
  ) => Promise<ApiResponse<OtpResponseData>>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Customer>) => Promise<Customer>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}
