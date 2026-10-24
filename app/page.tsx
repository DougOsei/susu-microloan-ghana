'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PiggyBank,
  HandCoins,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Building,
  Smartphone,
  ChevronRight,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, JournalEntryRecord, SusuPlanRecord, LoanRecord, BankAccountRecord, formatGHS } from '@/lib/types';
import { AppPreloader } from '@/components/AppPreloader';
import { Header } from '@/components/Header';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { WalletSkeleton } from '@/components/skeletons/WalletSkeleton';
import { LoanSkeleton } from '@/components/skeletons/LoanSkeleton';
import { SusuSkeleton } from '@/components/skeletons/SusuSkeleton';
import { TransactionsSkeleton } from '@/components/skeletons/TransactionsSkeleton';
import { DepositModal } from '@/components/modals/DepositModal';
import { CashoutModal } from '@/components/modals/CashoutModal';
import { GhanaCardKycModal } from '@/components/modals/GhanaCardKycModal';
import { AddBankAccountModal } from '@/components/modals/AddBankAccountModal';
import { LoanRequestModal } from '@/components/modals/LoanRequestModal';
import { LoanRepayModal } from '@/components/modals/LoanRepayModal';
import { SusuContributeModal } from '@/components/modals/SusuContributeModal';
import { SusuLiquidateModal } from '@/components/modals/SusuLiquidateModal';
import { AuthModal } from '@/components/modals/AuthModal';

