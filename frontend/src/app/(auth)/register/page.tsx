'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showToast({ type: 'error', title: 'Please complete all required fields' });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, phone, password);
      router.push('/account');
    } catch {
      // Handled in auth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 text-center py-6 sm:py-10">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          Join The Collective
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Create Account</h1>
        <p className="text-xs text-[#1A1A1A]/60 font-light">
          Enjoy personal skincare consultations, birthday tokens, and order tracking.
        </p>
      </div>

      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs text-left">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Puvanakopis"
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="pt-6 mt-6 border-t border-[#1A1A1A]/10 text-center text-xs text-[#1A1A1A]/60">
          <span>Already registered? </span>
          <Link href="/login" className="font-semibold text-[#1A1A1A] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
