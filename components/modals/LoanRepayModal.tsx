'use client';

import React, { useState } from 'react';
import { X, HandCoins, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatGHS } from '@/lib/types';

interface LoanRepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  loanId: string;
  activeLoanBalancePesewas: number;
  walletBalancePesewas: number;
  onSuccess: (newBalancePesewas: number, remainingLoanPesewas: number) => void;
  onOpenDeposit: () => void;
}

export const LoanRepayModal: React.FC<LoanRepayModalProps> = ({
  isOpen,
  onClose,
  userId,
  loanId,
  activeLoanBalancePesewas,
  walletBalancePesewas,
  onSuccess,
  onOpenDeposit,
}) => {
  const [amountGHS, setAmountGHS] = useState<string>((activeLoanBalancePesewas / 100).toString());
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const dueGHS = activeLoanBalancePesewas / 100;
  const walletGHS = walletBalancePesewas / 100;

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsed = parseFloat(amountGHS);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid repayment amount.');
      return;
    }

    if (parsed > walletGHS) {
      setError(`Insufficient wallet funds (GH₵ ${walletGHS.toFixed(2)}). Please deposit to wallet first.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/loans/repay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          loanId,
          amountGHS: parsed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Repayment failed.');
      }

      setSuccessMessage(data.message || 'Repayment successful.');
      onSuccess(data.walletBalancePesewas, data.activeLoanBalancePesewas);
    } catch (err: any) {
      setError(err.message || 'Loan repayment failed.');
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
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Repay Facility</h2>
            <p className="text-xs text-emerald-300/70">
              Outstanding: <span className="font-bold text-amber-400">{formatGHS(activeLoanBalancePesewas)}</span>
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Repayment Processed</h3>
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
          <form onSubmit={handleRepay} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-xs">
              <span className="text-emerald-400/70">Wallet Available:</span>
              <span className="font-bold text-white">{formatGHS(walletBalancePesewas)}</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                  Repayment Amount (GH₵)
                </label>
                <button
                  type="button"
                  onClick={() => setAmountGHS(dueGHS.toString())}
                  className="text-[10px] text-amber-400 font-bold hover:underline"
                >
                  Full Settlement (GH₵ {dueGHS.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-amber-400">GH₵</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={dueGHS}
                  value={amountGHS}
                  onChange={(e) => setAmountGHS(e.target.value)}
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-14 pr-3 text-base font-bold text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {walletGHS < dueGHS && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold"
              >
                + Deposit to Wallet via MoMo
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || walletGHS === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Settling Ledger Accounts...</span>
                </>
              ) : (
                <span>Confirm Repayment</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
