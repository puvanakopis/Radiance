'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ type: 'error', title: 'Please enter your email and password' });
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin' || email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 text-center py-6 sm:py-10">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          Client Sanctuary
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Welcome Back</h1>
        <p className="text-xs text-[#1A1A1A]/60 font-light">
          Sign in to access your order archives and saved botanical rituals.
        </p>
      </div>

      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs text-left">
        <form onSubmit={handleSubmit} className="space-y-5">
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
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="flex justify-end text-xs">
            <Link
              href="/forgot-password"
              className="text-[#C87D55] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-6 mt-6 border-t border-[#1A1A1A]/10 text-center text-xs text-[#1A1A1A]/60">
          <span>New to Radiance? </span>
          <Link href="/register" className="font-semibold text-[#1A1A1A] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
