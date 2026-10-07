import { Customer, Address } from '@/types';
import {
  RegisterSendOtpParams,
  ApiResponse,
  OtpResponseData,
  BackendUser,
} from '@/types/auth.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'skinova_jwt_token';
const USER_STORAGE_KEY = 'skinova_user';

class AuthService {
  private currentUser: Customer | null = null;

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    this.currentUser = null;
  }

  mapBackendUserToCustomer(user: BackendUser): Customer {
    const firstName = user.firstName || user.name?.split(' ')?.[0] || '';
    const lastName = user.lastName || user.name?.split(' ')?.slice(1).join(' ') || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.name || 'Valued Patron';
    const role = (user.role?.toLowerCase() === 'admin' ? 'admin' : 'customer') as 'admin' | 'customer';

    const addresses: Address[] = user.address ? [
      {
        id: `addr-${user.id || user._id || 'primary'}`,
        label: 'Default Address',
        recipientName: fullName,
        phone: user.phone || '',
        street: user.address,
        city: user.city || 'Colombo',
        district: user.district || 'Colombo',
        postalCode: '00100',
        country: 'Sri Lanka',
        isDefault: true,
      }
    ] : [];

    return {
      id: String(user.id || user._id || Date.now()),
      firstName,
      lastName,
      name: fullName,
      email: user.email,
      phone: user.phone || '',
      role,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      totalOrders: user.orders_count || 0,
      totalSpend: 0,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      addresses,
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (err) {
      console.error(`[AuthService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the server. Please check your network connection.');
    }

    let data: ApiResponse<T>;
    try {
      data = await res.json();
    } catch {
      data = {
        success: false,
        message: `Unexpected server response (HTTP ${res.status})`,
      };
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // --- Registration & OTP Flow ---
  async sendRegistrationOtp(params: RegisterSendOtpParams): Promise<ApiResponse<OtpResponseData>> {
    return this.request<OtpResponseData>('/auth/register/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        firstName: params.firstName.trim(),
        lastName: params.lastName.trim(),
        name: (params.name || `${params.firstName} ${params.lastName}`).trim(),
        email: params.email.toLowerCase().trim(),
        phone: params.phone?.trim() || undefined,
        password: params.password,
        address: params.address?.trim() || undefined,
        city: params.city?.trim() || undefined,
        district: params.district?.trim() || undefined,
      }),
    });
  }

  async resendRegistrationOtp(email: string): Promise<ApiResponse<OtpResponseData>> {
    return this.request<OtpResponseData>('/auth/register/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  }

  async verifyRegistrationOtp(email: string, otp: string): Promise<Customer> {
    const response = await this.request<{ token: string; user: BackendUser }>('/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      }),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    if (response.data?.user) {
      const customer = this.mapBackendUserToCustomer(response.data.user);
      this.currentUser = customer;
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(customer));
      }
      return customer;
    }

    throw new Error('Registration completed but customer data was not returned.');
  }

  // --- Forgot Password OTP Flow ---
  async sendForgotPasswordOtp(email: string): Promise<ApiResponse<OtpResponseData>> {
    return this.request<OtpResponseData>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  }

  async resendForgotPasswordOtp(email: string): Promise<ApiResponse<OtpResponseData>> {
    return this.request<OtpResponseData>('/auth/forgot-password/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  }

  async verifyForgotPasswordOtp(
    email: string,
    otp: string,
    newPassword?: string
  ): Promise<ApiResponse<OtpResponseData>> {
    return this.request<OtpResponseData>('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        newPassword: newPassword?.trim() || undefined,
        password: newPassword?.trim() || undefined,
      }),
    });
  }

  // --- Login & Profile Management ---
  async login(email: string, password?: string): Promise<Customer> {
    const response = await this.request<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password: password || '',
      }),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    if (response.data?.user) {
      const customer = this.mapBackendUserToCustomer(response.data.user);
      this.currentUser = customer;
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(customer));
      }
      return customer;
    }

    throw new Error('Authentication succeeded but customer profile data is missing.');
  }

  async getCurrentUser(): Promise<Customer | null> {
    const token = this.getToken();
    if (token) {
      try {
        const response = await this.request<BackendUser>('/auth/me', {
          method: 'GET',
        });
        if (response.data) {
          const customer = this.mapBackendUserToCustomer(response.data);
          this.currentUser = customer;
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(customer));
          }
          return customer;
        }
      } catch {
        // Fall back to cached user in local storage
      }
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.currentUser = parsed;
          return parsed;
        } catch {
          // Ignore invalid cache
        }
      }
    }

    return this.currentUser;
  }

  async updateProfile(updates: Partial<Customer>): Promise<Customer> {
    const response = await this.request<BackendUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: updates.firstName,
        lastName: updates.lastName,
        name: updates.name,
        phone: updates.phone,
        address: updates.addresses?.[0]?.street,
        city: updates.addresses?.[0]?.city,
        district: updates.addresses?.[0]?.district,
        avatar: updates.avatar,
      }),
    });

    if (response.data) {
      const customer = this.mapBackendUserToCustomer(response.data);
      this.currentUser = customer;
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(customer));
      }
      return customer;
    }

    throw new Error('Failed to update profile');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    const res = await this.request('/auth/account', {
      method: 'DELETE',
    });
    this.clearToken();
    return res;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }
}

export const authService = new AuthService();
