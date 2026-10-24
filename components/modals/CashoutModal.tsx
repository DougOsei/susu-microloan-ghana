'use client';

import React, { useState } from 'react';
import { X, ArrowUpRight, Lock, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatGHS, BankAccountRecord } from '@/lib/types';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultPhone: string;
  walletBalancePesewas: number;
  bankAccounts: BankAccountRecord[];
  onSuccess: (newBalancePesewas: number) => void;
}

export const CashoutModal: React.FC<CashoutModalProps> = ({
  isOpen,
  onClose,
  userId,
  defaultPhone,
  walletBalancePesewas,
  bankAccounts,
  onSuccess,
}) => {
  const [destinationType, setDestinationType] = useState<'MOMO' | 'BANK'>('MOMO');
  const [network, setNetwork] = useState<'MTN' | 'Telecel' | 'AT'>('MTN');
  const [phone, setPhone] = useState(defaultPhone);
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [amountGHS, setAmountGHS] = useState<string>('50');
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const maxGHS = walletBalancePesewas / 100;

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsedAmount = parseFloat(amountGHS);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid cashout amount.');
      return;
    }

    if (parsedAmount > maxGHS) {
      setError(`Amount exceeds your available wallet balance of GH₵ ${maxGHS.toFixed(2)}.`);
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('Please enter your 4-digit security PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);
      const res = await fetch('/api/payments/momo/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone,
          amountGHS: parsedAmount,
          network: destinationType === 'BANK' ? 'BANK' : network,
          pin,
          accountNumber: destinationType === 'BANK' ? selectedBank?.accountNumber : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cashout failed.');
      }

      setSuccessMessage(data.message || 'Disbursement executed successfully.');
      if (data.newWalletBalancePesewas !== undefined) {
        onSuccess(data.newWalletBalancePesewas);
      }
    } catch (err: any) {
      setError(err.message || 'Cashout failed.');
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
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Cash Out / Transfer</h2>
            <p className="text-xs text-emerald-300/70">
              Available: <span className="text-amber-300 font-bold">{formatGHS(walletBalancePesewas)}</span>
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-emerald-100">Disbursement Complete</h3>
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
          <form onSubmit={handleCashout} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Destination Toggle */}
            <div className="flex rounded-xl bg-emerald-950/60 p-1 border border-emerald-800/50">
              <button
                type="button"
                onClick={() => setDestinationType('MOMO')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  destinationType === 'MOMO'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-emerald-300/70 hover:text-white'
                }`}
              >
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setDestinationType('BANK')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  destinationType === 'BANK'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-emerald-300/70 hover:text-white'
                }`}
              >
                Bank Account
              </button>
            </div>

            {destinationType === 'MOMO' ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {(['MTN', 'Telecel', 'AT'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setNetwork(net)}
                      className={`py-1.5 text-center rounded-xl text-xs font-bold border transition-all ${
                        network === net
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300/70'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                    Recipient MoMo Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                  Select Registered Bank
                </label>
                {bankAccounts.length === 0 ? (
                  <p className="text-xs text-amber-300/80 p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30">
                    No bank account linked yet. Please link a bank account from the Transfers tab.
                  </p>
                ) : (
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNumber} ({b.accountHolderName})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                  Amount (GH₵)
                </label>
                <button
                  type="button"
                  onClick={() => setAmountGHS(maxGHS.toString())}
                  className="text-[10px] text-amber-400 font-bold hover:underline"
                >
                  Max (GH₵ {maxGHS.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-amber-400">GH₵</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={maxGHS}
                  value={amountGHS}
                  onChange={(e) => setAmountGHS(e.target.value)}
                  className="w-full bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-2 pl-14 pr-3 text-base font-bold text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Security PIN Authorization */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
                4-Digit Security PIN
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
              <p className="text-[10px] text-emerald-400/60 mt-1">Default demo PIN: 1234</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || (destinationType === 'BANK' && bankAccounts.length === 0)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Clearing Transfer Rails...</span>
                </>
              ) : (
                <span>Authorize Cash Out</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
