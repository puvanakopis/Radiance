'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  Plus,
  Key,
  MapPin,
  Calendar,
  Sparkles,
  Eye,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/adminService';
import { useToast } from '@/context/ToastContext';
import { Customer } from '@/types';

type RoleFilter = 'All' | 'Patrons' | 'Staff & Admin';

export default function AdminCustomersAndUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'customer' | 'admin'>('customer');

  const { showToast } = useToast();

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllCustomers();
      // Ensure we have both customer and admin accounts
      const adminExists = data.some(c => c.role === 'admin');
      if (!adminExists) {
        data.unshift({
          id: 'admin-01',
          name: 'Velora Admin Concierge',
          email: 'admin@velora.lk',
          phone: '+94 77 999 8888',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          totalOrders: 18,
          totalSpend: 145000,
          createdAt: '2025-01-01',
          addresses: [
            {
              id: 'addr-admin',
              label: 'Command Center',
              recipientName: 'Velora Admin',
              phone: '+94 77 999 8888',
              street: '100 Galle Face Terrace',
              city: 'Colombo',
              district: 'Colombo',
              postalCode: '00300',
              country: 'Sri Lanka',
              isDefault: true,
            }
          ]
        });
      }
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail) {
      showToast({ type: 'error', title: 'Please provide first name, last name, and email' });
      return;
    }

    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`;
    const newUser: Customer = {
      id: `usr-${Date.now()}`,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      name: fullName,
      email: newEmail,
      phone: newPhone || '+94 77 000 0000',
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      totalOrders: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString().split('T')[0],
      addresses: [],
    };

    setCustomers(prev => [newUser, ...prev]);
    showToast({
      type: 'success',
      title: 'Account Created',
      message: `${fullName} has been added as ${newRole === 'admin' ? 'Staff Administrator' : 'Registered Patron'}.`
    });

    setIsAddModalOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('customer');
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Patrons' && c.role !== 'admin') ||
      (roleFilter === 'Staff & Admin' && c.role === 'admin');

    return matchesSearch && matchesRole;
  });

  const patronCount = customers.filter(c => c.role !== 'admin').length;
  const staffCount = customers.filter(c => c.role === 'admin').length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-1">
            Accounts & Directory
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Customers Members</h1>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add New Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${roleFilter === 'All'
                ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setRoleFilter('Patrons')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${roleFilter === 'Patrons'
                ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
          >
            Patrons ({patronCount})
          </button>
          <button
            onClick={() => setRoleFilter('Staff & Admin')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${roleFilter === 'Staff & Admin'
                ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
          >
            Staff & Admin ({staffCount})
          </button>
        </div>
      </div>

      {/* Grid of Users & Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((cust) => {
          const isAdmin = cust.role === 'admin';
          return (
            <div
              key={cust.id}
              className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1A1A1A]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={cust.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={cust.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-base font-semibold text-[#1A1A1A] truncate">{cust.name}</h3>
                    <Badge variant={isAdmin ? 'terracotta' : 'sage'} size="xs">
                      {isAdmin ? 'Staff / Admin' : 'Patron'}
                    </Badge>
                  </div>
                  <p className="text-[#1A1A1A]/60 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/40 shrink-0" /> {cust.email}
                  </p>
                  <p className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/40 shrink-0" /> {cust.phone || '—'}
                  </p>
                </div>
              </div>

              {/* Bottom statistics & action */}
              <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">
                    {isAdmin ? 'Access Scope' : 'Lifetime Volume'}
                  </span>
                  <span className="font-serif font-semibold text-[#1A1A1A]">
                    {isAdmin ? 'Cleanroom Command' : `LKR ${(cust.totalSpend || 0).toLocaleString()} (${cust.totalOrders || 0} Orders)`}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedUser(cust)}
                  className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Customer / User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || 'Account Details'}
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#1A1A1A]/10">
              <img
                src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-2xl object-cover bg-[#EAE3D9]"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-[#1A1A1A] font-medium">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.role === 'admin' ? 'terracotta' : 'sage'} size="xs">
                    {selectedUser.role === 'admin' ? 'Staff Administrator' : 'Botanical Patron'}
                  </Badge>
                </div>
                <p className="text-[#1A1A1A]/60">{selectedUser.email}</p>
                <p className="text-[#1A1A1A]/60">{selectedUser.phone || 'No phone recorded'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">
                  Lifetime Value
                </span>
                <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                  LKR {(selectedUser.totalSpend || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">
                  Total Orders
                </span>
                <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                  {selectedUser.totalOrders || 0} Dispatches
                </span>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/60">
                Registered Addresses
              </h4>
              {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.addresses.map((addr) => (
                    <div key={addr.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs">
                      <p className="font-semibold text-[#1A1A1A]">{addr.label} • {addr.street}</p>
                      <p className="text-[#1A1A1A]/60">{addr.city}, {addr.district} ({addr.postalCode}), {addr.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#1A1A1A]/50 italic">No delivery addresses on record.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="e.g. Priyantha"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g. Silva"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@domain.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <Input
            label="Contact Phone"
            placeholder="+94 77 123 4567"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewRole('customer')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${newRole === 'customer'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#FAF8F5]'
                    : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40'
                  }`}
              >
                <p className="font-semibold">Patron / Client</p>
                <p className={`text-[10px] mt-0.5 ${newRole === 'customer' ? 'text-[#FAF8F5]/60' : 'text-[#1A1A1A]/50'}`}>
                  Storefront customer ordering access
                </p>
              </button>

              <button
                type="button"
                onClick={() => setNewRole('admin')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${newRole === 'admin'
                    ? 'border-[#C87D55] bg-[#C87D55] text-white'
                    : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40'
                  }`}
              >
                <p className="font-semibold">Staff Administrator</p>
                <p className={`text-[10px] mt-0.5 ${newRole === 'admin' ? 'text-white/80' : 'text-[#1A1A1A]/50'}`}>
                  Operations & catalog management
                </p>
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
