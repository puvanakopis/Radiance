import { Product, ProductCategory, FilterState, Review, Category, SkinType } from '@/types';
import {
  CreateProductParams,
  UpdateProductParams,
  GetProductsQueryParams,
  ProductApiResponse,
} from '@/types/product.interface';
import { CATEGORIES_METADATA } from '@/data/categories';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'skinova_jwt_token';

class ProductService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ProductApiResponse<T>> {
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
      console.error(`[ProductService] Network error connecting to ${url}:`, err);
      throw new Error('Unable to connect to the product service backend.');
    }

    let data: ProductApiResponse<T>;
    try {
      data = await res.json();
    } catch {
      data = {
        success: false,
        message: `Unexpected server response (HTTP ${res.status})`,
      };
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Product request failed with status ${res.status}`);
    }

    return data;
  }

  private normalizeProduct(raw: any): Product {
    if (!raw) return raw;
    const id = raw.id || raw._id || '';
    return {
      id,
      _id: id,
      name: raw.name || '',
      category: raw.category as ProductCategory,
      subcategory: raw.subcategory || 'General',
      price: Number(raw.price) || 0,
      size: raw.size || '50ml',
      description: raw.description || '',
      longDescription: raw.longDescription || raw.description || '',
      ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
      activeIngredients: Array.isArray(raw.activeIngredients) ? raw.activeIngredients : [],
      howToUse: raw.howToUse || '',
      skinTypes: Array.isArray(raw.skinTypes) && raw.skinTypes.length > 0 ? raw.skinTypes : ['All Skin Types'],
      image: raw.image || (Array.isArray(raw.images) && raw.images[0]) || '',
      images: Array.isArray(raw.images) ? raw.images : raw.image ? [raw.image] : [],
      rating: raw.rating !== undefined && raw.rating !== null ? Number(raw.rating) : null,
      reviewCount: raw.reviewCount !== undefined && raw.reviewCount !== null ? Number(raw.reviewCount) : null,
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
      badge: raw.badge || null,
      stock: raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : 0,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt,
    };
  }

  // --- Read & Catalog Operations (100% Backend API) ---

  async getProducts(
    filter?: Partial<FilterState> | GetProductsQueryParams
  ): Promise<Product[]> {
    const searchParams = new URLSearchParams();

    if (filter) {
      // Categories
      if ('categories' in filter && Array.isArray(filter.categories) && filter.categories.length > 0) {
        searchParams.set('category', filter.categories.join(','));
      } else if ('category' in filter && filter.category) {
        searchParams.set('category', String(filter.category));
      }

      // Subcategory
      if ('subcategory' in filter && filter.subcategory) {
        searchParams.set('subcategory', filter.subcategory);
      }

      // Skin Types
      if ('skinTypes' in filter && filter.skinTypes) {
        if (Array.isArray(filter.skinTypes) && filter.skinTypes.length > 0) {
          searchParams.set('skinTypes', filter.skinTypes.join(','));
        } else if (typeof filter.skinTypes === 'string' && filter.skinTypes) {
          searchParams.set('skinTypes', filter.skinTypes);
        }
      } else if ('skinType' in filter && filter.skinType) {
        searchParams.set('skinType', String(filter.skinType));
      }

      // Price Range
      if ('priceRange' in filter && filter.priceRange) {
        const [min, max] = filter.priceRange;
        if (min > 0) searchParams.set('minPrice', String(min));
        if (max < 30000) searchParams.set('maxPrice', String(max));
      } else {
        if ('minPrice' in filter && filter.minPrice !== undefined) {
          searchParams.set('minPrice', String(filter.minPrice));
        }
        if ('maxPrice' in filter && filter.maxPrice !== undefined) {
          searchParams.set('maxPrice', String(filter.maxPrice));
        }
      }

      // Rating
      if (filter.minRating && filter.minRating > 0) {
        searchParams.set('minRating', String(filter.minRating));
      }

      // Badge
      if ('badge' in filter && filter.badge) {
        searchParams.set('badge', filter.badge);
      }

      // Stock Filters
      if ('inStockOnly' in filter && filter.inStockOnly) {
        searchParams.set('inStockOnly', 'true');
      }
      if ('stockFilter' in filter && filter.stockFilter && filter.stockFilter !== 'All') {
        searchParams.set('stockFilter', filter.stockFilter);
      }

      // Search Query
      const queryTerm =
        ('searchQuery' in filter && filter.searchQuery ? filter.searchQuery : '') ||
        ('search' in filter && filter.search ? filter.search : '') ||
        ('q' in filter && filter.q ? filter.q : '');
      if (queryTerm && queryTerm.trim()) {
        searchParams.set('search', queryTerm.trim());
      }

      // Sort By
      if (filter.sortBy) {
        searchParams.set('sortBy', filter.sortBy);
      }

      // Pagination
      if ('page' in filter && filter.page) searchParams.set('page', String(filter.page));
      if ('limit' in filter && filter.limit) searchParams.set('limit', String(filter.limit));
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await this.request<Product[]>(endpoint, { method: 'GET' });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((p) => this.normalizeProduct(p));
    }

    return [];
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.request<Product>(`/products/${id}`, { method: 'GET' });
      if (response.data) {
        return this.normalizeProduct(response.data);
      }
    } catch {
      // Return null if not found
    }
    return null;
  }

  async getProductBySlug(slugOrId: string): Promise<Product | null> {
    // 1. Try direct ID retrieval first
    const directProduct = await this.getProductById(slugOrId);
    if (directProduct) return directProduct;

    // 2. Fetch products and match generated slug from formulation name
    try {
      const allProducts = await this.getProducts();
      const found = allProducts.find(
        (p) =>
          p.id === slugOrId ||
          p._id === slugOrId ||
          p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugOrId.toLowerCase()
      );
      if (found) return found;
    } catch {
      // Ignored
    }

    return null;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts({ sortBy: 'rating' });
    return products.slice(0, 4);
  }

  async getBestSellers(): Promise<Product[]> {
    const products = await this.getProducts({ sortBy: 'rating' });
    return products.slice(0, 4);
  }

  async getNewArrivals(): Promise<Product[]> {
    const products = await this.getProducts({ sortBy: 'newest' });
    return products.slice(0, 4);
  }

  async getRelatedProducts(
    category: ProductCategory,
    currentId: string,
    limit = 4
  ): Promise<Product[]> {
    const products = await this.getProducts({ category, limit: (limit || 4) + 2 });
    return products.filter((p) => p.id !== currentId && p._id !== currentId).slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    const allProducts = await this.getProducts();
    return CATEGORIES_METADATA.map((cat) => ({
      ...cat,
      itemCount: allProducts.filter((p) => p.category === cat.name).length,
    }));
  }

  // --- Customer Feedback / Reviews Flow (100% Backend API) ---

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    const product = await this.getProductById(productId);
    if (product && Array.isArray(product.reviews) && product.reviews.length > 0) {
      return product.reviews.map((r) => ({
        id: String(r._id || r.id || ''),
        productId,
        userName: r.userName || r.userId || '',
        userLocation: r.userLocation,
        rating: Number(r.rating) || 0,
        date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
        title: r.title || '',
        comment: r.feedback || '',
        verified: !!r.verified,
        skinType: r.skinType as SkinType | undefined,
        helpfulCount: Number(r.helpfulCount) || 0,
      }));
    }
    return [];
  }

  async addReview(
    review: { productId: string; rating: number; feedback?: string; comment?: string; userName?: string }
  ): Promise<Review> {
    const feedbackText = (review.feedback || review.comment || '').trim();
    const response = await this.request<Product>(`/products/${review.productId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        rating: review.rating,
        feedback: feedbackText,
      }),
    });

    if (response.data) {
      const updated = this.normalizeProduct(response.data);
      const latestReview = updated.reviews?.[updated.reviews.length - 1];
      if (latestReview) {
        return {
          id: String(latestReview._id || latestReview.id || ''),
          productId: review.productId,
          userName: latestReview.userName || latestReview.userId || review.userName || '',
          userLocation: latestReview.userLocation,
          rating: Number(latestReview.rating) || review.rating,
          date: latestReview.createdAt
            ? new Date(latestReview.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          title: latestReview.title || '',
          comment: latestReview.feedback || feedbackText,
          verified: !!latestReview.verified,
          skinType: latestReview.skinType as SkinType | undefined,
          helpfulCount: Number(latestReview.helpfulCount) || 0,
        };
      }
    }

    throw new Error('Failed to record review on backend formulation.');
  }

  // --- Admin CRUD Operations (100% Backend API) ---

  async createProduct(
    data: Omit<Product, 'id' | 'createdAt'> | CreateProductParams
  ): Promise<Product> {
    const payload = {
      name: data.name?.trim(),
      category: data.category,
      subcategory: data.subcategory?.trim() || 'General',
      price: Number(data.price),
      size: data.size || '50ml',
      description: data.description?.trim(),
      longDescription: (data.longDescription || data.description)?.trim(),
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      activeIngredients: Array.isArray(data.activeIngredients) ? data.activeIngredients : [],
      howToUse: data.howToUse || '',
      skinTypes: Array.isArray(data.skinTypes) && data.skinTypes.length > 0 ? data.skinTypes : ['All Skin Types'],
      image: data.image || (Array.isArray(data.images) && data.images[0]) || '',
      rating: data.rating !== undefined && data.rating !== null ? Number(data.rating) : null,
      reviewCount: data.reviewCount !== undefined && data.reviewCount !== null ? Number(data.reviewCount) : null,
      badge: data.badge || null,
      stock: data.stock !== undefined && data.stock !== null ? Number(data.stock) : 0,
    };

    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.data) {
      return this.normalizeProduct(response.data);
    }

    throw new Error('Failed to create product formulation.');
  }

  async updateProduct(
    id: string,
    updates: Partial<Product> | UpdateProductParams
  ): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (response.data) {
      return this.normalizeProduct(response.data);
    }

    throw new Error(`Failed to update product formulation with ID ${id}.`);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
    return true;
  }
}

export const productService = new ProductService();
export default productService;
