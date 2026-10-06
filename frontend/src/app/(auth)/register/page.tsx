'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, RefreshCw, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const { sendRegistrationOtp, resendRegistrationOtp, verifyRegistrationOtp } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email || !phone || !password) {
      showToast({ type: 'error', title: 'Please complete all required fields' });
      return;
    }

    if (password.length < 6) {
      showToast({ type: 'error', title: 'Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await sendRegistrationOtp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email,
        phone,
        password,
      });
      setStep('otp');
      setTimer(60);
      setOtp('');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      await resendRegistrationOtp(email);
      setTimer(60);
    } catch {
      // Handled in context
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      showToast({ type: 'error', title: 'Please enter the complete 6-digit verification code' });
      return;
    }

    setIsLoading(true);
    try {
      await verifyRegistrationOtp(email, otp.trim());
      router.push('/');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 text-center py-6 sm:py-10">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
          {step === 'details' ? 'Join The Collective' : 'Identity Verification'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
          {step === 'details' ? 'Create Account' : 'Verify Your Email'}
        </h1>
        <p className="text-xs text-[#1A1A1A]/60 font-light max-w-lg mx-auto">
          {step === 'details'
            ? 'Enjoy personal skincare consultations, birthday tokens, and order tracking.'
            : `We sent a 6-digit verification OTP code to ${email}. Enter it below to activate your account.`}
        </p>
      </div>

      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-10 shadow-xs text-left">
        {step === 'details' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            {/* Row 1: Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Eleanor"
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Vance"
                icon={<User className="w-4 h-4" />}
              />
            </div>

            {/* Row 2: Contact fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Row 3: Security fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Send Verification Code
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C87D55]/20 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#C87D55]/10 text-[#C87D55] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[#1A1A1A]">Check your inbox or spam folder</p>
              <p className="text-[11px] text-[#1A1A1A]/60 break-all font-mono">{email}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-[#1A1A1A]/20 focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55] outline-hidden transition-all bg-white"
                required
              />
              <p className="text-[11px] text-center text-[#1A1A1A]/50">Code expires in 10 minutes</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Change Details
              </button>

              <button
                type="button"
                disabled={timer > 0 || isResending}
                onClick={handleResend}
                className={`flex items-center gap-1.5 font-medium ${timer > 0
                    ? 'text-[#1A1A1A]/40 cursor-not-allowed'
                    : 'text-[#C87D55] hover:underline cursor-pointer'
                  }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                icon={CheckCircle2}
              >
                Verify & Create Account
              </Button>
            </div>
          </form>
        )}

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
