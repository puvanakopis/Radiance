import { CartItem, Product, ProductCategory, SkinType } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'skinova_jwt_token';

export interface CartApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
}

class CartService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CartApiResponse<T>> {
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
      console.error(`[CartService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the backend server.');
    }

    let data: CartApiResponse<T>;
    try {
      data = await res.json();
    } catch {
      data = {
        success: false,
        message: `Unexpected server response (HTTP ${res.status})`,
      };
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Cart request failed with status ${res.status}`);
    }

    return data;
  }

  private normalizeCartItem(raw: any): CartItem {
    const rawProd = raw.product || {};
    const prodId = String(rawProd.id || rawProd._id || '');
    const selectedSize = raw.selectedSize || rawProd.size || '50ml';

    const normalizedProduct: Product = {
      id: prodId,
      _id: prodId,
      name: rawProd.name || 'Botanical Formulation',
      category: (rawProd.category || 'Skincare') as ProductCategory,
      subcategory: rawProd.subcategory || 'General',
      price: Number(rawProd.price) || 0,
      size: rawProd.size || '50ml',
      description: rawProd.description || '',
      longDescription: rawProd.longDescription || rawProd.description || '',
      ingredients: Array.isArray(rawProd.ingredients) ? rawProd.ingredients : [],
      activeIngredients: Array.isArray(rawProd.activeIngredients) ? rawProd.activeIngredients : [],
      howToUse: rawProd.howToUse || '',
      skinTypes: (Array.isArray(rawProd.skinTypes) && rawProd.skinTypes.length > 0
        ? rawProd.skinTypes
        : ['All Skin Types']) as SkinType[],
      image: rawProd.image || (Array.isArray(rawProd.images) && rawProd.images[0]) || '/images/products/placeholder.jpg',
      images: Array.isArray(rawProd.images) ? rawProd.images : rawProd.image ? [rawProd.image] : [],
      rating: rawProd.rating !== undefined && rawProd.rating !== null ? Number(rawProd.rating) : null,
      reviewCount: rawProd.reviewCount !== undefined && rawProd.reviewCount !== null ? Number(rawProd.reviewCount) : null,
      reviews: Array.isArray(rawProd.reviews) ? rawProd.reviews : [],
      badge: rawProd.badge || null,
      stock: rawProd.stock !== undefined && rawProd.stock !== null ? Number(rawProd.stock) : 0,
      createdAt: rawProd.createdAt ? new Date(rawProd.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: rawProd.updatedAt ? new Date(rawProd.updatedAt).toISOString() : undefined,
    };

    return {
      id: raw.id || `${prodId}-${selectedSize}`,
      product: normalizedProduct,
      quantity: Number(raw.quantity) || 1,
      selectedSize,
    };
  }

  /**
   * 1. GET /api/cart
   * Retrieve current authenticated user's cart from the database
   */
  async getCart(): Promise<CartItem[]> {
    const res = await this.request<any[]>('/cart', { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeCartItem(item));
  }

  /**
   * 2. POST /api/cart
   * Add product to cart in the database
   */
  async addItem(productId: string, quantity = 1, selectedSize = '50ml'): Promise<CartItem[]> {
    const res = await this.request<any[]>('/cart', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        selectedSize,
      }),
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeCartItem(item));
  }

  /**
   * 3. PUT /api/cart/item
   * Update item quantity in the database
   */
  async updateQuantity(productId: string, quantity: number, selectedSize = '50ml'): Promise<CartItem[]> {
    const res = await this.request<any[]>('/cart/item', {
      method: 'PUT',
      body: JSON.stringify({
        productId,
        quantity,
        selectedSize,
      }),
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeCartItem(item));
  }

  /**
   * 4. DELETE /api/cart/item
   * Remove item from cart in the database
   */
  async removeItem(productId: string, selectedSize = '50ml'): Promise<CartItem[]> {
    const searchParams = new URLSearchParams({
      productId,
      selectedSize,
    });
    const res = await this.request<any[]>(`/cart/item?${searchParams.toString()}`, {
      method: 'DELETE',
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeCartItem(item));
  }

  /**
   * 5. DELETE /api/cart
   * Clear all items from cart in the database
   */
  async clearCart(): Promise<void> {
    await this.request('/cart', {
      method: 'DELETE',
    });
  }

  /**
   * 6. POST /api/cart/sync
   * Merge guest local storage items into database cart on customer login
   */
  async syncCart(items: Array<{ productId: string; quantity: number; selectedSize?: string }>): Promise<CartItem[]> {
    const res = await this.request<any[]>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeCartItem(item));
  }
}

export const cartService = new CartService();
