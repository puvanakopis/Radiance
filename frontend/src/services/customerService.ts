import { Customer, Address } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'radiance_jwt_token';

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats?: CustomerStats;
}

export interface GetCustomersQueryParams {
  search?: string;
  status?: string;
  isActive?: boolean;
  city?: string;
  district?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  avatar?: string;
  isActive?: boolean;
}

class CustomerService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; message?: string; data?: T; pagination?: any; stats?: any }> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (err) {
      console.error(`[CustomerService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the backend server.');
    }

    let data: any;
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

  private normalizeCustomer(raw: any): Customer {
    if (!raw) return raw;
    const firstName = raw.firstName || raw.name?.split(' ')?.[0] || '';
    const lastName = raw.lastName || raw.name?.split(' ')?.slice(1).join(' ') || '';
    const fullName = `${firstName} ${lastName}`.trim() || raw.name || 'Valued Customer';
    const role = (raw.role?.toLowerCase() === 'admin' ? 'admin' : 'customer') as 'admin' | 'customer';

    const addresses: Address[] = Array.isArray(raw.addresses) && raw.addresses.length > 0
      ? raw.addresses
      : raw.address
      ? [
          {
            id: `addr-${raw.id || raw._id || 'primary'}`,
            label: 'Primary Address',
            recipientName: fullName,
            phone: raw.phone || '',
            street: raw.address,
            city: raw.city || 'Colombo',
            district: raw.district || 'Colombo',
            postalCode: '00100',
            country: 'Sri Lanka',
            isDefault: true,
          },
        ]
      : [];

    return {
      id: String(raw.id || raw._id || ''),
      firstName,
      lastName,
      name: fullName,
      email: raw.email || '',
      phone: raw.phone || '',
      address: raw.address || '',
      city: raw.city || '',
      district: raw.district || '',
      addresses,
      role,
      avatar: raw.avatar || '',
      isActive: raw.isActive ?? true,
      totalOrders: raw.totalOrders ?? 0,
      totalSpend: raw.totalSpend ?? 0,
      createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
      updatedAt: raw.updatedAt || raw.updated_at,
    };
  }

  /**
   * Fetch customer directory from backend API with filtering, search, and pagination
   */
  async getCustomersList(params?: GetCustomersQueryParams): Promise<CustomerListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.city) searchParams.set('city', params.city);
    if (params?.district) searchParams.set('district', params.district);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const queryString = searchParams.toString();
    const endpoint = `/customers${queryString ? `?${queryString}` : ''}`;

    const res = await this.request<any[]>(endpoint, { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : [];

    return {
      customers: rawList.map((item) => this.normalizeCustomer(item)),
      pagination: res.pagination,
      stats: res.stats,
    };
  }

  /**
   * Get all customers without pagination limit
   */
  async getAllCustomers(): Promise<Customer[]> {
    const res = await this.getCustomersList({ limit: 100 });
    return res.customers;
  }

  /**
   * Get single customer by ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    const res = await this.request<any>(`/customers/${id}`, { method: 'GET' });
    return this.normalizeCustomer(res.data);
  }

  /**
   * Update customer profile by ID (admin only)
   */
  async updateCustomer(id: string, updateData: UpdateCustomerData): Promise<Customer> {
    const res = await this.request<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return this.normalizeCustomer(res.data);
  }

  /**
   * Block / Unblock customer status
   */
  async toggleBlockCustomer(id: string, isActive?: boolean): Promise<Customer> {
    const res = await this.request<any>(`/customers/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify(isActive !== undefined ? { isActive } : {}),
    });
    return this.normalizeCustomer(res.data);
  }

  /**
   * Delete customer account
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.request<{ id: string }>(`/customers/${id}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      message: res.message || 'Customer deleted successfully',
    };
  }
}

export const customerService = new CustomerService();
