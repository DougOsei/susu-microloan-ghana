'use client';

import React, { useState, useEffect } from 'react';
import { X, HandCoins, AlertCircle, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { formatGHS } from '@/lib/types';

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  creditLimitPesewas: number;
  activeLoanBalancePesewas: number;
  kycTier: string;
  onSuccess: (disbursedLoan: any, newBalancePesewas: number, activeLoanPesewas: number) => void;
  onOpenKyc: () => void;
}

export const LoanRequestModal: React.FC<LoanRequestModalProps> = ({
  isOpen,
  onClose,
  userId,
  creditLimitPesewas,
  activeLoanBalancePesewas,
  kycTier,
  onSuccess,
  onOpenKyc,
}) => {
  const maxLimitGHS = creditLimitPesewas / 100;
  const [amountGHS, setAmountGHS] = useState<number>(Math.min(1000, maxLimitGHS));
  const [tenureDays, setTenureDays] = useState<number>(30);
  const [quote, setQuote] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      setError(null);
      try {
        const res = await fetch(`/api/loans?userId=${userId}&quote=true&amount=${amountGHS}&tenure=${tenureDays}`);
        const data = await res.json();
        setQuote(data);
      } catch (err: any) {
        console.error('Quote fetch error:', err);
      } finally {
        setIsLoadingQuote(false);
      }
    };
    fetchQuote();
  }, [isOpen, userId, amountGHS, tenureDays]);

  if (!isOpen) return null;

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amountGHS,
          tenureDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Loan disbursement failed.');
      }

      setSuccessData(data);
      onSuccess(data.loan, data.walletBalancePesewas, data.activeLoanBalancePesewas);
    } catch (err: any) {
      setError(err.message || 'Loan request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#043c2f] to-[#022c22] border border-emerald-600/30 p-5 shadow-2xl relative text-emerald-50 max-h-[92vh] overflow-y-auto">
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
            <h2 className="text-base font-bold text-white">Instant Micro-Credit</h2>
            <p className="text-xs text-emerald-300/70">BoG Act 1052 Statutory Facility</p>
          </div>
        </div>

        {activeLoanBalancePesewas > 0 ? (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-200 text-xs leading-relaxed">
              <p className="font-bold text-amber-300 mb-1">Active Facility In Progress</p>
              You currently have an outstanding facility balance of{' '}
              <span className="font-bold text-white">{formatGHS(activeLoanBalancePesewas)}</span>. Bank of Ghana single-obligation limits require full settlement of active facilities before new disbursements.
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Go to Repayments
            </button>
          </div>
        ) : successData ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Facility Disbursed Instantly!</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              {successData.message}
            </p>
            <p className="text-[11px] text-amber-300/90 font-mono">
              Statutory APR: {successData.loan?.aprDisclosed}% • Due in {successData.loan?.tenureDays} Days
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              View Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleDisburse} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Credit Limit Badge */}
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-xs">
              <div>
                <span className="text-emerald-400/70 block text-[10px] uppercase">Approved Credit Line</span>
                <span className="font-extrabold text-amber-400 text-sm">{formatGHS(creditLimitPesewas)}</span>
              </div>
              {kycTier !== 'TIER_2' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKyc();
                  }}
                  className="text-[10px] text-amber-300 hover:underline font-bold"
                >
                  Upgrade to GH₵ 5,000 &rarr;
                </button>
              )}
            </div>

            {/* Principal Amount Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                  Borrow Amount: <span className="text-amber-400 font-bold text-sm">GH₵ {amountGHS}</span>
                </label>
              </div>
              <input
                type="range"
                min="50"
                max={maxLimitGHS}
                step="50"
                value={amountGHS}
                onChange={(e) => setAmountGHS(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-emerald-400/60 mt-0.5 font-mono">
                <span>GH₵ 50</span>
                <span>GH₵ {maxLimitGHS}</span>
              </div>
            </div>

            {/* Tenure Selection */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                Tenure (Days)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 60, 90].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenureDays(t)}
                    className={`py-1.5 text-center rounded-xl text-xs font-bold border transition-all ${
                      tenureDays === t
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300/70'
                    }`}
                  >
                    {t}d
                  </button>
                ))}
              </div>
            </div>

            {/* Pre-Contract Disclosure Card (Borrowers and Lenders Act 2020) */}
            {quote && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Act 1052 Statutory Disclosure</span>
                </div>
                <div className="flex justify-between text-emerald-300/80">
                  <span>Monthly Interest Rate:</span>
                  <span className="font-semibold text-white">{quote.monthlyInterestRate}% / mo</span>
                </div>
                <div className="flex justify-between text-emerald-300/80">
                  <span>Processing Fee (1.5% statutory):</span>
                  <span className="font-semibold text-white">GH₵ {quote.processingFeeGHS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-300/80">
                  <span>Net Disbursed to Wallet:</span>
                  <span className="font-bold text-amber-400">GH₵ {quote.netDisbursementGHS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-300/80 pt-1 border-t border-emerald-800/40">
                  <span>Total Due on Maturity:</span>
                  <span className="font-bold text-white">GH₵ {quote.totalPayableGHS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400/90 font-mono text-[11px] pt-1 border-t border-emerald-800/40">
                  <span>Statutory APR:</span>
                  <span className="font-bold">{quote.statutoryApr}% p.a.</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoadingQuote || !quote?.isEligible}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Disbursing via Double-Entry Ledger...</span>
                </>
              ) : (
                <span>Accept Terms & Disburse Now</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
