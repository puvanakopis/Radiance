'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  MapPin,
  Plus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Address } from '@/types';

export default function AccountPage() {
  const { user, updateProfile, addAddress, setDefaultAddress, deleteAddress } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Profile Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Add Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('Colombo');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      const fName = user.firstName || user.name?.split(' ')?.[0] || '';
      const lName = user.lastName || user.name?.split(' ')?.slice(1).join(' ') || '';
      setEditFirstName(fName);
      setEditLastName(lName);
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
      setNewRecipient(user.name || '');
      setNewPhone(user.phone || '');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: `${editFirstName.trim()} ${editLastName.trim()}`,
        email: editEmail,
        phone: editPhone,
      });
      showToast({
        type: 'success',
        title: 'Credentials Saved',
        message: 'Your personal sanctuary details have been successfully updated.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not save patron credentials. Please try again.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      await addAddress({
        label: newLabel,
        recipientName: newRecipient || user.name,
        phone: newPhone || user.phone,
        street: newStreet,
        apartment: newApartment,
        city: newCity,
        district: newDistrict,
        postalCode: newPostalCode,
        country: 'Sri Lanka',
        isDefault: newIsDefault || (user.addresses && user.addresses.length === 0),
      });

      // Reset form
      setNewStreet('');
      setNewApartment('');
      setNewCity('');
      setNewPostalCode('');
      setNewIsDefault(false);
      setIsAddAddressOpen(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not add delivery address.',
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <AccountLayout
      subtitle="Personal Sanctuary"
      title="Patron Overview & Details"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Patron Sanctuary', href: '/account' },
        { label: 'Overview' },
      ]}
      action={
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="outline" size="sm" icon={ShoppingBag}>
              View All Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="primary" size="sm" icon={Sparkles}>
              Discover Catalog
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8 w-full">
        {/* Patron Profile Credentials Card */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C87D55]/15 text-[#C87D55] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#1A1A1A]">Patron Credentials</h2>
                <p className="text-xs text-[#1A1A1A]/50">
                  Manage your personal contact credentials and sanctuary account identity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="sage" size="xs">
                Radiance Gold Sanctuary
              </Badge>
              <span className="text-xs text-[#1A1A1A]/40 font-mono">ID: {user.id}</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="e.g. Eleanor"
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="patron@radiance.lk"
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Patron Status
              </label>
              <div className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/60 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#8A9A86]" />
                  <span>Active Member Since {user.createdAt || '2025'}</span>
                </span>
                <span className="text-[10px] font-semibold text-[#8A9A86] uppercase tracking-wider">
                  Verified
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1A1A1A]/5">
              <Link
                href="/settings"
                className="text-xs text-[#C87D55] hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <span>Need to update password or delete account? Go to Security & Settings →</span>
              </Link>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingProfile}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Delivery Destinations Card */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8A9A86]/20 text-[#8A9A86] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#1A1A1A]">Delivery Destinations</h2>
                <p className="text-xs text-[#1A1A1A]/50">
                  Manage and specify primary and alternate shipping residences for door-to-door dispatches.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddAddressOpen(true)}
              className="self-start sm:self-auto"
            >
              Add New Destination
            </Button>
          </div>

          <div className="space-y-3">
            {(!user.addresses || user.addresses.length === 0) ? (
              <div className="p-10 text-center bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center mx-auto text-[#1A1A1A]/50">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="font-serif text-base text-[#1A1A1A]">No Saved Addresses</p>
                <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
                  Add your primary delivery residence to ensure rapid checkout and islandwide courier dispatches.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setIsAddAddressOpen(true)}
                  >
                    Add Primary Address
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr: Address) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border text-xs transition-all space-y-3 flex flex-col justify-between ${
                      addr.isDefault
                        ? 'bg-[#FAF8F5] border-[#C87D55]/60 shadow-xs ring-1 ring-[#C87D55]/20'
                        : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-semibold text-[#1A1A1A]">
                            {addr.label || 'Residence'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C87D55]/15 text-[#C87D55] px-2.5 py-0.5 rounded-full">
                              Primary Destination
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-[#1A1A1A]/40 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[#1A1A1A]/80 text-xs leading-relaxed">
                        {addr.street}
                        {addr.apartment ? `, ${addr.apartment}` : ''}
                        <br />
                        {addr.city}, {addr.district} {addr.postalCode}
                      </p>

                      <div className="text-[11px] text-[#1A1A1A]/50 pt-1 border-t border-[#1A1A1A]/5">
                        <p className="truncate">
                          Recipient: <span className="font-medium text-[#1A1A1A]/70">{addr.recipientName || user.name}</span> • {addr.phone || user.phone}
                        </p>
                      </div>
                    </div>

                    {!addr.isDefault && (
                      <div className="pt-2 border-t border-[#1A1A1A]/5 flex justify-end">
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs font-semibold text-[#C87D55] hover:underline cursor-pointer"
                        >
                          Make Primary Destination
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        title="Add Delivery Destination"
        subtitle="Save a new shipping address"
      >
        <form onSubmit={handleSaveNewAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Address Label
              </label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Villa">Villa / Sanctuary</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="Full Name"
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Contact Phone
            </label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+94 77 ..."
              className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
              Street Address
            </label>
            <input
              type="text"
              required
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              placeholder="e.g. 42 Lotus Road"
              className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Apartment / Suite (Optional)
              </label>
              <input
                type="text"
                value={newApartment}
                onChange={(e) => setNewApartment(e.target.value)}
                placeholder="Apt 4B"
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                City
              </label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Colombo"
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                District
              </label>
              <select
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              >
                {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={newPostalCode}
                onChange={(e) => setNewPostalCode(e.target.value)}
                placeholder="00500"
                className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsDefault}
              onChange={(e) => setNewIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-[#1A1A1A] border-[#1A1A1A]/20"
            />
            <span className="text-xs text-[#1A1A1A]/80 font-medium">
              Set as primary delivery destination
            </span>
          </label>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddAddressOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingAddress}
            >
              Save Destination
            </Button>
          </div>
        </form>
      </Modal>
    </AccountLayout>
  );
}
