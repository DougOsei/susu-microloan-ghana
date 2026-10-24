'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatGHS, SusuPlanRecord } from '@/lib/types';

interface SusuLiquidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  plan: SusuPlanRecord | null;
  onSuccess: (newWalletPesewas: number, newVaultPesewas: number) => void;
}

export const SusuLiquidateModal: React.FC<SusuLiquidateModalProps> = ({
  isOpen,
  onClose,
  userId,
  plan,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const isEarly = new Date() < new Date(plan.maturityDate);
  const principalPesewas = plan.currentAmountPesewas;
  const earlyFeePesewas = Math.round(principalPesewas * 0.02);
  const estimatedReturnPesewas = isEarly ? principalPesewas - earlyFeePesewas : principalPesewas + plan.accruedYieldPesewas;

  const handleLiquidate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/susu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'liquidate',
          userId,
          planId: plan.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Liquidation failed.');
      }

      setSuccessMessage(data.message);
      onSuccess(data.walletBalancePesewas, data.susuVaultPesewas);
    } catch (err: any) {
      setError(err.message || 'Liquidation failed.');
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
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {isEarly ? 'Early SafeLock Break' : 'Matured SafeLock Payout'}
            </h2>
            <p className="text-xs text-emerald-300/70">{plan.title}</p>
          </div>
        </div>

        {successMessage ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Liquidation Complete</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Back to Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {isEarly ? (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 space-y-2 text-xs">
                <p className="font-bold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Early Liquidation Penalty Notice</span>
                </p>
                <p className="text-red-200/90 leading-relaxed">
                  This SafeLock has not reached its scheduled maturity date (
                  {new Date(plan.maturityDate).toLocaleDateString('en-GB')}). Breaking early invokes the statutory Bank of Ghana microfinance early penalty:
                </p>
                <ul className="list-disc list-inside text-red-200/80 space-y-1 font-mono text-[11px]">
                  <li>Forfeit all accrued yield ({formatGHS(plan.accruedYieldPesewas)})</li>
                  <li>2.0% Administrative break fee: {formatGHS(earlyFeePesewas)}</li>
                  <li>Net returned to wallet: {formatGHS(estimatedReturnPesewas)}</li>
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-xs space-y-1.5">
                <p className="font-bold text-emerald-300">SafeLock Reached Full Maturity!</p>
                <div className="flex justify-between text-emerald-200">
                  <span>Principal:</span>
                  <span className="font-bold">{formatGHS(principalPesewas)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>12% Compound Yield:</span>
                  <span className="font-bold">+{formatGHS(plan.accruedYieldPesewas)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-emerald-700/50">
                  <span>Total Payout:</span>
                  <span>{formatGHS(estimatedReturnPesewas)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold"
              >
                Keep Locked
              </button>
              <button
                type="button"
                onClick={handleLiquidate}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isEarly ? 'Confirm Break' : 'Liquidate to Wallet'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
