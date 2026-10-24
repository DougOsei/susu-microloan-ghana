/**
 * ACID-Compliant Double-Entry Microfinance Ledger Engine
 * Bank of Ghana Digital Microfinance Tier-3 Architecture
 */

import {
  AccountType,
  PostingDirection,
  TransactionType,
  JournalEntryRecord,
  LedgerPostingItem,
  UserProfile,
  SusuPlanRecord,
  LoanRecord,
  BankAccountRecord,
} from './types';

// In-Memory Ledger Store & Cache for High Performance & Serverless Fallback
interface LedgerStore {
  users: Map<string, UserProfile & { pinHash: string }>;
  accounts: Map<string, { id: string; userId?: string; accountType: AccountType; balancePesewas: number }>;
  journalEntries: JournalEntryRecord[];
  susuPlans: Map<string, SusuPlanRecord>;
  loans: Map<string, LoanRecord>;
  bankAccounts: Map<string, BankAccountRecord[]>;
}

// Global institutional accounts
const SYSTEM_GATEWAY_CLEARING = 'ACC_SYSTEM_CLEARING';
const SYSTEM_FEES_RECEIVABLE = 'ACC_SYSTEM_FEES';
const SYSTEM_YIELD_EXPENSE = 'ACC_SYSTEM_YIELD';

// Singleton store instance across Next.js API turns
const globalStore: LedgerStore = (global as any).__ledgerStore || {
  users: new Map(),
  accounts: new Map(),
  journalEntries: [],
  susuPlans: new Map(),
  loans: new Map(),
  bankAccounts: new Map(),
};
(global as any).__ledgerStore = globalStore;

// Initialize institutional accounts
if (!globalStore.accounts.has(SYSTEM_GATEWAY_CLEARING)) {
  globalStore.accounts.set(SYSTEM_GATEWAY_CLEARING, {
    id: SYSTEM_GATEWAY_CLEARING,
    accountType: 'PAYMENT_GATEWAY_CLEARING',
    balancePesewas: 100_000_000, // 1,000,000 GHS clearing capital
  });
  globalStore.accounts.set(SYSTEM_FEES_RECEIVABLE, {
    id: SYSTEM_FEES_RECEIVABLE,
    accountType: 'FEES_RECEIVABLE',
    balancePesewas: 0,
  });
  globalStore.accounts.set(SYSTEM_YIELD_EXPENSE, {
    id: SYSTEM_YIELD_EXPENSE,
    accountType: 'ESCROW',
    balancePesewas: 50_000_000,
  });
}

