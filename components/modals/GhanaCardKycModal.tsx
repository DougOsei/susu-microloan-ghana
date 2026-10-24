'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, CreditCard, Sparkles } from 'lucide-react';
import { validateGhanaCard } from '@/lib/types';

interface GhanaCardKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  fullName: string;
  currentKycTier: string;
  isAlreadyVerified: boolean;
  onSuccess: (updatedUser: any) => void;
}

export const GhanaCardKycModal: React.FC<GhanaCardKycModalProps> = ({
  isOpen,
  onClose,
  userId,
  fullName,
  currentKycTier,
  isAlreadyVerified,
  onSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('GHA-723910482-1');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formatted = cardNumber.trim().toUpperCase();
    if (!validateGhanaCard(formatted)) {
      setError('Invalid Ghana Card format. Please use format GHA-XXXXXXXXX-X (e.g., GHA-723910482-1).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/kyc/ghana-card/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ghanaCardNumber: formatted,
          fullName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setSuccessMessage(data.message || 'Ghana Card verified with NIA.');
      onSuccess(data);
    } catch (err: any) {
      setError(err.message || 'NIA verification failed.');
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

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Ghana Card NIA Verification</h2>
            <p className="text-xs text-emerald-300/70">Bank of Ghana Tier-2 KYC Compliance</p>
          </div>
        </div>

        {isAlreadyVerified && !successMessage ? (
          <div className="space-y-4 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Tier 2 KYC Fully Verified</h3>
            <p className="text-xs text-emerald-300/90 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              Your identity has been authenticated against the National Identification Authority (NIA) database. You have unlocked maximum credit limits up to GH₵ 5,000.00 and high-yield Susu SafeLock.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Close
            </button>
          </div>
        ) : successMessage ? (
          <div className="space-y-4 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">KYC Verification Successful!</h3>
            <div className="bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/50 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-emerald-400/80">New Status:</span>
                <span className="font-bold text-emerald-300">Tier 2 Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400/80">Credit Line Unlocked:</span>
                <span className="font-bold text-amber-400">GH₵ 5,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400/80">NIA Record ID:</span>
                <span className="font-mono text-emerald-200">{cardNumber}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
              Ghanaian microfinance regulations require all digital loan recipients to link their verified National Identity Card (Ghana Card).
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                disabled
                className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl py-2 px-3 text-xs text-emerald-300 opacity-80"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1.5">
                Ghana Card PIN (GHA-XXXXXXXXX-X)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-amber-400/70" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="GHA-723910482-1"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-xs font-mono uppercase text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-[10px] text-emerald-400/60 mt-1">
                Enter your 9-digit NIA number with check digit.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying with NIA Rails...</span>
                </>
              ) : (
                <span>Verify Ghana Card</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
