export type ProductCategory = 'Skincare' | 'Haircare' | 'Body Care' | 'Sun Care' | 'Gift Sets';

export type SkinType = 'All Skin Types' | 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';

export type SkinConcern = 'Hydration' | 'Anti-Aging' | 'Brightening' | 'Acne & Blemishes' | 'Barrier Repair' | 'Sun Protection' | 'Hair Repair';

export type ProductBadge = 'BEST SELLER' | 'NEW ARRIVAL' | 'CLEAN FORMULA' | 'LIMITED EDITION' | 'ORGANIC ACTIVES' | 'AWARD WINNER';

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  price: number; // in LKR
  originalPrice?: number; // for discount display
  size: string; // e.g. "30ml", "50ml", "200ml"
  description: string;
  longDescription: string;
  ingredients: string[];
  activeIngredients: { name: string; benefit: string }[];
  howToUse: string;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  badge?: ProductBadge;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
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

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  recipientName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export * from './auth.interface';

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  role: 'customer' | 'admin';
  avatar?: string;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'PayHere' | 'WhatsApp' | 'Card' | 'CashOnDelivery';

export type PaymentStatus = 'Paid' | 'Pending' | 'Awaiting WhatsApp Confirmation' | 'Failed';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "VL-10482"
  date: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  trackingNumber?: string;
  notes?: string;
  timeline: OrderTimelineItem[];
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

export interface FilterState {
  categories: ProductCategory[];
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
}

export interface AdminStats {
  totalRevenue: number;
  ordersCount: number;
  customersCount: number;
  lowStockCount: number;
  revenueGrowth: number;
  ordersGrowth: number;
  recentOrders: Order[];
  topProducts: { product: Product; unitsSold: number; revenue: number }[];
  salesByDay: { date: string; amount: number; orders: number }[];
}
