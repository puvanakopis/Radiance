import { Product, ProductCategory, SkinType } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'skinova_jwt_token';

export interface WishlistApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
}

class WishlistService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<WishlistApiResponse<T>> {
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
      console.error(`[WishlistService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the backend server.');
    }

    let data: WishlistApiResponse<T>;
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

  private normalizeProduct(raw: any): Product {
    if (!raw) return raw;
    const id = String(raw.id || raw._id || '');

    return {
      id,
      _id: id,
      name: raw.name || 'Botanical Formula',
      category: (raw.category || 'Skincare') as ProductCategory,
      subcategory: raw.subcategory || 'General',
      price: Number(raw.price) || 0,
      size: raw.size || '50ml',
      description: raw.description || '',
      longDescription: raw.longDescription || raw.description || '',
      ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
      activeIngredients: Array.isArray(raw.activeIngredients) ? raw.activeIngredients : [],
      howToUse: raw.howToUse || '',
      skinTypes: (Array.isArray(raw.skinTypes) && raw.skinTypes.length > 0 ? raw.skinTypes : ['All Skin Types']) as SkinType[],
      image: raw.image || (Array.isArray(raw.images) && raw.images[0]) || '/images/products/placeholder.jpg',
      images: Array.isArray(raw.images) ? raw.images : raw.image ? [raw.image] : [],
      rating: raw.rating !== undefined && raw.rating !== null ? Number(raw.rating) : 5.0,
      reviewCount: raw.reviewCount !== undefined && raw.reviewCount !== null ? Number(raw.reviewCount) : 0,
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
      badge: raw.badge || null,
      stock: raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : 0,
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : undefined,
    };
  }

  /**
   * 1. GET /api/wishlist
   * Fetch all products in customer's wishlist
   */
  async getWishlist(): Promise<Product[]> {
    const res = await this.request<any[]>('/wishlist', { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeProduct(item));
  }

  /**
   * 2. POST /api/wishlist/:productId
   * Add one product to the wishlist
   */
  async addToWishlist(productId: string): Promise<Product[]> {
    const res = await this.request<any[]>(`/wishlist/${encodeURIComponent(productId)}`, {
      method: 'POST',
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeProduct(item));
  }

  /**
   * 3. DELETE /api/wishlist/:productId
   * Remove one product from the wishlist
   */
  async removeFromWishlist(productId: string): Promise<Product[]> {
    const res = await this.request<any[]>(`/wishlist/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((item) => this.normalizeProduct(item));
  }

  /**
   * 4. DELETE /api/wishlist
   * Remove all products from the wishlist
   */
  async clearWishlist(): Promise<void> {
    await this.request('/wishlist', {
      method: 'DELETE',
    });
  }
}

export const wishlistService = new WishlistService();
