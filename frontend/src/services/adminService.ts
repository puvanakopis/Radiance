import { AdminStats, Customer, Order, Product } from '@/types';
import { mockCurrentUser, mockOrders, mockProducts } from '@/data/mockProducts';
import { productService } from './productService';
import { orderService } from './orderService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    await delay(120);
    const orders = await orderService.getOrders();
    const products = await productService.getProducts();

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.status !== 'Cancelled' ? ord.total : 0), 0);
    const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

    const topProducts = products.slice(0, 4).map((product, i) => ({
      product,
      unitsSold: 45 - i * 8,
      revenue: (45 - i * 8) * product.price
    }));

    const salesByDay = [
      { date: 'Mon', amount: 142000, orders: 12 },
      { date: 'Tue', amount: 189000, orders: 18 },
      { date: 'Wed', amount: 245000, orders: 24 },
      { date: 'Thu', amount: 210000, orders: 19 },
      { date: 'Fri', amount: 320000, orders: 28 },
      { date: 'Sat', amount: 410000, orders: 35 },
      { date: 'Sun', amount: 380000, orders: 31 }
    ];

    return {
      totalRevenue: totalRevenue + 1245000,
      ordersCount: orders.length + 280,
      customersCount: 1842,
      lowStockCount,
      revenueGrowth: 18.4,
      ordersGrowth: 12.2,
      recentOrders: orders.slice(0, 5),
      topProducts,
      salesByDay
    };
  }

  async getAllCustomers(): Promise<Customer[]> {
    await delay(100);
    return [
      mockCurrentUser,
      {
        id: 'cust-02',
        name: 'Ananya Mendis',
        email: 'ananya@example.com',
        phone: '+94 71 987 6543',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        totalOrders: 4,
        totalSpend: 34800,
        createdAt: '2026-01-12',
        addresses: []
      },
      {
        id: 'cust-03',
        name: 'Rohan Senanayake',
        email: 'rohan.s@gmail.com',
        phone: '+94 76 555 1212',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        totalOrders: 2,
        totalSpend: 24500,
        createdAt: '2026-02-04',
        addresses: []
      },
      {
        id: 'cust-04',
        name: 'Dineli Fernando',
        email: 'dineli.f@outlook.com',
        phone: '+94 77 444 8899',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        totalOrders: 6,
        totalSpend: 78200,
        createdAt: '2025-11-20',
        addresses: []
      }
    ];
  }
}

export const adminService = new AdminService();
