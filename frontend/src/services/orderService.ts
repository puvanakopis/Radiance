import { Order, OrderStatus } from '@/types';
import { mockOrders } from '@/data/mockProducts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class OrderService {
  private orders: Order[] = [...mockOrders];

  async getOrders(): Promise<Order[]> {
    await delay(100);
    return [...this.orders];
  }

  async getOrderById(id: string): Promise<Order | null> {
    await delay(80);
    return this.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    await delay(100);
    return this.orders.filter(o => o.customer.id === customerId);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'timeline'>): Promise<Order> {
    await delay(250);
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

    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    await delay(150);
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = this.orders[orderIndex];
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

    this.orders[orderIndex] = { ...order };
    return this.orders[orderIndex];
  }
}

export const orderService = new OrderService();
