'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  MapPin,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { customerService, CustomerStats } from '@/services/customerService';
import { useToast } from '@/context/ToastContext';
import { Customer } from '@/types';

type StatusFilter = 'All' | 'Active' | 'Blocked';

function getInitial(customer?: Customer | null): string {
  if (!customer) return 'C';
  const name = customer.firstName || customer.name || '';
  return name.trim().charAt(0).toUpperCase() || 'C';
}

export default function AdminCustomersAndUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [deletingUser, setDeletingUser] = useState<Customer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const { showToast } = useToast();

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filterStatus =
        statusFilter === 'Active' ? 'active' : statusFilter === 'Blocked' ? 'blocked' : undefined;

      const res = await customerService.getCustomersList({
        search: searchQuery.trim() || undefined,
        status: filterStatus,
        limit: 100,
      });

      setCustomers(res.customers || []);
      if (res.stats) {
        setStats(res.stats);
      } else {
        const total = res.customers.length;
        const active = res.customers.filter((c) => c.isActive !== false).length;
        setStats({
          totalCustomers: total,
          activeCustomers: active,
          blockedCustomers: total - active,
        });
      }
    } catch (err: any) {
      console.error('Failed to load customers from API:', err);
      showToast({
        type: 'error',
        title: 'Error loading customers',
        message: err.message || 'Could not connect to backend server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  // Open Edit Modal and populate fields
  const handleOpenEdit = (customer: Customer) => {
    setEditingUser(customer);
    setEditFirstName(customer.firstName || customer.name.split(' ')[0] || '');
    setEditLastName(customer.lastName || customer.name.split(' ').slice(1).join(' ') || '');
    setEditEmail(customer.email || '');
    setEditPhone(customer.phone || '');
    setEditAddress(customer.address || (customer.addresses?.[0]?.street || ''));
    setEditCity(customer.city || (customer.addresses?.[0]?.city || ''));
    setEditDistrict(customer.district || (customer.addresses?.[0]?.district || ''));
    setEditIsActive(customer.isActive !== false);
  };

  // Submit Update Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      showToast({ type: 'error', title: 'First name, last name, and email are required.' });
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await customerService.updateCustomer(editingUser.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        city: editCity.trim() || undefined,
        district: editDistrict.trim() || undefined,
        isActive: editIsActive,
      });

      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );

      if (selectedUser?.id === updated.id) {
        setSelectedUser(updated);
      }

      showToast({
        type: 'success',
        title: 'Customer Updated',
        message: `Account details for ${updated.name} have been updated successfully.`,
      });

      setEditingUser(null);
    } catch (err: any) {
      console.error('Update customer failed:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Failed to update customer account.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Block / Unblock Customer Toggle
  const handleToggleBlock = async (customer: Customer) => {
    setActionLoadingId(customer.id);
    const targetStatus = !(customer.isActive !== false);
    try {
      const updated = await customerService.toggleBlockCustomer(customer.id, targetStatus);

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, isActive: targetStatus } : c))
      );

      if (selectedUser?.id === customer.id) {
        setSelectedUser((prev) => (prev ? { ...prev, isActive: targetStatus } : null));
      }

      // Update statistics
      setStats((prev) => ({
        ...prev,
        activeCustomers: targetStatus ? prev.activeCustomers + 1 : Math.max(0, prev.activeCustomers - 1),
        blockedCustomers: targetStatus ? Math.max(0, prev.blockedCustomers - 1) : prev.blockedCustomers + 1,
      }));

      showToast({
        type: 'success',
        title: targetStatus ? 'Customer Unblocked' : 'Customer Blocked',
        message: `${customer.name} is now ${targetStatus ? 'active and permitted to sign in.' : 'blocked from accessing the store.'}`,
      });
    } catch (err: any) {
      console.error('Toggle block failed:', err);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to change customer account status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async () => {
    if (!deletingUser) return;
    setIsUpdating(true);
    try {
      await customerService.deleteCustomer(deletingUser.id);

      setCustomers((prev) => prev.filter((c) => c.id !== deletingUser.id));

      if (selectedUser?.id === deletingUser.id) {
        setSelectedUser(null);
      }

      setStats((prev) => ({
        totalCustomers: Math.max(0, prev.totalCustomers - 1),
        activeCustomers: deletingUser.isActive !== false ? Math.max(0, prev.activeCustomers - 1) : prev.activeCustomers,
        blockedCustomers: deletingUser.isActive === false ? Math.max(0, prev.blockedCustomers - 1) : prev.blockedCustomers,
      }));

      showToast({
        type: 'success',
        title: 'Customer Deleted',
        message: `Account ${deletingUser.name} has been removed.`,
      });

      setDeletingUser(null);
    } catch (err: any) {
      console.error('Delete customer failed:', err);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete customer account.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block mb-1">
            Accounts & Directory
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Customer Management</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Manage customer profiles, inspect registration details, and block or unblock account access.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={loadCustomers}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold block">
              Total Customers
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
              {stats.totalCustomers || customers.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5B7065]/10 border border-[#5B7065]/20 flex items-center justify-center text-[#5B7065]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#5B7065] font-semibold block">
              Active Patrons
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
              {stats.activeCustomers}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8B3A2B]/10 border border-[#8B3A2B]/20 flex items-center justify-center text-[#8B3A2B]">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8B3A2B] font-semibold block">
              Blocked / Suspended
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
              {stats.blockedCustomers}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, city, or district..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-[#1A1A1A] text-[#FAF8F5] font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-[#5B7065] text-white font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            Active ({stats.activeCustomers})
          </button>
          <button
            onClick={() => setStatusFilter('Blocked')}
            className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'Blocked'
                ? 'bg-[#8B3A2B] text-white font-semibold'
                : 'bg-[#FAF8F5] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            Blocked ({stats.blockedCustomers})
          </button>
        </div>
      </div>

      {/* Grid of Customers */}
      {isLoading ? (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#C87D55] animate-spin" />
          <p className="text-xs text-[#1A1A1A]/60">Retrieving customer accounts...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-[#1A1A1A]/30 mx-auto" />
          <h3 className="font-serif text-lg text-[#1A1A1A]">No Customer Accounts Found</h3>
          <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
            {searchQuery
              ? `No registered accounts matching "${searchQuery}". Try clearing your search query.`
              : 'There are currently no customer accounts recorded in the database.'}
          </p>
          {searchQuery && (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map((cust) => {
            const isBlocked = cust.isActive === false;
            const isActionBusy = actionLoadingId === cust.id;

            return (
              <div
                key={cust.id}
                className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isBlocked
                    ? 'border-[#8B3A2B]/30 bg-[#FAF8F5]/40 opacity-80'
                    : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {cust.avatar ? (
                    <img
                      src={cust.avatar}
                      alt={cust.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#EAE3D9] border border-[#1A1A1A]/10 text-[#C87D55] font-serif text-2xl font-bold flex items-center justify-center shrink-0 uppercase select-none shadow-xs">
                      {getInitial(cust)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-semibold text-[#1A1A1A] truncate">
                        {cust.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                          {cust.id}
                        </span>
                        {isBlocked ? (
                          <Badge variant="rose" size="xs">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="sage" size="xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-[#1A1A1A]/60 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/40 shrink-0" /> {cust.email}
                    </p>

                    <p className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/40 shrink-0" />{' '}
                      {cust.phone || 'No phone recorded'}
                    </p>

                    {(cust.city || cust.district) && (
                      <p className="text-[#1A1A1A]/60 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]/40 shrink-0" />{' '}
                        {[cust.city, cust.district].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom action controls */}
                <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">
                      Account Status
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-1 text-[11px] ${
                        isBlocked ? 'text-[#8B3A2B]' : 'text-[#5B7065]'
                      }`}
                    >
                      {isBlocked ? (
                        <>
                          <XCircle className="w-3 h-3" /> Suspended
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Permitted
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Inspect Button */}
                    <button
                      onClick={() => setSelectedUser(cust)}
                      className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium"
                      title="Inspect full details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Inspect</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C87D55]" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Toggle Block / Unblock Button */}
                    <button
                      onClick={() => handleToggleBlock(cust)}
                      disabled={isActionBusy}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium ${
                        isBlocked
                          ? 'border-[#5B7065]/30 bg-[#5B7065]/10 text-[#5B7065] hover:bg-[#5B7065] hover:text-white'
                          : 'border-[#8B3A2B]/30 bg-[#8B3A2B]/10 text-[#8B3A2B] hover:bg-[#8B3A2B] hover:text-white'
                      }`}
                      title={isBlocked ? 'Unblock customer' : 'Block customer'}
                    >
                      {isActionBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isBlocked ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Block</span>
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingUser(cust)}
                      className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#8B3A2B] text-[#1A1A1A]/50 hover:text-[#8B3A2B] hover:bg-[#8B3A2B]/5 transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Customer Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || 'Customer Details'}
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#1A1A1A]/10">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-[#EAE3D9]"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#EAE3D9] border border-[#1A1A1A]/10 text-[#C87D55] font-serif text-2xl font-bold flex items-center justify-center shrink-0 uppercase select-none shadow-xs">
                  {getInitial(selectedUser)}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-[#1A1A1A] font-medium">
                    {selectedUser.name}
                  </h3>
                  {selectedUser.isActive === false ? (
                    <Badge variant="rose" size="xs">
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="sage" size="xs">
                      Active Patron
                    </Badge>
                  )}
                </div>
                <p className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#1A1A1A]/40" /> {selectedUser.email}
                </p>
                <p className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#1A1A1A]/40" />{' '}
                  {selectedUser.phone || 'No phone recorded'}
                </p>
              </div>
            </div>

            {/* Account Details & Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">
                  Customer ID
                </span>
                <span className="font-mono text-sm font-semibold text-[#1A1A1A]">
                  {selectedUser.id}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#1A1A1A]/10 bg-white">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-1">
                  Registration Date
                </span>
                <span className="font-serif text-sm font-semibold text-[#1A1A1A]">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/60 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address & Location
              </h4>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs space-y-1">
                <p className="font-semibold text-[#1A1A1A]">
                  {selectedUser.address || 'No street address specified'}
                </p>
                <p className="text-[#1A1A1A]/60">
                  City: {selectedUser.city || '—'} | District: {selectedUser.district || '—'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToggleBlock(selectedUser)}
                className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  selectedUser.isActive === false
                    ? 'bg-[#5B7065] text-white hover:bg-[#4a5c53]'
                    : 'bg-[#8B3A2B] text-white hover:bg-[#722f23]'
                }`}
              >
                {selectedUser.isActive === false ? 'Unblock Customer' : 'Block Customer'}
              </button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const u = selectedUser;
                    setSelectedUser(null);
                    handleOpenEdit(u);
                  }}
                >
                  Edit Profile
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedUser(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit Customer: ${editingUser?.name || ''}`}
        maxWidth="md"
      >
        {editingUser && (
          <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="e.g. Kasun"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                placeholder="e.g. Perera"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="customer@domain.com"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />

            <Input
              label="Contact Phone"
              placeholder="+94 77 123 4567"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

            <Input
              label="Street Address"
              placeholder="e.g. 45 Galle Road"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="e.g. Colombo"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
              />
              <Input
                label="District"
                placeholder="e.g. Western Province"
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
              />
            </div>

            {/* Account Active State Radio */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Account Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditIsActive(true)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    editIsActive
                      ? 'border-[#5B7065] bg-[#5B7065]/10 text-[#5B7065] font-semibold'
                      : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#5B7065]" /> Active Patron
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                    Permitted to sign in and place orders
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEditIsActive(false)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    !editIsActive
                      ? 'border-[#8B3A2B] bg-[#8B3A2B]/10 text-[#8B3A2B] font-semibold'
                      : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <p className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#8B3A2B]" /> Blocked / Suspended
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                    Blocked from authentication & checkout
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete Customer Account"
        maxWidth="sm"
      >
        {deletingUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-[#8B3A2B]/10 rounded-2xl border border-[#8B3A2B]/20 text-[#8B3A2B]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Are you sure you want to delete this customer?</p>
                <p className="text-[11px] text-[#8B3A2B]/80 mt-1">
                  This will permanently delete the customer record for <strong>{deletingUser.name}</strong> ({deletingUser.email}). This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingUser(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteCustomer}
                disabled={isUpdating}
                className="bg-[#8B3A2B] hover:bg-[#722f23] text-white border-none"
              >
                {isUpdating ? 'Deleting...' : 'Delete Customer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
