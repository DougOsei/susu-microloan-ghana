import { MoMoNetwork, MoMoProviderInfo, LoanProduct } from '../types';

export const GHANA_CURRENCY_SYMBOL = 'GH₵';
export const GHANA_COUNTRY_CODE = '+233';

export const MOMO_PROVIDERS: Record<MoMoNetwork, MoMoProviderInfo> = {
  mtn: {
    id: 'mtn',
    name: 'MTN Mobile Money',
    shortName: 'MTN MoMo',
    badgeColor: '#FFCC00',
    textColor: '#1A1A1A',
    prefixes: ['024', '054', '055', '059', '053'],
    ussdShortCode: '*170#',
    tagline: 'Instant Deposit & Withdrawal via MTN MoMo',
  },
  telecel: {
    id: 'telecel',
    name: 'Telecel Cash',
    shortName: 'Telecel Cash',
    badgeColor: '#E60000',
    textColor: '#FFFFFF',
    prefixes: ['020', '050'],
    ussdShortCode: '*110#',
    tagline: 'Zero-Fee Transfers & Instant Cashout',
  },
  at: {
    id: 'at',
    name: 'AT Money (AirtelTigo)',
    shortName: 'AT Money',
    badgeColor: '#003399',
    textColor: '#FFFFFF',
    prefixes: ['027', '057', '026'],
    ussdShortCode: '*110#',
    tagline: 'Reliable Micro-Banking via AT Network',
  },
};

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'nano_instant',
    name: 'Quick Nano-Credit',
    category: 'nano',
    minAmount: 100,
    maxAmount: 1000,
    minTenureDays: 61, // Google Play requires >60 days for non-bank personal loans or compliant tier
    maxTenureDays: 90,
    monthlyInterestRate: 4.5, // 4.5% per month
    processingFeePercent: 1.5,
    badge: 'Popular',
    description: 'Instant micro-cash for emergencies disbursed in 60 seconds directly to your MoMo.',
    eligibleCreditScore: 580,
  },
  {
    id: 'market_trader',
    name: 'Market Trader & SME Booster',
    category: 'sme',
    minAmount: 1000,
    maxAmount: 6000,
    minTenureDays: 90,
    maxTenureDays: 180,
    monthlyInterestRate: 3.8,
    processingFeePercent: 2.0,
    badge: 'Business',
    description: 'Inventory & working capital financing for traders, artisans, and small enterprises in Ghana.',
    eligibleCreditScore: 650,
  },
  {
    id: 'susu_advance',
    name: 'Susu Backed Advance',
    category: 'susu_advance',
    minAmount: 200,
    maxAmount: 10000,
    minTenureDays: 61,
    maxTenureDays: 120,
    monthlyInterestRate: 2.5, // Discounted rate for active savers
    processingFeePercent: 1.0,
    badge: 'Lowest Interest',
    description: 'Borrow up to 80% of your active Susu savings vault at prime discounted interest rates.',
    eligibleCreditScore: 500,
  },
];

export const BOG_REGULATION_INFO = {
  regulatorName: 'Bank of Ghana',
  licenseCategory: 'Tier 3 Microfinance & Digital Credit Services Act',
  complaintEmail: 'complaints@bog.gov.gh',
  maxAprNotice: 'Maximum Annual Percentage Rate (APR): 36% - 54% p.a. Repayment periods range from 61 to 180 days.',
  dataProtectionNotice: 'Registered with the Data Protection Commission (DPC) of Ghana under Act 843.',
};
