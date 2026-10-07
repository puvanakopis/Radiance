import { Order, OrderStatus } from '@/types';

const ORDERS_STORAGE_KEY = 'skinova_orders';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class OrderService {
  private getSavedOrders(): Order[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private saveOrders(orders: Order[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      } catch (err) {
        console.warn('Failed to persist orders to local storage:', err);
      }
    }
  }

  async getOrders(): Promise<Order[]> {
    await delay(100);
    return this.getSavedOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    await delay(80);
    const orders = this.getSavedOrders();
    return orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    await delay(100);
    const orders = this.getSavedOrders();
    return orders.filter(
      o =>
        o.customer.id === customerId ||
        o.customer.email === customerId ||
        o.id === customerId
    );
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'timeline'>): Promise<Order> {
    await delay(200);
    const orders = this.getSavedOrders();
    const orderNumber = `VL-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: now,
      timeline: [
        { status: 'Placed', timestamp: now, description: 'Order submitted online', completed: true },
        { 
          status: 'Confirmed', 
          timestamp: orderData.paymentMethod === 'PayHere' ? now : '', 
          description: orderData.paymentMethod === 'PayHere' ? 'Payment processed via PayHere Gateway' : 'Awaiting confirmation', 
          completed: orderData.paymentMethod === 'PayHere' 
        },
        { status: 'Processing', timestamp: '', description: 'Dispatched to cleanroom packing', completed: false },
        { status: 'Shipped', timestamp: '', description: 'Courier pickup scheduled', completed: false },
        { status: 'Delivered', timestamp: '', description: 'Delivered to doorstep', completed: false }
      ]
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    await delay(150);
    const orders = this.getSavedOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    order.status = newStatus;

    // Update timeline
    const statuses: OrderStatus[] = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const targetIdx = statuses.indexOf(newStatus);

    order.timeline = statuses.map((st, idx) => ({
      status: st,
      timestamp: idx <= targetIdx ? (order.timeline[idx]?.timestamp || new Date().toISOString()) : '',
      description: idx <= targetIdx ? `${st} step completed` : `Pending ${st}`,
      completed: idx <= targetIdx
    }));

    orders[orderIndex] = { ...order };
    this.saveOrders(orders);
    return orders[orderIndex];
  }
}

export const orderService = new OrderService();