export default function AppHome() {
  // Preloader State
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Core Domain State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [susuPlans, setSusuPlans] = useState<SusuPlanRecord[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRecord[]>([]);
  const [transactions, setTransactions] = useState<JournalEntryRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals Visibility
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isLoanRequestOpen, setIsLoanRequestOpen] = useState(false);
  const [isLoanRepayOpen, setIsLoanRepayOpen] = useState(false);
  const [isSusuContributeOpen, setIsSusuContributeOpen] = useState(false);
  const [isSusuLiquidateOpen, setIsSusuLiquidateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch initial domain session
  const refreshUserData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (sessionData.user) {
        setUser(sessionData.user);
        const userId = sessionData.user.id;

        const [susuRes, loansRes, banksRes, txsRes] = await Promise.all([
          fetch(`/api/susu?userId=${userId}`),
          fetch(`/api/loans?userId=${userId}`),
          fetch(`/api/bank?userId=${userId}`),
          fetch(`/api/transactions?userId=${userId}`),
        ]);

        const susuData = await susuRes.json();
        const loansData = await loansRes.json();
        const banksData = await banksRes.json();
        const txsData = await txsRes.json();

        setSusuPlans(susuData.plans || []);
        setLoans(loansData.loans || []);
        setBankAccounts(banksData.accounts || []);
        setTransactions(txsData.transactions || []);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setIsAuthOpen(true);
  };

  const activeLoan = loans.find((l) => l.status === 'DISBURSED');
  const activeSusu = susuPlans[0] || null;

  return (
    <>
      {/* Milestone 1: Brand Pre-loader & Splash Screen */}
      {isPreloaderActive && (
        <AppPreloader onComplete={() => setIsPreloaderActive(false)} minDurationMs={1600} />
      )}

      {/* App Header */}
      <Header
        user={user}
        onOpenKyc={() => setIsKycOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Screen Container */}
      <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
        {isLoadingData ? (
          <div className="space-y-4">
            <WalletSkeleton />
            <LoanSkeleton />
            <SusuSkeleton />
            <TransactionsSkeleton />
          </div>
        ) : !user ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center mx-auto text-amber-400">
              <LogOut className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white">QuickSave Ghana Session</h2>
            <p className="text-xs text-emerald-300/80 max-w-xs mx-auto">
              Please sign in with your Ghanaian mobile number or register a new microfinance account.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              Sign In / Register
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: WALLET / HOME */}
            {currentTab === 'home' && (
              <div className="space-y-5">
                {/* Wallet Balance Card */}
                <div className="w-full rounded-2xl p-6 glass-card-gold border border-amber-500/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">
                      Available Cash Balance
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Double-Entry ACID
                    </span>
                  </div>

                  <div className="text-3xl font-black text-white tracking-tight mb-1">
                    {formatGHS(user.walletBalancePesewas)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-300/70 mb-5">
                    <span>Ghanaian Pesewas:</span>
                    <span className="font-mono text-amber-300/90 font-bold">
                      {user.walletBalancePesewas.toLocaleString()} Ps
                    </span>
                  </div>

                  {/* 4 Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-emerald-700/40">
                    <button
                      onClick={() => setIsDepositOpen(true)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-800/40 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-600/20">
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-100">Deposit</span>
                    </button>

                    <button
                      onClick={() => setIsCashoutOpen(true)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-800/40 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-200 shadow-md">
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-100">Cash Out</span>
                    </button>

                    <button
                      onClick={() => setIsSusuContributeOpen(true)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-800/40 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-amber-400 shadow-md">
                        <PiggyBank className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-100">Susu Lock</span>
                    </button>

                    <button
                      onClick={() => (activeLoan ? setIsLoanRepayOpen(true) : setIsLoanRequestOpen(true))}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-800/40 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-amber-400 shadow-md">
                        <HandCoins className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-100">
                        {activeLoan ? 'Repay' : 'Borrow'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Active Loan Warning Card (If active loan exists) */}
                {activeLoan && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Active Facility Due in 15 Days</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {formatGHS(activeLoan.balanceRemainingPesewas)}
                      </span>
                    </div>
                    <div className="w-full bg-emerald-950/80 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-1/2" />
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="text-emerald-300/70">Act 1052 Statutory Facility</span>
                      <button
                        onClick={() => setIsLoanRepayOpen(true)}
                        className="text-amber-400 font-bold hover:underline"
                      >
                        Repay Now &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Susu Vault Overview */}
                {activeSusu && (
                  <div
                    onClick={() => setCurrentTab('susu')}
                    className="p-4 rounded-2xl glass-panel border border-emerald-700/30 hover:border-amber-400/40 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center text-amber-400">
                          <PiggyBank className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{activeSusu.title}</h3>
                          <p className="text-[10px] text-emerald-400/80">12% Compounding Annual Yield</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        {formatGHS(activeSusu.currentAmountPesewas)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                        <span className="text-[10px] text-emerald-400/70 block">Target Lock</span>
                        <span className="font-bold text-white">
                          {formatGHS(activeSusu.targetAmountPesewas)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                        <span className="text-[10px] text-emerald-400/70 block">Accrued Yield</span>
                        <span className="font-bold text-amber-300">
                          +{formatGHS(activeSusu.accruedYieldPesewas)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Ledger Entries */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300/80">
                      Recent Ledger Postings
                    </h3>
                    <span className="text-[10px] text-emerald-400/60 font-mono">Immutable</span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-emerald-400/60 rounded-xl glass-panel">
                      No recent ledger postings. Make a deposit to begin.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl glass-panel border border-emerald-800/30 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.transactionType === 'DEPOSIT' || tx.transactionType === 'LOAN_DISBURSEMENT'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-800/40 text-emerald-300'
                              }`}
                            >
                              {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'LOAN_DISBURSEMENT' ? (
                                <ArrowDownRight className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white tracking-tight">{tx.description}</p>
                              <p className="text-[10px] text-emerald-400/60 font-mono">
                                {new Date(tx.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                • {tx.reference.substring(0, 16)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              tx.transactionType === 'DEPOSIT' || tx.transactionType === 'LOAN_DISBURSEMENT'
                                ? 'text-amber-400'
                                : 'text-emerald-200'
                            }`}
                          >
                            {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'LOAN_DISBURSEMENT'
                              ? '+'
                              : '-'}
                            {formatGHS(tx.amountPesewas)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SUSU VAULT */}
            {currentTab === 'susu' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl glass-card-gold border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="text-base font-bold text-white">Daily Susu & SafeLock</h2>
                      <p className="text-xs text-emerald-300/80">Traditional Ghanaian Thrift Meets DeFi Yield</p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed pt-1">
                    Lock daily contributions with automatic daily compound yield (12% per annum). SafeLocks have a minimum 90-day tenure to enforce savings discipline.
                  </p>
                </div>

                {activeSusu && (
                  <div className="p-4 rounded-2xl glass-panel border border-emerald-700/40 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          Active SafeLock
                        </span>
                        <h3 className="text-base font-bold text-white">{activeSusu.title}</h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                        {activeSusu.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/50 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Current Locked:</span>
                        <span className="font-extrabold text-white text-sm">
                          {formatGHS(activeSusu.currentAmountPesewas)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Target Amount:</span>
                        <span className="font-bold text-emerald-200">
                          {formatGHS(activeSusu.targetAmountPesewas)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Accrued Compound Yield:</span>
                        <span className="font-bold text-amber-400">
                          +{formatGHS(activeSusu.accruedYieldPesewas)} (12% p.a.)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Scheduled Maturity:</span>
                        <span className="font-mono text-emerald-300">
                          {new Date(activeSusu.maturityDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsSusuContributeOpen(true)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                      >
                        + Lock Daily Contribution
                      </button>
                      <button
                        onClick={() => setIsSusuLiquidateOpen(true)}
                        className="py-2.5 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold"
                      >
                        Break Lock
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-300/80 space-y-1.5">
                  <p className="font-bold text-amber-300">Bank of Ghana SafeLock Rule</p>
                  <p className="text-[11px] leading-relaxed">
                    Under Ghanaian microfinance regulations, early liquidations before the 90-day maturity date will forfeit all accrued compound interest and incur a 2.0% administrative liquidation fee.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: MICRO-LOANS */}
            {currentTab === 'loans' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl glass-card-gold border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <HandCoins className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="text-base font-bold text-white">Micro-Credit Facility</h2>
                      <p className="text-xs text-emerald-300/80">Borrowers and Lenders Act, 2020 (Act 1052)</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-[10px] text-emerald-400/70 block uppercase">
                        Eligible Credit Limit
                      </span>
                      <span className="text-2xl font-black text-amber-400">
                        {formatGHS(user.creditLimitPesewas)}
                      </span>
                    </div>
                    {user.kycTier !== 'TIER_2' ? (
                      <button
                        onClick={() => setIsKycOpen(true)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-sm hover:bg-amber-400"
                      >
                        Unlock GH₵ 5,000
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/30">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Tier 2 Max</span>
                      </span>
                    )}
                  </div>
                </div>

                {activeLoan ? (
                  <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-300">Active Outstanding Facility</span>
                      <span className="text-xs font-mono font-bold text-white">
                        {formatGHS(activeLoan.balanceRemainingPesewas)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/50 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Original Principal:</span>
                        <span className="font-semibold">{formatGHS(activeLoan.principalPesewas)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Monthly Rate:</span>
                        <span className="font-semibold">{activeLoan.monthlyRate}% / month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Statutory APR:</span>
                        <span className="font-mono text-amber-400">{activeLoan.aprDisclosed}% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">Due Date:</span>
                        <span className="font-mono text-emerald-200">
                          {new Date(activeLoan.dueAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsLoanRepayOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                    >
                      Settle Repayment
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoanRequestOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <HandCoins className="w-5 h-5" />
                    <span>Apply for Instant Micro-Loan</span>
                  </button>
                )}

                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300/80 space-y-1 font-mono">
                  <p className="font-bold text-white">Statutory Disclosures:</p>
                  <p>• Statutory processing fee: 1.5% deducted at disbursement</p>
                  <p>• Monthly interest: 3.8% (Tier-2 with active Susu discipline)</p>
                  <p>• Disbursed directly into your QuickSave double-entry wallet</p>
                </div>
              </div>
            )}

            {/* TAB 4: MOMO & BANK */}
            {currentTab === 'transfers' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl glass-panel border border-emerald-700/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Registered Mobile Money Rails
                    </h3>
                    <span className="text-[10px] text-amber-400 font-bold">Paystack & Hubtel</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'MTN Mobile Money', phone: user.phone, network: 'MTN', color: 'bg-yellow-500/20 text-yellow-300' },
                      { name: 'Telecel Cash', phone: user.phone, network: 'Telecel', color: 'bg-red-500/20 text-red-300' },
                      { name: 'AT Money', phone: user.phone, network: 'AT', color: 'bg-blue-500/20 text-blue-300' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-emerald-400/70 font-mono">{item.phone}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-emerald-700/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Linked GhIPSS Bank Accounts
                    </h3>
                    <button
                      onClick={() => setIsAddBankOpen(true)}
                      className="text-[11px] text-amber-400 font-bold hover:underline"
                    >
                      + Link Bank
                    </button>
                  </div>

                  {bankAccounts.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 text-center text-xs text-emerald-400/60">
                      No bank account linked yet. Link a bank account for direct GhIPSS settlement.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bankAccounts.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Building className="w-4 h-4 text-amber-400" />
                            <div>
                              <span className="font-bold text-white block">{b.bankName}</span>
                              <span className="text-[10px] text-emerald-400/70 font-mono">
                                {b.accountNumber} ({b.accountHolderName})
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-600/40">
                            GhIPSS Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                  >
                    Deposit MoMo
                  </button>
                  <button
                    onClick={() => setIsCashoutOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/40 text-emerald-100 font-bold text-xs uppercase tracking-wider"
                  >
                    Cash Out
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: PROFILE & SECURITY */}
            {currentTab === 'profile' && (
              <div className="space-y-4">
                {/* Ghana Card KYC Status */}
                <div className="p-4 rounded-2xl glass-panel border border-emerald-700/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="text-xs font-bold text-white">Ghana Card Identity Verification</h3>
                        <p className="text-[10px] text-emerald-400/80">National Identification Authority</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.ghanaCardVerified
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {user.ghanaCardVerified ? 'Tier 2 Verified' : 'Action Required'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">Ghana Card ID:</span>
                      <span className="font-mono text-white font-bold">
                        {user.ghanaCardNumber || 'Not submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">Credit Limit:</span>
                      <span className="font-bold text-amber-400">{formatGHS(user.creditLimitPesewas)}</span>
                    </div>
                  </div>

                  {!user.ghanaCardVerified && (
                    <button
                      onClick={() => setIsKycOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider"
                    >
                      Verify Ghana Card Now
                    </button>
                  )}
                </div>

                {/* Account Details */}
                <div className="p-4 rounded-2xl glass-panel border border-emerald-700/40 space-y-2 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300/80 mb-2">
                    Client Security Information
                  </h3>
                  <div className="flex justify-between py-1.5 border-b border-emerald-800/30">
                    <span className="text-emerald-400/70">Phone Number:</span>
                    <span className="font-mono text-white">{user.phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-emerald-800/30">
                    <span className="text-emerald-400/70">Security PIN:</span>
                    <span className="font-mono text-white">•••• (Argon2id/Bcrypt Hashed)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-emerald-400/70">Platform License:</span>
                    <span className="text-emerald-300 font-bold">BoG Tier-3 Digital Microfinance</span>
                  </div>
                </div>

                {/* Switch Account / Log Out Button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out / Switch Account</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Interactive Modals */}
      {user && (
        <>
          <DepositModal
            isOpen={isDepositOpen}
            onClose={() => setIsDepositOpen(false)}
            userId={user.id}
            defaultPhone={user.phone}
            onSuccess={(newBalance) => {
              setUser({ ...user, walletBalancePesewas: newBalance });
              refreshUserData();
            }}
          />

          <CashoutModal
            isOpen={isCashoutOpen}
            onClose={() => setIsCashoutOpen(false)}
            userId={user.id}
            defaultPhone={user.phone}
            walletBalancePesewas={user.walletBalancePesewas}
            bankAccounts={bankAccounts}
            onSuccess={(newBalance) => {
              setUser({ ...user, walletBalancePesewas: newBalance });
              refreshUserData();
            }}
          />

          <GhanaCardKycModal
            isOpen={isKycOpen}
            onClose={() => setIsKycOpen(false)}
            userId={user.id}
            fullName={user.fullName}
            currentKycTier={user.kycTier}
            isAlreadyVerified={user.ghanaCardVerified}
            onSuccess={(updated) => {
              setUser({
                ...user,
                kycTier: 'TIER_2',
                ghanaCardVerified: true,
                ghanaCardNumber: updated.ghanaCardNumber,
                creditLimitPesewas: updated.unlockedCreditLimitPesewas || 500_000,
              });
              refreshUserData();
            }}
          />

          <AddBankAccountModal
            isOpen={isAddBankOpen}
            onClose={() => setIsAddBankOpen(false)}
            userId={user.id}
            defaultHolderName={user.fullName}
            onSuccess={(newAcc) => {
              setBankAccounts([...bankAccounts, newAcc]);
              refreshUserData();
            }}
          />

          <LoanRequestModal
            isOpen={isLoanRequestOpen}
            onClose={() => setIsLoanRequestOpen(false)}
            userId={user.id}
            creditLimitPesewas={user.creditLimitPesewas}
            activeLoanBalancePesewas={user.activeLoanBalancePesewas}
            kycTier={user.kycTier}
            onSuccess={(newLoan, newBalance, activeBalance) => {
              setUser({
                ...user,
                walletBalancePesewas: newBalance,
                activeLoanBalancePesewas: activeBalance,
              });
              setLoans([newLoan, ...loans]);
              refreshUserData();
            }}
            onOpenKyc={() => setIsKycOpen(true)}
          />

          <LoanRepayModal
            isOpen={isLoanRepayOpen}
            onClose={() => setIsLoanRepayOpen(false)}
            userId={user.id}
            loanId={activeLoan?.id || ''}
            activeLoanBalancePesewas={user.activeLoanBalancePesewas}
            walletBalancePesewas={user.walletBalancePesewas}
            onSuccess={(newBalance, remainingLoan) => {
              setUser({
                ...user,
                walletBalancePesewas: newBalance,
                activeLoanBalancePesewas: remainingLoan,
              });
              refreshUserData();
            }}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />

          <SusuContributeModal
            isOpen={isSusuContributeOpen}
            onClose={() => setIsSusuContributeOpen(false)}
            userId={user.id}
            planId={activeSusu?.id || ''}
            walletBalancePesewas={user.walletBalancePesewas}
            onSuccess={(newWallet, newVault) => {
              setUser({
                ...user,
                walletBalancePesewas: newWallet,
                susuVaultPesewas: newVault,
              });
              refreshUserData();
            }}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />

          <SusuLiquidateModal
            isOpen={isSusuLiquidateOpen}
            onClose={() => setIsSusuLiquidateOpen(false)}
            userId={user.id}
            plan={activeSusu}
            onSuccess={(newWallet, newVault) => {
              setUser({
                ...user,
                walletBalancePesewas: newWallet,
                susuVaultPesewas: newVault,
              });
              refreshUserData();
            }}
          />
        </>
      )}

      {/* Sign-In / Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          refreshUserData();
        }}
      />
    </>
  );
}
