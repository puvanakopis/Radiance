'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'error', title: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Recovery Link Dispatched',
        message: 'Please check your inbox for password reset instructions.',
      });
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 text-center py-6 sm:py-10">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          Account Access Recovery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Reset Password</h1>
        <p className="text-xs text-[#1A1A1A]/60 font-light">
          Enter the email address associated with your Velora patron profile.
        </p>
      </div>

      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs text-left">
        {isSubmitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#8A9A86]/20 text-[#8A9A86] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A]">Instructions Sent</h3>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              We have transmitted recovery instructions to <strong className="text-[#1A1A1A]">{email}</strong>.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" size="sm" fullWidth icon={ArrowLeft}>
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Transmit Recovery Link
            </Button>

            <div className="pt-4 border-t border-[#1A1A1A]/10 text-center text-xs text-[#1A1A1A]/60">
              <Link href="/login" className="font-semibold text-[#1A1A1A] hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
