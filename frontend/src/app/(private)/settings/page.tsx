'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, changePassword, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);

      // Clear fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Could not update password. Please check your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationInput !== 'DELETE') {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      router.push('/');
    } catch {
      setIsDeletingAccount(false);
    }
  };

  return (
    <AccountLayout
      subtitle="Security & Credentials"
      title="Sanctuary Settings & Security"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Patron Sanctuary', href: '/account' },
        { label: 'Settings & Security' },
      ]}
    >
      <div className="space-y-8 w-full">
        {/* Change Password Card */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1A1A1A]/10 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-[#C87D55]/15 text-[#C87D55] flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl text-[#1A1A1A]">Update Sanctuary Password</h2>
              <p className="text-xs text-[#1A1A1A]/50">
                Enhance your account security with a strong, private authentication passphrase.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Enter current password"
                  className="w-full p-3.5 pr-11 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Minimum 8 characters"
                    className="w-full p-3.5 pr-11 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Re-type new password"
                    className="w-full p-3.5 pr-11 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] outline-none focus:border-[#C87D55] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password requirements hint */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A1A1A]/5 text-[11px] text-[#1A1A1A]/60 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8A9A86] flex-shrink-0" />
              <span>
                Passwords must contain at least 8 characters. We recommend a combination of letters, numbers, and symbols.
              </span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Lock}
                isLoading={isUpdatingPassword}
              >
                Save New Password
              </Button>
            </div>
          </form>
        </div>

        {/* Delete Account Card (Danger Zone) */}
        <div className="bg-white border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-red-900">Decommission Sanctuary Account</h2>
                <p className="text-xs text-[#1A1A1A]/50">
                  Permanently erase your account, personal data, and order history from Radiance.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteConfirmationInput('');
                setIsDeleteModalOpen(true);
              }}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 self-start sm:self-auto"
            >
              Delete Account
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 text-xs text-[#1A1A1A]/70 space-y-2 leading-relaxed">
            <p className="font-semibold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Important consequence notice
            </p>
            <p className="text-[11px] text-[#1A1A1A]/60">
              Once decommissioned, your active addresses, saved ritual cart items, patron membership tier, and historical delivery receipts cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeletingAccount) {
            setIsDeleteModalOpen(false);
          }
        }}
        title="Confirm Account Decommission"
        subtitle="Permanent Data Erasure"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-5">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              This action is irreversible
            </p>
            <p className="text-[11px] leading-relaxed text-red-700/90">
              All details associated with <strong>{user?.email}</strong> will be erased.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 block">
              To confirm, type <strong className="text-red-600 tracking-normal font-bold">DELETE</strong> in the box below:
            </label>
            <input
              type="text"
              required
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeletingAccount}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={deleteConfirmationInput !== 'DELETE'}
              isLoading={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent disabled:opacity-50"
            >
              Permanently Delete Sanctuary
            </Button>
          </div>
        </form>
      </Modal>
    </AccountLayout>
  );
}
