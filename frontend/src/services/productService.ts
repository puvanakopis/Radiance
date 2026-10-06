import { Product, ProductCategory, FilterState, Review } from '@/types';
import { mockProducts, mockCategories, mockReviews } from '@/data/mockProducts';

// Simulated latency to demonstrate real-world async UX patterns
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ProductService {
  private products: Product[] = [...mockProducts];
  private reviews: Review[] = [...mockReviews];

  async getProducts(filter?: Partial<FilterState>): Promise<Product[]> {
    await delay(120);
    let result = [...this.products];

    if (!filter) return result;

    if (filter.categories && filter.categories.length > 0) {
      result = result.filter(p => filter.categories?.includes(p.category));
    }

    if (filter.skinTypes && filter.skinTypes.length > 0) {
      result = result.filter(p => 
        p.skinTypes.some(st => filter.skinTypes?.includes(st) || st === 'All Skin Types')
      );
    }

    if (filter.concerns && filter.concerns.length > 0) {
      result = result.filter(p => 
        p.concerns.some(c => filter.concerns?.includes(c))
      );
    }

    if (filter.priceRange) {
      const [min, max] = filter.priceRange;
      result = result.filter(p => p.price >= min && p.price <= max);
    }

    if (filter.minRating && filter.minRating > 0) {
      result = result.filter(p => p.rating >= filter.minRating!);
    }

    if (filter.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    }

    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
          break;
      }
    }

    return result;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await delay(80);
    return this.products.find(p => p.slug === slug) || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    await delay(50);
    return this.products.find(p => p.id === id) || null;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    await delay(50);
    return this.products.filter(p => p.isFeatured);
  }

  async getBestSellers(): Promise<Product[]> {
    await delay(50);
    return this.products.filter(p => p.isBestSeller);
  }

  async getNewArrivals(): Promise<Product[]> {
    await delay(50);
    return this.products.filter(p => p.isNew);
  }

  async getRelatedProducts(category: ProductCategory, currentId: string, limit = 4): Promise<Product[]> {
    await delay(50);
    return this.products
      .filter(p => p.category === category && p.id !== currentId)
      .slice(0, limit);
  }

  async getCategories() {
    await delay(30);
    return mockCategories;
  }

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    await delay(60);
    return this.reviews.filter(r => r.productId === productId);
  }

  async addReview(review: Omit<Review, 'id' | 'date' | 'helpfulCount'>): Promise<Review> {
    await delay(150);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0
    };
    this.reviews.unshift(newReview);
    return newReview;
  }

  // Admin capabilities
  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await delay(200);
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(150);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    await delay(150);
    this.products = this.products.filter(p => p.id !== id);
    return true;
  }
}

export const productService = new ProductService();
