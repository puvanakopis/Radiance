import { Customer } from '@/types';
import { mockCurrentUser } from '@/data/mockProducts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ADMIN_USER: Customer = {
  id: 'admin-01',
  name: 'Velora Admin Concierge',
  email: 'admin@velora.lk',
  phone: '+94 77 999 8888',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  totalOrders: 0,
  totalSpend: 0,
  createdAt: '2025-01-01',
  addresses: []
};

class AuthService {
  private currentUser: Customer | null = mockCurrentUser;

  async getCurrentUser(): Promise<Customer | null> {
    await delay(50);
    const saved = localStorage.getItem('velora_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return this.currentUser;
      }
    }
    return this.currentUser;
  }

  async login(email: string, _password?: string): Promise<Customer> {
    await delay(200);
    let user: Customer;
    if (email.toLowerCase().includes('admin')) {
      user = ADMIN_USER;
    } else {
      user = {
        ...mockCurrentUser,
        email
      };
    }
    this.currentUser = user;
    localStorage.setItem('velora_user', JSON.stringify(user));
    return user;
  }

  async register(name: string, email: string, phone: string, _password?: string): Promise<Customer> {
    await delay(250);
    const newUser: Customer = {
      id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString().split('T')[0],
      addresses: []
    };
    this.currentUser = newUser;
    localStorage.setItem('velora_user', JSON.stringify(newUser));
    return newUser;
  }

  async logout(): Promise<void> {
    await delay(100);
    this.currentUser = null;
    localStorage.removeItem('velora_user');
  }

  async updateProfile(updates: Partial<Customer>): Promise<Customer> {
    await delay(150);
    if (!this.currentUser) throw new Error('Not authenticated');
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem('velora_user', JSON.stringify(this.currentUser));
    return this.currentUser;
  }
}

export const authService = new AuthService();