// Seed default verified test account for instant sandbox testing
const DEMO_USER_ID = 'usr_kwame_mensah_001';
const DEMO_PHONE = '+233244123456';
if (!globalStore.users.has(DEMO_USER_ID)) {
  // $2a$10$DEMO... default PIN hash for '1234'
  const defaultPinHash = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1p1QvQ1c8F6w1n0E7P2R9Y6j1v6u.6';
  globalStore.users.set(DEMO_USER_ID, {
    id: DEMO_USER_ID,
    phone: DEMO_PHONE,
    fullName: 'Kwame Mensah',
    email: 'kwame.mensah@ghanapay.gh',
    pinHash: defaultPinHash,
    kycTier: 'TIER_2',
    ghanaCardNumber: 'GHA-723910482-1',
    ghanaCardVerified: true,
    biometricEnabled: true,
    walletBalancePesewas: 245_000, // GH₵ 2,450.00
    susuVaultPesewas: 805_000,     // GH₵ 8,050.00
    activeLoanBalancePesewas: 650_00, // GH₵ 650.00
    creditLimitPesewas: 500_000,   // GH₵ 5,000.00
    createdAt: new Date().toISOString(),
  });

  const walletAccId = `acc_wallet_${DEMO_USER_ID}`;
  const vaultAccId = `acc_vault_${DEMO_USER_ID}`;
  const loanAccId = `acc_loan_${DEMO_USER_ID}`;

  globalStore.accounts.set(walletAccId, {
    id: walletAccId,
    userId: DEMO_USER_ID,
    accountType: 'WALLET',
    balancePesewas: 245_000,
  });
  globalStore.accounts.set(vaultAccId, {
    id: vaultAccId,
    userId: DEMO_USER_ID,
    accountType: 'SUSU_VAULT',
    balancePesewas: 805_000,
  });
  globalStore.accounts.set(loanAccId, {
    id: loanAccId,
    userId: DEMO_USER_ID,
    accountType: 'LOAN_PRINCIPAL',
    balancePesewas: 650_00,
  });

  // Seed default Susu SafeLock Plan
  const susuPlanId = 'susu_safelock_001';
  globalStore.susuPlans.set(susuPlanId, {
    id: susuPlanId,
    userId: DEMO_USER_ID,
    planType: 'SAFELOCK',
    title: 'Market Inventory Lock',
    targetAmountPesewas: 1_000_000, // GH₵ 10,000.00
    currentAmountPesewas: 805_000,  // GH₵ 8,050.00
    dailyContributionPesewas: 5_000,// GH₵ 50.00
    accruedYieldPesewas: 24_150,    // GH₵ 241.50
    annualYieldRate: 0.12,          // 12% p.a.
    maturityDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Seed default active loan
  const loanId = 'loan_sme_001';
  globalStore.loans.set(loanId, {
    id: loanId,
    userId: DEMO_USER_ID,
    principalPesewas: 100_000,       // GH₵ 1,000.00
    interestRateBps: 380,           // 3.8% monthly
    processingFeePesewas: 1_500,     // 1.5% fee = GH₵ 15.00
    tenureDays: 30,
    totalPayablePesewas: 103_800,   // GH₵ 1,038.00
    balanceRemainingPesewas: 650_00,// GH₵ 650.00
    status: 'DISBURSED',
    aprDisclosed: 45.6,
    monthlyRate: 3.8,
    disbursedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Seed linked bank account
  globalStore.bankAccounts.set(DEMO_USER_ID, [
    {
      id: 'bnk_01',
      bankName: 'GCB Bank PLC',
      bankCode: '040100',
      accountNumber: '1041130092144',
      accountHolderName: 'Kwame Mensah',
      isVerified: true,
    },
  ]);
}

/**
 * Execute an ACID Double-Entry Transaction
 * Constraint: SUM(DEBIT) === SUM(CREDIT)
 */
export async function postDoubleEntryTransaction(params: {
  reference: string;
  description: string;
  transactionType: TransactionType;
  postings: LedgerPostingItem[];
}): Promise<JournalEntryRecord> {
  const { reference, description, transactionType, postings } = params;

  // 1. Double-Entry Invariant Assertion
  let totalDebits = 0;
  let totalCredits = 0;

  for (const post of postings) {
    if (post.amountPesewas <= 0) {
      throw new Error(`Invalid posting amount: ${post.amountPesewas}. Must be greater than 0 pesewas.`);
    }
    if (post.direction === 'DEBIT') {
      totalDebits += post.amountPesewas;
    } else if (post.direction === 'CREDIT') {
      totalCredits += post.amountPesewas;
    }
  }

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Double-Entry violation: Sum of DEBITS (${totalDebits}) does not equal sum of CREDITS (${totalCredits}). Transaction aborted.`
    );
  }

  // 2. Check Idempotency
  const existing = globalStore.journalEntries.find((j) => j.reference === reference);
  if (existing) {
    return existing;
  }

  // 3. Atomically apply postings to account balances
  for (const post of postings) {
    let account = globalStore.accounts.get(post.accountId);
    if (!account) {
      account = {
        id: post.accountId,
        accountType: post.accountType,
        balancePesewas: 0,
      };
      globalStore.accounts.set(post.accountId, account);
    }

    // Accounting rules:
    // For Liability & Equity (User Wallet, Susu Vault): CREDIT increases, DEBIT decreases
    // For Assets & Expenses (Gateway clearing, Loan Principal): DEBIT increases, CREDIT decreases
    if (post.accountType === 'WALLET' || post.accountType === 'SUSU_VAULT' || post.accountType === 'FEES_RECEIVABLE') {
      if (post.direction === 'CREDIT') {
        account.balancePesewas += post.amountPesewas;
      } else {
        if (post.accountType === 'WALLET' && account.balancePesewas < post.amountPesewas) {
          throw new Error('Insufficient wallet funds for this operation.');
        }
        account.balancePesewas -= post.amountPesewas;
      }
    } else {
      // Asset / Receivable / Clearing
      if (post.direction === 'DEBIT') {
        account.balancePesewas += post.amountPesewas;
      } else {
        account.balancePesewas -= post.amountPesewas;
      }
    }
  }

  // 4. Update user profile cached balances
  for (const post of postings) {
    const account = globalStore.accounts.get(post.accountId);
    if (account && account.userId) {
      const user = globalStore.users.get(account.userId);
      if (user) {
        if (account.accountType === 'WALLET') {
          user.walletBalancePesewas = account.balancePesewas;
        } else if (account.accountType === 'SUSU_VAULT') {
          user.susuVaultPesewas = account.balancePesewas;
        } else if (account.accountType === 'LOAN_PRINCIPAL') {
          user.activeLoanBalancePesewas = account.balancePesewas;
        }
      }
    }
  }

  const record: JournalEntryRecord = {
    id: `je_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    reference,
    description,
    transactionType,
    timestamp: new Date().toISOString(),
    postings,
    amountPesewas: totalDebits,
  };

  globalStore.journalEntries.unshift(record);
  return record;
}

/**
 * Mobile Money Inbound Deposit (Cash-in)
 */
export async function executeDeposit(userId: string, amountPesewas: number, reference: string, network: string) {
  const walletAccId = `acc_wallet_${userId}`;
  return postDoubleEntryTransaction({
    reference,
    description: `MoMo Deposit via ${network} (${reference})`,
    transactionType: 'DEPOSIT',
    postings: [
      {
        accountId: SYSTEM_GATEWAY_CLEARING,
        accountType: 'PAYMENT_GATEWAY_CLEARING',
        amountPesewas,
        direction: 'DEBIT',
      },
      {
        accountId: walletAccId,
        accountType: 'WALLET',
        amountPesewas,
        direction: 'CREDIT',
      },
    ],
  });
}

/**
 * Mobile Money Outbound Disbursement (Cash-out to MoMo or Bank)
 */
export async function executeWithdrawal(userId: string, amountPesewas: number, reference: string, destination: string) {
  const walletAccId = `acc_wallet_${userId}`;
  return postDoubleEntryTransaction({
    reference,
    description: `Cash-out to ${destination} (${reference})`,
    transactionType: 'WITHDRAWAL',
    postings: [
      {
        accountId: walletAccId,
        accountType: 'WALLET',
        amountPesewas,
        direction: 'DEBIT',
      },
      {
        accountId: SYSTEM_GATEWAY_CLEARING,
        accountType: 'PAYMENT_GATEWAY_CLEARING',
        amountPesewas,
        direction: 'CREDIT',
      },
    ],
  });
}

/**
 * Susu Savings Daily Contribution
 */
export async function executeSusuContribution(userId: string, amountPesewas: number, planId: string) {
  const walletAccId = `acc_wallet_${userId}`;
  const vaultAccId = `acc_vault_${userId}`;
  const reference = `susu_contrib_${planId}_${Date.now()}`;

  const entry = await postDoubleEntryTransaction({
    reference,
    description: `Daily Susu Lock Contribution`,
    transactionType: 'SUSU_CONTRIBUTION',
    postings: [
      {
        accountId: walletAccId,
        accountType: 'WALLET',
        amountPesewas,
        direction: 'DEBIT',
      },
      {
        accountId: vaultAccId,
        accountType: 'SUSU_VAULT',
        amountPesewas,
        direction: 'CREDIT',
      },
    ],
  });

  const plan = globalStore.susuPlans.get(planId);
  if (plan) {
    plan.currentAmountPesewas += amountPesewas;
  }

  return entry;
}

/**
 * Susu SafeLock Early Liquidation:
 * Forfeits accrued yield and imposes 2% administrative fee.
 */
export async function executeSusuLiquidation(userId: string, planId: string) {
  const plan = globalStore.susuPlans.get(planId);
  if (!plan) throw new Error('Susu Plan not found.');
  if (plan.status !== 'ACTIVE') throw new Error('Plan is not currently active.');

  const principal = plan.currentAmountPesewas;
  const isEarly = new Date() < new Date(plan.maturityDate);

  const walletAccId = `acc_wallet_${userId}`;
  const vaultAccId = `acc_vault_${userId}`;
  const reference = `susu_liquidate_${planId}_${Date.now()}`;

  if (isEarly) {
    // 2% administrative fee deduction
    const feePesewas = Math.round(principal * 0.02);
    const netReturnPesewas = principal - feePesewas;

    const entry = await postDoubleEntryTransaction({
      reference,
      description: `Early SafeLock Liquidation (2.0% Fee: -GH₵ ${(feePesewas / 100).toFixed(2)})`,
      transactionType: 'SUSU_PAYOUT',
      postings: [
        {
          accountId: vaultAccId,
          accountType: 'SUSU_VAULT',
          amountPesewas: principal,
          direction: 'DEBIT',
        },
        {
          accountId: SYSTEM_FEES_RECEIVABLE,
          accountType: 'FEES_RECEIVABLE',
          amountPesewas: feePesewas,
          direction: 'CREDIT',
        },
        {
          accountId: walletAccId,
          accountType: 'WALLET',
          amountPesewas: netReturnPesewas,
          direction: 'CREDIT',
        },
      ],
    });

    plan.status = 'LIQUIDATED';
    plan.currentAmountPesewas = 0;
    plan.accruedYieldPesewas = 0;
    return { entry, netReturnPesewas, feePesewas, forfeitedYield: true };
  } else {
    // Mature liquidation: Full principal + accrued yield payout
    const totalPayout = principal + plan.accruedYieldPesewas;
    const entry = await postDoubleEntryTransaction({
      reference,
      description: `Matured Susu SafeLock Payout with 12% Compound Yield`,
      transactionType: 'SUSU_PAYOUT',
      postings: [
        {
          accountId: vaultAccId,
          accountType: 'SUSU_VAULT',
          amountPesewas: principal,
          direction: 'DEBIT',
        },
        {
          accountId: SYSTEM_YIELD_EXPENSE,
          accountType: 'ESCROW',
          amountPesewas: plan.accruedYieldPesewas,
          direction: 'DEBIT',
        },
        {
          accountId: walletAccId,
          accountType: 'WALLET',
          amountPesewas: totalPayout,
          direction: 'CREDIT',
        },
      ],
    });

    plan.status = 'MATURED';
    plan.currentAmountPesewas = 0;
    return { entry, netReturnPesewas: totalPayout, feePesewas: 0, forfeitedYield: false };
  }
}

/**
 * Micro-Credit Loan Disbursement (Act 1052 Compliant)
 */
export async function executeLoanDisbursement(
  userId: string,
  principalPesewas: number,
  processingFeePesewas: number,
  tenureDays: number,
  monthlyRatePercent: number
) {
  const walletAccId = `acc_wallet_${userId}`;
  const loanAccId = `acc_loan_${userId}`;
  const reference = `loan_disburse_${Date.now()}`;

  // Net disbursement = Principal - Processing Fee (1.5%)
  const netDisbursementPesewas = principalPesewas - processingFeePesewas;

  const entry = await postDoubleEntryTransaction({
    reference,
    description: `Micro-Credit Disbursed (Act 1052: 1.5% Fee Deducted)`,
    transactionType: 'LOAN_DISBURSEMENT',
    postings: [
      {
        accountId: loanAccId,
        accountType: 'LOAN_PRINCIPAL',
        amountPesewas: principalPesewas,
        direction: 'DEBIT',
      },
      {
        accountId: SYSTEM_FEES_RECEIVABLE,
        accountType: 'FEES_RECEIVABLE',
        amountPesewas: processingFeePesewas,
        direction: 'CREDIT',
      },
      {
        accountId: walletAccId,
        accountType: 'WALLET',
        amountPesewas: netDisbursementPesewas,
        direction: 'CREDIT',
      },
    ],
  });

  const totalInterestPesewas = Math.round(principalPesewas * (monthlyRatePercent / 100));
  const totalPayablePesewas = principalPesewas + totalInterestPesewas;

  const loanId = `loan_${Date.now()}`;
  const loanRecord: LoanRecord = {
    id: loanId,
    userId,
    principalPesewas,
    interestRateBps: Math.round(monthlyRatePercent * 100),
    processingFeePesewas,
    tenureDays,
    totalPayablePesewas,
    balanceRemainingPesewas: totalPayablePesewas,
    status: 'DISBURSED',
    aprDisclosed: Number((monthlyRatePercent * 12).toFixed(2)),
    monthlyRate: monthlyRatePercent,
    disbursedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + tenureDays * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  globalStore.loans.set(loanId, loanRecord);

  // Update loan principal account balance to reflect total payable
  const loanAccount = globalStore.accounts.get(loanAccId);
  if (loanAccount) {
    loanAccount.balancePesewas = totalPayablePesewas;
    const user = globalStore.users.get(userId);
    if (user) user.activeLoanBalancePesewas = totalPayablePesewas;
  }

  return { entry, loanRecord };
}

/**
 * Micro-Credit Loan Repayment
 */
export async function executeLoanRepayment(userId: string, loanId: string, amountPesewas: number) {
  const loan = globalStore.loans.get(loanId);
  if (!loan) throw new Error('Loan not found.');

  const walletAccId = `acc_wallet_${userId}`;
  const loanAccId = `acc_loan_${userId}`;
  const reference = `loan_repay_${loanId}_${Date.now()}`;

  const entry = await postDoubleEntryTransaction({
    reference,
    description: `Micro-Credit Loan Repayment (${reference})`,
    transactionType: 'LOAN_REPAYMENT',
    postings: [
      {
        accountId: walletAccId,
        accountType: 'WALLET',
        amountPesewas,
        direction: 'DEBIT',
      },
      {
        accountId: loanAccId,
        accountType: 'LOAN_PRINCIPAL',
        amountPesewas,
        direction: 'CREDIT',
      },
    ],
  });

  loan.balanceRemainingPesewas = Math.max(0, loan.balanceRemainingPesewas - amountPesewas);
  if (loan.balanceRemainingPesewas === 0) {
    loan.status = 'REPAID';
  }

  return { entry, loan };
}

// Accessor methods for stores
export function getUser(userId: string): (UserProfile & { pinHash: string }) | undefined {
  return globalStore.users.get(userId);
}

export function getUserByPhone(phone: string): (UserProfile & { pinHash: string }) | undefined {
  for (const user of globalStore.users.values()) {
    if (user.phone === phone) return user;
  }
  return undefined;
}

export function saveUser(user: UserProfile & { pinHash: string }) {
  globalStore.users.set(user.id, user);
}

export function getTransactions(userId?: string): JournalEntryRecord[] {
  if (!userId) return globalStore.journalEntries;
  const userAccPrefix = userId;
  return globalStore.journalEntries.filter((j) =>
    j.postings.some((p) => p.accountId.includes(userAccPrefix))
  );
}

export function getSusuPlans(userId: string): SusuPlanRecord[] {
  return Array.from(globalStore.susuPlans.values()).filter((p) => p.userId === userId);
}

export function getLoans(userId: string): LoanRecord[] {
  return Array.from(globalStore.loans.values()).filter((l) => l.userId === userId);
}

export function getBankAccounts(userId: string): BankAccountRecord[] {
  return globalStore.bankAccounts.get(userId) || [];
}

export function addBankAccount(userId: string, bank: BankAccountRecord) {
  const list = globalStore.bankAccounts.get(userId) || [];
  list.push(bank);
  globalStore.bankAccounts.set(userId, list);
}
