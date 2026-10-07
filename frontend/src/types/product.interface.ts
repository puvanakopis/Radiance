export type ProductCategory =
  | 'Skincare'
  | 'Haircare'
  | 'Body Care'
  | 'Sun Care'
  | 'Gift Sets';

export type SkinType =
  | 'All Skin Types'
  | 'Normal'
  | 'Dry'
  | 'Oily'
  | 'Combination'
  | 'Sensitive';

export type SkinConcern =
  | 'Hydration'
  | 'Anti-Aging'
  | 'Brightening'
  | 'Acne & Blemishes'
  | 'Barrier Repair'
  | 'Sun Protection'
  | 'Hair Repair';

export type StockFilter = 'All' | 'In Stock' | 'Out of Stock';

export type ProductSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'name-asc'
  | 'name-desc';

export interface ActiveIngredient {
  name: string;
  benefit: string;
}

export interface CustomerReview {
  _id?: string;
  id?: string;
  userId: string;
  userName?: string;
  userLocation?: string;
  title?: string;
  skinType?: SkinType | string;
  rating: number;
  feedback: string;
  verified?: boolean;
  helpfulCount?: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userLocation?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  skinType?: SkinType;
  helpfulCount: number;
}

export interface Category {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  subcategories: string[];
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  price: number; // in LKR
  size: string; // e.g. "30ml", "50ml", "200ml"
  description: string;
  longDescription: string;
  ingredients: string[];
  activeIngredients: ActiveIngredient[];
  howToUse: string;
  skinTypes: SkinType[] | string[];
  image: string;
  images?: string[];
  rating: number | null;
  reviewCount: number | null;
  reviews?: CustomerReview[] | null;
  badge?: string | null;
  stock: number; // Current Inventory Count
  createdAt: string;
  updatedAt?: string;
}

export interface FilterState {
  categories: ProductCategory[];
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name-asc' | 'name-desc';
  searchQuery: string;
}

// Request & DTO Types
export interface CreateProductParams {
  id?: string;
  _id?: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  price: number;
  size?: string;
  description: string;
  longDescription?: string;
  ingredients?: string[];
  activeIngredients?: ActiveIngredient[];
  howToUse?: string;
  skinTypes?: SkinType[] | string[];
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string | null;
  stock?: number;
}

export interface UpdateProductParams extends Partial<CreateProductParams> {
  id?: string;
}

export interface GetProductsQueryParams {
  category?: ProductCategory | string;
  subcategory?: string;
  skinType?: SkinType | string;
  skinTypes?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  badge?: string;
  stockFilter?: 'All' | 'In Stock' | 'Out of Stock' | string;
  inStockOnly?: boolean;
  search?: string;
  q?: string;
  searchQuery?: string;
  sortBy?: ProductSortOption;
  page?: number;
  limit?: number;
}

export interface AddProductReviewParams {
  productId: string;
  userId?: string;
  userName?: string;
  userLocation?: string;
  rating: number;
  feedback?: string;
  comment?: string;
  title?: string;
  verified?: boolean;
  skinType?: SkinType;
}

// Response Types
export interface ProductApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  stack?: string;
}

export interface ProductListResponseData {
  products: Product[];
  count: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface DeleteProductResponseData {
  id: string;
  name: string;
}

// Service / Context Interface
export interface ProductServiceType {
  getProducts(filter?: Partial<FilterState> | GetProductsQueryParams): Promise<Product[]>;
  getProductBySlug(slugOrId: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getFeaturedProducts(): Promise<Product[]>;
  getBestSellers(): Promise<Product[]>;
  getNewArrivals(): Promise<Product[]>;
  getRelatedProducts(category: ProductCategory, currentId: string, limit?: number): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getReviewsForProduct(productId: string): Promise<Review[]>;
  addReview(review: { productId: string; rating: number; feedback?: string; comment?: string; userName?: string }): Promise<Review>;
  createProduct(data: Omit<Product, 'id' | 'createdAt'> | CreateProductParams): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product> | UpdateProductParams): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
}

export interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  filter: FilterState;
  setFilter: (filter: Partial<FilterState> | ((prev: FilterState) => FilterState)) => void;
  resetFilter: () => void;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
}
