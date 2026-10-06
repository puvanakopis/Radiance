'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, RefreshCw, ChevronLeft, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const { sendForgotPasswordOtp, resendForgotPasswordOtp, verifyForgotPasswordOtp } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'error', title: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    try {
      await sendForgotPasswordOtp(email.trim());
      setStep('verify');
      setTimer(60);
      setOtp('');
    } catch {
      // Handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      await resendForgotPasswordOtp(email.trim());
      setTimer(60);
    } catch {
      // Handled in AuthContext
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      showToast({ type: 'error', title: 'Please enter the 6-digit verification code' });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ type: 'error', title: 'New password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await verifyForgotPasswordOtp(email.trim(), otp.trim(), newPassword);
      setStep('success');
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
          {step === 'success' ? 'Password Restored' : 'Account Access Recovery'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
          {step === 'request' && 'Reset Password'}
          {step === 'verify' && 'Verify & Set Password'}
          {step === 'success' && 'Reset Complete'}
        </h1>
        <p className="text-xs text-[#1A1A1A]/60 font-light max-w-sm mx-auto">
          {step === 'request' && 'Enter your email address to receive a 6-digit password reset verification code.'}
          {step === 'verify' && `We sent a 6-digit reset code to ${email}. Enter the code and your new passphrase below.`}
          {step === 'success' && 'Your password has been reset securely. You can now sign in to your sanctuary patron profile.'}
        </p>
      </div>

      <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs text-left">
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
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
              Send Reset Code
            </Button>

            <div className="pt-4 border-t border-[#1A1A1A]/10 text-center text-xs text-[#1A1A1A]/60">
              <Link href="/login" className="font-semibold text-[#1A1A1A] hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#C87D55]/20 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#C87D55]/10 text-[#C87D55] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-[#1A1A1A]">Reset code sent</p>
              <p className="text-[11px] text-[#1A1A1A]/60 break-all font-mono">{email}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-2xl py-2.5 rounded-xl border border-[#1A1A1A]/20 focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55] outline-hidden transition-all bg-white"
                required
              />
            </div>

            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              icon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Change Email
              </button>

              <button
                type="button"
                disabled={timer > 0 || isResending}
                onClick={handleResend}
                className={`flex items-center gap-1.5 font-medium ${
                  timer > 0
                    ? 'text-[#1A1A1A]/40 cursor-not-allowed'
                    : 'text-[#C87D55] hover:underline cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
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
                Reset & Save New Password
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#8A9A86]/20 text-[#8A9A86] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A]">Password Successfully Updated</h3>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              Your new password has been established. You can now log into your account with your updated credentials.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="primary" size="md" fullWidth icon={ArrowRight}>
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
