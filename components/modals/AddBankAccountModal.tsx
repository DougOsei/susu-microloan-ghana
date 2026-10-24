'use client';

import React, { useState } from 'react';
import { X, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { BankAccountRecord } from '@/lib/types';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultHolderName: string;
  onSuccess: (newAccount: BankAccountRecord) => void;
}

const GHANA_BANKS = [
  { name: 'GCB Bank PLC', code: '040100' },
  { name: 'Ecobank Ghana', code: '130100' },
  { name: 'Stanbic Bank Ghana', code: '190100' },
  { name: 'Fidelity Bank Ghana', code: '240100' },
  { name: 'Absa Bank Ghana', code: '030100' },
  { name: 'CalBank PLC', code: '140100' },
  { name: 'Zenith Bank Ghana', code: '120100' },
  { name: 'Access Bank Ghana', code: '280100' },
  { name: 'Standard Chartered Bank', code: '020100' },
];

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  defaultHolderName,
  onSuccess,
}) => {
  const [bankName, setBankName] = useState(GHANA_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(defaultHolderName);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!accountNumber || accountNumber.length < 8) {
      setError('Please enter a valid bank account number (at least 8 digits).');
      return;
    }

    const selected = GHANA_BANKS.find((b) => b.name === bankName) || GHANA_BANKS[0];

    setIsLoading(true);
    try {
      const res = await fetch('/api/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bankName: selected.name,
          bankCode: selected.code,
          accountNumber,
          accountHolderName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link bank account.');
      }

      setSuccessMessage(data.message || 'Bank account verified via GhIPSS.');
      onSuccess(data.account);
    } catch (err: any) {
      setError(err.message || 'Bank account registration failed.');
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
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Link Bank Account</h2>
            <p className="text-xs text-emerald-300/70">GhIPSS Interbank Clearing</p>
          </div>
        </div>

        {successMessage ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Bank Account Linked</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Select Bank
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {GHANA_BANKS.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1041130092144"
                className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying with GhIPSS...</span>
                </>
              ) : (
                <span>Register Bank Account</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
