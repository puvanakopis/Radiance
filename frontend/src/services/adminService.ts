import { AdminStats, Customer, Order, Product } from '@/types';
import { productService } from './productService';
import { orderService } from './orderService';
import { customerService } from './customerService';

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    const [ordersResult, productsResult, customersResult] = await Promise.allSettled([
      orderService.getOrders(),
      productService.getProducts(),
      customerService.getCustomersList({ limit: 100 }),
    ]);

    const orders: Order[] = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const products: Product[] = productsResult.status === 'fulfilled' ? productsResult.value : [];
    const customerData = customersResult.status === 'fulfilled' ? customersResult.value : { customers: [], stats: { totalCustomers: 0, activeCustomers: 0, blockedCustomers: 0 } };

    // 1. Total Revenue calculation (non-cancelled orders)
    const totalRevenue = orders.reduce((sum, ord) => {
      if (ord.status !== 'Cancelled') {
        return sum + (Number(ord.total) || 0);
      }
      return sum;
    }, 0);

    // 2. Stock metrics
    const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 5).length;
    const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;

    // 3. Compute top selling products from actual order items
    const productSalesMap = new Map<string, { product: Product; unitsSold: number; revenue: number }>();

    orders.forEach((ord) => {
      if (ord.status !== 'Cancelled' && Array.isArray(ord.items)) {
        ord.items.forEach((item) => {
          const prodId = item.productId;
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;

          if (prodId) {
            const matchedProduct = products.find(
              (p) => String(p.id) === String(prodId) || String(p._id) === String(prodId)
            );

            // Only track items for products that genuinely exist in the database
            if (matchedProduct) {
              const prodKey = String(matchedProduct.id || matchedProduct._id);
              const existing = productSalesMap.get(prodKey);

              if (existing) {
                existing.unitsSold += qty;
                existing.revenue += qty * price;
              } else {
                productSalesMap.set(prodKey, {
                  product: matchedProduct,
                  unitsSold: qty,
                  revenue: qty * price,
                });
              }
            }
          }
        });
      }
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // 4. Compute 7-day Sales Distribution based on actual order dates
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7DaysMap: { [key: string]: { date: string; amount: number; orders: number } } = {};

    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7DaysMap[dateKey] = {
        date: dayName,
        amount: 0,
        orders: 0,
      };
    }

    // Aggregate orders into days
    orders.forEach((ord) => {
      if (ord.date && ord.status !== 'Cancelled') {
        const ordDate = new Date(ord.date);
        const dateKey = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, '0')}-${String(ordDate.getDate()).padStart(2, '0')}`;
        if (last7DaysMap[dateKey]) {
          last7DaysMap[dateKey].amount += Number(ord.total) || 0;
          last7DaysMap[dateKey].orders += 1;
        }
      }
    });

    const salesByDay = Object.values(last7DaysMap);

    const customersCount = customerData.stats?.totalCustomers || customerData.customers?.length || 0;

    return {
      totalRevenue: totalRevenue,
      ordersCount: orders.length,
      customersCount,
      lowStockCount: lowStockCount || outOfStockCount,
      revenueGrowth: 0,
      ordersGrowth: 0,
      recentOrders: orders.slice(0, 6),
      topProducts,
      salesByDay,
    };
  }

  async getAllCustomers(): Promise<Customer[]> {
    return customerService.getAllCustomers();
  }
}

export const adminService = new AdminService();
