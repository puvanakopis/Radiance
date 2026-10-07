import { Order, OrderStatus, PaymentMethod, PaymentStatus, Address, OrderItem, OrderTimelineItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'radiance_jwt_token';

export interface CreateOrderPayload {
  customer?: {
    id?: string;
    name?: string;
    email: string;
    phone: string;
  };
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  notes?: string;
}

export interface OrderApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data?: T;
}

class OrderService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<OrderApiResponse<T>> {
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
      console.error(`[OrderService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the backend server.');
    }

    let data: OrderApiResponse<T>;
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

  private normalizeOrder(raw: any): Order {
    if (!raw) return raw;
    const id = String(raw.id || raw._id || '');

    const items: OrderItem[] = Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          productId: String(item.productId || item.id || ''),
          productName: item.productName || item.name || 'Botanical Formulation',
          productImage: item.productImage || item.image || '/images/products/placeholder.jpg',
          size: item.size || '50ml',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          sku: item.sku || item.productId || '',
        }))
      : [];

    const timeline: OrderTimelineItem[] = Array.isArray(raw.timeline)
      ? raw.timeline.map((t: any) => ({
          status: t.status as OrderStatus,
          timestamp: t.timestamp || '',
          description: t.description || '',
          completed: !!t.completed,
        }))
      : [];

    const deliveryAddress: Address = raw.deliveryAddress
      ? {
          id: raw.deliveryAddress.id || `addr-${id}`,
          label: raw.deliveryAddress.label || 'Default Address',
          recipientName: raw.deliveryAddress.recipientName || raw.customer?.name || '',
          phone: raw.deliveryAddress.phone || raw.customer?.phone || '',
          street: raw.deliveryAddress.street || '',
          apartment: raw.deliveryAddress.apartment || '',
          city: raw.deliveryAddress.city || '',
          district: raw.deliveryAddress.district || '',
          postalCode: raw.deliveryAddress.postalCode || '00100',
          country: raw.deliveryAddress.country || 'Sri Lanka',
          isDefault: !!raw.deliveryAddress.isDefault,
        }
      : {
          id: `addr-${id}`,
          label: 'Default Address',
          recipientName: raw.customer?.name || '',
          phone: raw.customer?.phone || '',
          street: '',
          city: '',
          district: '',
          postalCode: '00100',
          country: 'Sri Lanka',
          isDefault: true,
        };

    return {
      id,
      orderNumber: raw.orderNumber || id,
      date: raw.date || raw.createdAt || new Date().toISOString(),
      customer: {
        id: String(raw.customer?.id || raw.customer?._id || ''),
        name: raw.customer?.name || 'Valued Patron',
        email: raw.customer?.email || '',
        phone: raw.customer?.phone || '',
      },
      deliveryAddress,
      items,
      subtotal: Number(raw.subtotal) || 0,
      discount: Number(raw.discount) || 0,
      shipping: Number(raw.shipping) || 450,
      total: Number(raw.total) || 0,
      status: (raw.status || 'Placed') as OrderStatus,
      paymentMethod: (raw.paymentMethod || 'WhatsApp') as PaymentMethod,
      paymentStatus: (raw.paymentStatus || 'Pending') as PaymentStatus,
      paymentReference: raw.paymentReference || '',
      trackingNumber: raw.trackingNumber || '',
      notes: raw.notes || '',
      timeline,
    };
  }

  /**
   * Fetch all orders (Admin overview or Customer self-order list)
   */
  async getOrders(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<Order[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/orders${qs ? `?${qs}` : ''}`;
    const res = await this.request<any[]>(endpoint, { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeOrder(item));
  }

  /**
   * Fetch orders for current authenticated customer
   */
  async getMyOrders(): Promise<Order[]> {
    const res = await this.request<any[]>('/orders/my-orders', { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeOrder(item));
  }

  /**
   * Fetch single order details by ID or Order Number
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await this.request<any>(`/orders/${encodeURIComponent(id)}`, { method: 'GET' });
      return res.data ? this.normalizeOrder(res.data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Create a new order (Supports guest & authenticated customer checkout)
   */
  async createOrder(orderData: CreateOrderPayload): Promise<Order> {
    const res = await this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!res.data) {
      throw new Error(res.message || 'Failed to create order');
    }

    return this.normalizeOrder(res.data);
  }

  /**
   * Update order status & timeline progression (Admin only)
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const res = await this.request<any>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.data) {
      throw new Error(res.message || 'Failed to update order status');
    }

    return this.normalizeOrder(res.data);
  }

  /**
   * Update order payment status & transaction reference (Admin only)
   */
  async updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ): Promise<Order> {
    const res = await this.request<any>(`/orders/${encodeURIComponent(orderId)}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paymentReference }),
    });

    if (!res.data) {
      throw new Error(res.message || 'Failed to update payment status');
    }

    return this.normalizeOrder(res.data);
  }
}

export const orderService = new OrderService();
