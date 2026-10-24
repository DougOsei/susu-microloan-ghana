'use client';

import React, { useState } from 'react';
import { X, Smartphone, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatGHS } from '@/lib/types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultPhone: string;
  onSuccess: (newBalancePesewas: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  userId,
  defaultPhone,
  onSuccess,
}) => {
  const [network, setNetwork] = useState<'MTN' | 'Telecel' | 'AT'>('MTN');
  const [phone, setPhone] = useState(defaultPhone);
  const [amountGHS, setAmountGHS] = useState<string>('50');
  const [isLoading, setIsLoading] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPills = [20, 50, 100, 200, 500];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPromptMessage(null);

    const parsedAmount = parseFloat(amountGHS);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid deposit amount (min GH₵ 1.00).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/payments/momo/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone,
          amountGHS: parsedAmount,
          network,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate deposit.');
      }

      setPromptMessage(data.ussdPromptInstructions || 'USSD prompt dispatched to your phone.');
      if (data.newWalletBalancePesewas !== undefined) {
        onSuccess(data.newWalletBalancePesewas);
      }
    } catch (err: any) {
      setError(err.message || 'Deposit initiation failed.');
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
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Deposit to Wallet</h2>
            <p className="text-xs text-emerald-300/70">Instant Mobile Money Cash-In</p>
          </div>
        </div>

        {promptMessage ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">USSD Approval Sent</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              {promptMessage}
            </p>
            <p className="text-[11px] text-amber-300/80">
              Your double-entry ledger wallet balance has been updated instantly.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Network Selector */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1.5">
                Select Network
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'MTN', label: 'MTN MoMo', color: 'border-yellow-400/50 bg-yellow-500/10 text-yellow-300' },
                  { id: 'Telecel', label: 'Telecel', color: 'border-red-400/50 bg-red-500/10 text-red-300' },
                  { id: 'AT', label: 'AT Money', color: 'border-blue-400/50 bg-blue-500/10 text-blue-300' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNetwork(item.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      network === item.id
                        ? `${item.color} ring-1 ring-amber-400`
                        : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300/70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1.5">
                MoMo Wallet Phone Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-3 text-emerald-400/60" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233244123456"
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1.5">
                Deposit Amount (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-amber-400">GH₵</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amountGHS}
                  onChange={(e) => setAmountGHS(e.target.value)}
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-14 pr-3 text-base font-bold text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Quick Pills */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {quickPills.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountGHS(val.toString())}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                      amountGHS === val.toString()
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300/80 hover:bg-emerald-800/40'
                    }`}
                  >
                    +GH₵ {val}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting MoMo Rails...</span>
                </>
              ) : (
                <span>Prompt USSD Approval</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
