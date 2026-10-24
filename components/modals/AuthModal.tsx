'use client';

import React, { useState } from 'react';
import { X, Smartphone, KeyRound, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { normalizeGhanaPhone, UserProfile } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type AuthStep = 'PHONE' | 'OTP' | 'PIN_SETUP' | 'PIN_LOGIN';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<AuthStep>('PHONE');
  const [phone, setPhone] = useState('+233244123456');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 1: Dispatch OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isValid, normalized } = normalizeGhanaPhone(phone);
      if (!isValid) {
        throw new Error('Please enter a valid Ghanaian mobile number (MTN, Telecel, or AT).');
      }

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send SMS OTP.');
      }

      setPhone(normalized);
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp);
        setOtp(data.debugOtp);
      }
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'SMS dispatch failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setIsRegistered(data.isRegistered);
      if (data.isRegistered) {
        setStep('PIN_LOGIN');
      } else {
        setStep('PIN_SETUP');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3A: PIN Setup (New User)
  const handlePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must consist of 4 numeric digits.');
      }

      const res = await fetch('/api/auth/pin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          fullName: fullName.trim() || 'QuickSave Customer',
          pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'PIN setup failed.');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'PIN setup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3B: PIN Login (Existing User)
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect security PIN.');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#043c2f] to-[#022c22] border border-emerald-600/30 p-5 shadow-2xl relative text-emerald-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center text-emerald-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {step === 'PHONE' ? (
              <Smartphone className="w-5 h-5" />
            ) : step === 'OTP' ? (
              <KeyRound className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {step === 'PHONE'
                ? 'Sign In / Register'
                : step === 'OTP'
                ? 'Enter SMS Code'
                : step === 'PIN_SETUP'
                ? 'Create 4-Digit PIN'
                : 'Enter Security PIN'}
            </h2>
            <p className="text-xs text-emerald-300/70">Bank of Ghana 256-Bit Secure Session</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-3 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER */}
        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Ghanaian Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-3 text-emerald-400/70" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-[10px] text-emerald-400/60 mt-1">
                Accepts MTN MoMo, Telecel Cash, and AT Money numbers.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Dispatching SMS...</span>
              ) : (
                <>
                  <span>Send One-Time Passcode</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-emerald-200/80 leading-relaxed bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/40">
              We sent a 6-digit verification code to <span className="font-mono text-white font-bold">{phone}</span> via Hubtel SMS.
            </p>

            {debugOtp && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-mono">
                Sandbox Demo Code: <span className="font-bold underline">{debugOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1 text-center">
                6-Digit Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2.5 px-3 text-center text-lg font-mono tracking-widest text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="flex-1 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold"
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3A: PIN SETUP */}
        {step === 'PIN_SETUP' && (
          <form onSubmit={handlePinSetup} className="space-y-3.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400/70" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Abena Osei"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Set 4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-amber-400/70" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-base tracking-widest text-center text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-[10px] text-emerald-400/60 mt-1">
                Used to authorize all transactions and disbursements.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Hashing PIN & Securing Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* STEP 3B: PIN LOGIN */}
        {step === 'PIN_LOGIN' && (
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1 text-center">
                Enter 4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-amber-400/70" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2.5 pl-9 pr-3 text-lg tracking-widest text-center text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-[10px] text-emerald-400/60 mt-1 text-center">
                Default demo PIN: <span className="font-bold text-amber-400">1234</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Verifying PIN...' : 'Authorize Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
