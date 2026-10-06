export type MoMoNetwork = 'mtn' | 'telecel' | 'at';

export interface MoMoProviderInfo {
  id: MoMoNetwork;
  name: string;
  shortName: string;
  badgeColor: string;
  textColor: string;
  prefixes: string[];
  ussdShortCode: string;
  tagline: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
  branch?: string;
  dateAdded: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  ghanaCardNumber: string;
  isGhanaCardVerified: boolean;
  kycLevel: 1 | 2;
  creditScore: number;
  maxLoanLimit: number;
  pin: string;
  preferredMoMo: MoMoNetwork;
  bankAccounts?: BankAccount[];
}

export interface WalletBalances {
  availableBalance: number;
  totalSavings: number;
  activeLoanDebt: number;
  totalInterestEarned: number;
}

export type SavingsType = 'susu' | 'vault' | 'emergency';

export interface SavingsProduct {
  id: string;
  title: string;
  type: SavingsType;
  description: string;
  interestRateAnnual: number;
  targetAmount: number;
  currentAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  maturityDate?: string;
  isLocked: boolean;
  lockPeriodDays?: number;
}

export interface LoanProduct {
  id: string;
  name: string;
  category: 'nano' | 'sme' | 'susu_advance';
  minAmount: number;
  maxAmount: number;
  minTenureDays: number;
  maxTenureDays: number;
  monthlyInterestRate: number;
  processingFeePercent: number;
  badge: string;
  description: string;
  eligibleCreditScore: number;
}

export interface ActiveLoan {
  id: string;
  productId: string;
  productName: string;
  principalAmount: number;
  interestAmount: number;
  processingFee: number;
  totalRepayment: number;
  amountPaid: number;
  tenureDays: number;
  disbursementDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  disbursementMoMoNumber: string;
  network: MoMoNetwork;
  reference: string;
}

export type TransactionType =
  | 'momo_deposit'
  | 'momo_withdrawal'
  | 'savings_deposit'
  | 'savings_withdrawal'
  | 'loan_disbursement'
  | 'loan_repayment'
  | 'interest_credited';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  amount: number;
  currency: 'GH₵';
  date: string;
  status: 'completed' | 'processing' | 'failed';
  network?: MoMoNetwork;
  reference: string;
  fee?: number;
}
