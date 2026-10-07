'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { customerService, CustomerStats } from '@/services/customerService';
import { useToast } from '@/context/ToastContext';
import { Customer } from '@/types';

type StatusFilter = 'All' | 'Active' | 'Blocked';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'email-asc';

const ITEMS_PER_PAGE = 10;

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
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, districtFilter, sortBy]);

  // Extract unique districts for dropdown filter
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.district) set.add(c.district);
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filter & Sort customers in memory
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        if (districtFilter !== 'All') {
          const matches =
            (c.district && c.district.toLowerCase() === districtFilter.toLowerCase()) ||
            (c.city && c.city.toLowerCase() === districtFilter.toLowerCase());
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'name-desc') {
          return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'email-asc') {
          return (a.email || '').localeCompare(b.email || '');
        }
        return 0;
      });
  }, [customers, districtFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDistrictFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || districtFilter !== 'All' || sortBy !== 'newest';

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
        message: `Account details for ${updated.name} updated successfully.`,
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
        title: targetStatus ? 'Patron Permitted' : 'Patron Suspended',
        message: `${customer.name} is now ${targetStatus ? 'active and permitted.' : 'suspended from store sign-in.'}`,
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
        message: `Account ${deletingUser.name} has been removed permanently.`,
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
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block mb-1">
            Accounts & Directory
          </span>
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Customer Management</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Inspect patron accounts, modify contact details, and administer account access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={loadCustomers}
            disabled={isLoading}
          >
            {isLoading ? 'Syncing...' : 'Refresh Directory'}
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold block">
              Registered Patrons
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {stats.totalCustomers || customers.length}
            </span>
            <span className="text-[10px] text-[#1A1A1A]/60 mt-0.5 block">
              Total member directory
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#5B7065] font-semibold block">
              Active Patrons
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {stats.activeCustomers}
            </span>
            <span className="text-[10px] text-[#5B7065] mt-0.5 block">
              Permitted for checkout & rituals
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5B7065]/10 border border-[#5B7065]/20 flex items-center justify-center text-[#5B7065]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Blocked / Suspended */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8B3A2B] font-semibold block">
              Suspended Accounts
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {stats.blockedCustomers}
            </span>
            <span className="text-[10px] text-[#8B3A2B] mt-0.5 block">
              Restricted from signing in
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#8B3A2B]/10 border border-[#8B3A2B]/20 flex items-center justify-center text-[#8B3A2B]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Engagement / Verification */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#1A1A1A]/20 transition-all">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C87D55] font-semibold block">
              Active Rate
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5 block">
              {stats.totalCustomers > 0 ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100) : 100}%
            </span>
            <span className="text-[10px] text-[#C87D55] mt-0.5 block">
              High tier patronage health
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C87D55]/10 border border-[#C87D55]/20 flex items-center justify-center text-[#C87D55]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Dropdowns */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patron name, email, contact phone, or location..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-all placeholder:text-[#1A1A1A]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Account Status Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Status: All Patrons</option>
                <option value="Active">Status: Active Patrons</option>
                <option value="Blocked">Status: Suspended / Blocked</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Location / District Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="All">Location: All Regions</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>Location: {d}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#FAF8F5] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-full text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#C87D55] transition-colors cursor-pointer"
              >
                <option value="newest">Sort: Newest Registered</option>
                <option value="oldest">Sort: Oldest Registered</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="email-asc">Email: A to Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-full border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/60 hover:text-[#C87D55] hover:border-[#C87D55]/30 bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Customers Table */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#FAF8F5]/80 text-[#1A1A1A]/60 uppercase tracking-widest font-semibold">
                <th className="py-4 px-6">Patron Profile</th>
                <th className="py-4 px-6">Contact & Email</th>
                <th className="py-4 px-6">Delivery Destination</th>
                <th className="py-4 px-6">Member Since</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#1A1A1A]/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#C87D55] border-t-transparent animate-spin" />
                      <span>Loading patron accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <Users className="w-10 h-10 text-[#1A1A1A]/20 mx-auto" />
                      <h3 className="font-serif text-lg text-[#1A1A1A]">No Customer Accounts Found</h3>
                      <p className="text-xs text-[#1A1A1A]/60">
                        {hasActiveFilters
                          ? 'No patron accounts match the selected filters or search keyword.'
                          : 'There are currently no customer profiles stored.'}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleResetFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isBlocked = cust.isActive === false;
                  const isActionBusy = actionLoadingId === cust.id;
                  const formattedDate = cust.createdAt
                    ? new Date(cust.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={cust.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      {/* Patron Profile & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {cust.avatar ? (
                            <img
                              src={cust.avatar}
                              alt={cust.name}
                              className="w-11 h-11 rounded-xl object-cover bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#EAE3D9] border border-[#1A1A1A]/10 text-[#C87D55] font-serif text-lg font-bold flex items-center justify-center shrink-0 uppercase select-none shadow-xs">
                              {getInitial(cust)}
                            </div>
                          )}
                          <div>
                            <span className="font-serif text-sm font-medium text-[#1A1A1A] block">
                              {cust.name}
                            </span>
                            <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                              ID: {cust.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Email */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-[#1A1A1A] flex items-center gap-1.5 truncate max-w-[200px]">
                          <Mail className="w-3 h-3 text-[#1A1A1A]/40 shrink-0" />
                          {cust.email}
                        </p>
                        <p className="text-[10px] text-[#1A1A1A]/50 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-[#1A1A1A]/40 shrink-0" />
                          {cust.phone || 'No phone on record'}
                        </p>
                      </td>

                      {/* Delivery Destination */}
                      <td className="py-4 px-6 text-[#1A1A1A]/80">
                        {cust.city || cust.district || cust.address ? (
                          <div>
                            <p className="font-medium text-[#1A1A1A] truncate max-w-[180px]">
                              {[cust.city, cust.district].filter(Boolean).join(', ') || cust.address}
                            </p>
                            {cust.address && (cust.city || cust.district) && (
                              <span className="block text-[10px] text-[#1A1A1A]/50 truncate max-w-[180px]">
                                {cust.address}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#1A1A1A]/40 italic">No destination saved</span>
                        )}
                      </td>

                      {/* Member Since */}
                      <td className="py-4 px-6 text-[#1A1A1A]/70">
                        <span>{formattedDate}</span>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-6">
                        <Badge
                          variant={isBlocked ? 'rose' : 'sage'}
                          size="xs"
                        >
                          {isBlocked ? 'Suspended' : 'Active Patron'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect */}
                          <button
                            onClick={() => setSelectedUser(cust)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                            title="Inspect full details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#C87D55] text-[#C87D55] hover:bg-[#C87D55]/10 transition-colors cursor-pointer"
                            title="Edit customer account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock Toggle */}
                          <button
                            onClick={() => handleToggleBlock(cust)}
                            disabled={isActionBusy}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                              isBlocked
                                ? 'border-[#5B7065]/30 bg-[#5B7065]/10 text-[#5B7065] hover:bg-[#5B7065] hover:text-white'
                                : 'border-[#8B3A2B]/30 bg-[#8B3A2B]/10 text-[#8B3A2B] hover:bg-[#8B3A2B] hover:text-white'
                            }`}
                            title={isBlocked ? 'Permit / Unblock account' : 'Suspend / Block account'}
                          >
                            {isActionBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isBlocked ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingUser(cust)}
                            className="p-2 rounded-xl border border-[#1A1A1A]/10 hover:border-[#8B3A2B] text-[#1A1A1A]/50 hover:text-[#8B3A2B] hover:bg-[#8B3A2B]/5 transition-colors cursor-pointer"
                            title="Delete customer record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 sm:px-6 bg-[#FAF8F5]/60 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A1A1A]/60">
          <div>
            <span>
              Showing <strong className="text-[#1A1A1A]">{filteredCustomers.length === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of <strong className="text-[#1A1A1A]">{filteredCustomers.length}</strong> registered patron accounts
              {filteredCustomers.length !== customers.length && ` (filtered from ${customers.length})`}
            </span>
          </div>

          {/* Previous / Next Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-full font-medium text-[11px] text-[#1A1A1A]">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages || filteredCustomers.length === 0}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Customer Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || 'Customer Details'}
        subtitle={`Member ID: ${selectedUser?.id}`}
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
                      Suspended
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
                    ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB', {
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
                  City: {selectedUser.city || '—'} • District: {selectedUser.district || '—'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#1A1A1A]/10">
              <button
                onClick={() => handleToggleBlock(selectedUser)}
                className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  selectedUser.isActive === false
                    ? 'bg-[#5B7065] text-white hover:bg-[#4a5c53]'
                    : 'bg-[#8B3A2B] text-white hover:bg-[#722f23]'
                }`}
              >
                {selectedUser.isActive === false ? 'Permit / Unblock' : 'Suspend Account'}
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
                  Close
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
        subtitle="Update registered name, contact channels, and system privileges"
        maxWidth="md"
      >
        {editingUser && (
          <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name *"
                placeholder="e.g. Kasun"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                placeholder="e.g. Perera"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address *"
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
                Account Privileges
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
                  <p className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#5B7065]" /> Active Patron
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                    Permitted to sign in and order
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
                  <p className="flex items-center gap-1.5 font-medium">
                    <XCircle className="w-4 h-4 text-[#8B3A2B]" /> Suspended / Blocked
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                    Blocked from authentication
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#1A1A1A]/10">
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
            <div className="flex items-start gap-3 p-3.5 bg-[#8B3A2B]/10 rounded-2xl border border-[#8B3A2B]/20 text-[#8B3A2B]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Delete {deletingUser.name}?</p>
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
