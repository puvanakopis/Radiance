import { Product } from './product.interface';

export * from './product.interface';
export * from './auth.interface';

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

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  district?: string;
  addresses: Address[];
  role: 'customer' | 'admin' | string;
  avatar?: string;
  isActive?: boolean;
  wishlist?: string[] | Product[];
  totalOrders?: number;
  totalSpend?: number;
  createdAt?: string;
  updatedAt?: string;
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
  sku?: string;
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

export interface AdminStats {
  totalRevenue: number;
  ordersCount: number;
  customersCount: number;
  lowStockCount: number;
  revenueGrowth: number;
  ordersGrowth: number;
  recentOrders: Order[];
  topProducts: { product: import('./product.interface').Product; unitsSold: number; revenue: number }[];
  salesByDay: { date: string; amount: number; orders: number }[];
}
