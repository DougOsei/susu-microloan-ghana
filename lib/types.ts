/**
 * West African Digital Payment & Microfinance Core Types
 * Bank of Ghana (BoG) compliant currency & ledger definitions
 */

export type KycTier = 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';

export type AccountType =
  | 'WALLET'
  | 'SUSU_VAULT'
  | 'LOAN_PRINCIPAL'
  | 'FEES_RECEIVABLE'
  | 'PAYMENT_GATEWAY_CLEARING'
  | 'ESCROW';

export type PostingDirection = 'DEBIT' | 'CREDIT';

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'SUSU_CONTRIBUTION'
  | 'SUSU_PAYOUT'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'FEE_ASSESSMENT'
  | 'TRANSFER';

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  email?: string | null;
  kycTier: KycTier;
  ghanaCardNumber?: string | null;
  ghanaCardVerified: boolean;
  biometricEnabled: boolean;
  walletBalancePesewas: number;
  susuVaultPesewas: number;
  activeLoanBalancePesewas: number;
  creditLimitPesewas: number;
  createdAt: string;
}

export interface LedgerPostingItem {
  accountId: string;
  accountType: AccountType;
  amountPesewas: number;
  direction: PostingDirection;
}

export interface JournalEntryRecord {
  id: string;
  reference: string;
  description: string;
  transactionType: TransactionType;
  timestamp: string;
  postings: LedgerPostingItem[];
  amountPesewas: number;
}

export interface SusuPlanRecord {
  id: string;
  userId: string;
  planType: 'DAILY_SUSU' | 'SAFELOCK' | 'EMERGENCY_POT';
  title: string;
  targetAmountPesewas: number;
  currentAmountPesewas: number;
  dailyContributionPesewas: number;
  accruedYieldPesewas: number;
  annualYieldRate: number; // e.g. 0.12 (12%)
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'LIQUIDATED' | 'CANCELLED';
  createdAt: string;
}

export interface LoanRecord {
  id: string;
  userId: string;
  principalPesewas: number;
  interestRateBps: number; // e.g. 380 = 3.8%
  processingFeePesewas: number;
  tenureDays: number;
  totalPayablePesewas: number;
  balanceRemainingPesewas: number;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'DEFAULTED';
  aprDisclosed: number; // Annual Percentage Rate (Act 1052)
  monthlyRate: number;
  disbursedAt?: string | null;
  dueAt: string;
  createdAt: string;
}

export interface BankAccountRecord {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
}

/**
 * Currency helpers: Ghanaian Cedi (GH₵) & Pesewas
 * 1 GHS = 100 Pesewas (Guarantees zero floating point inaccuracy)
 */
export function pesewasToGHS(pesewas: number | bigint): number {
  return Number(pesewas) / 100;
}

export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

export function formatGHS(pesewas: number | bigint): string {
  const amount = pesewasToGHS(pesewas);
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('GHS', 'GH₵');
}

/**
 * Validates Ghanaian phone numbers (MSISDN):
 * Supports:
 * - MTN Ghana: 024, 054, 055, 059, 025
 * - Telecel Ghana (Vodafone): 020, 050
 * - AT (AirtelTigo): 027, 057, 026, 056
 */
export function normalizeGhanaPhone(phone: string): { isValid: boolean; normalized: string; network?: string } {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+233' + cleaned.substring(1);
  } else if (cleaned.startsWith('233')) {
    cleaned = '+' + cleaned;
  }

  const ghanaRegex = /^\+233(24|54|55|59|25|20|50|27|57|26|56)\d{7}$/;
  const isValid = ghanaRegex.test(cleaned);

  let network: string | undefined;
  if (isValid) {
    const prefix = cleaned.substring(4, 6);
    if (['24', '54', '55', '59', '25'].includes(prefix)) network = 'MTN';
    else if (['20', '50'].includes(prefix)) network = 'Telecel';
    else if (['27', '57', '26', '56'].includes(prefix)) network = 'AT';
  }

  return { isValid, normalized: cleaned, network };
}

/**
 * Validates Ghana Card format: GHA-XXXXXXXXX-X
 * 9 digits in the middle, 1 check digit at end
 */
export function validateGhanaCard(card: string): boolean {
  const regex = /^GHA-\d{9}-\d$/;
  return regex.test(card.trim().toUpperCase());
}
