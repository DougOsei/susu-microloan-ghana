/**
 * Bank of Ghana Borrowers and Lenders Act, 2020 (Act 1052) Micro-Credit Underwriting
 * Dynamic APR Calculator & Pre-Contract Credit Disclosures
 */

import { UserProfile, pesewasToGHS } from './types';

export interface LoanQuote {
  principalPesewas: number;
  principalGHS: number;
  monthlyInterestRate: number;
  processingFeePesewas: number;
  processingFeeGHS: number;
  tenureDays: number;
  interestPesewas: number;
  interestGHS: number;
  totalPayablePesewas: number;
  totalPayableGHS: number;
  netDisbursementPesewas: number;
  netDisbursementGHS: number;
  statutoryApr: number; // Annual Percentage Rate compliant with Act 1052
  repaymentDueDate: string;
  isEligible: boolean;
  rejectionReason?: string;
  bogDisclosureNotice: string;
}

/**
 * Calculates pre-contract loan quote and Act 1052 statutory APR
 */
export function calculateLoanQuote(params: {
  user: UserProfile;
  requestedPrincipalPesewas: number;
  tenureDays: number;
}): LoanQuote {
  const { user, requestedPrincipalPesewas, tenureDays } = params;

  // 1. Check KYC Tier Eligibility
  const maxLimit = user.creditLimitPesewas || (user.kycTier === 'TIER_2' ? 500_000 : 50_000);
  let isEligible = true;
  let rejectionReason: string | undefined;

  if (requestedPrincipalPesewas > maxLimit) {
    isEligible = false;
    rejectionReason = `Requested amount exceeds your current credit limit of GH₵ ${(maxLimit / 100).toFixed(2)}. Complete Ghana Card KYC to increase your limit to GH₵ 5,000.00.`;
  } else if (user.activeLoanBalancePesewas > 0) {
    isEligible = false;
    rejectionReason = `You have an active outstanding loan balance of GH₵ ${(user.activeLoanBalancePesewas / 100).toFixed(2)}. Repay current loan to unlock a new credit line.`;
  }

  // 2. Risk-based pricing (Monthly rate: 3.8% for Tier 2 with high Susu, 4.5% otherwise)
  const monthlyInterestRate = user.kycTier === 'TIER_2' && user.susuVaultPesewas > 50_000 ? 3.8 : 4.5;

  // 3. Statutory Capped Processing Fee (1.5%)
  const processingFeePesewas = Math.round(requestedPrincipalPesewas * 0.015);

  // 4. Interest Calculation based on tenure
  const tenureMonths = tenureDays / 30;
  const interestPesewas = Math.round(requestedPrincipalPesewas * (monthlyInterestRate / 100) * tenureMonths);
  const totalPayablePesewas = requestedPrincipalPesewas + interestPesewas;
  const netDisbursementPesewas = requestedPrincipalPesewas - processingFeePesewas;

  // 5. Statutory APR under Borrowers and Lenders Act, 2020 (Act 1052):
  // APR = ((Total Finance Charges / Net Loan Amount) / (Tenure in Days / 365)) * 100
  const financeChargesPesewas = interestPesewas + processingFeePesewas;
  const annualFactor = 365 / tenureDays;
  const statutoryApr = Number(((financeChargesPesewas / netDisbursementPesewas) * annualFactor * 100).toFixed(2));

  const dueDate = new Date(Date.now() + tenureDays * 24 * 60 * 60 * 1000).toISOString();

  const bogDisclosureNotice = `Under Section 54 of the Borrowers and Lenders Act, 2020 (Act 1052), the statutory Annual Percentage Rate (APR) for this facility is ${statutoryApr}%. Total finance charge is GH₵ ${(financeChargesPesewas / 100).toFixed(2)}. Daily default interest rate of 0.1% applies if not settled by due date.`;

  return {
    principalPesewas: requestedPrincipalPesewas,
    principalGHS: pesewasToGHS(requestedPrincipalPesewas),
    monthlyInterestRate,
    processingFeePesewas,
    processingFeeGHS: pesewasToGHS(processingFeePesewas),
    tenureDays,
    interestPesewas,
    interestGHS: pesewasToGHS(interestPesewas),
    totalPayablePesewas,
    totalPayableGHS: pesewasToGHS(totalPayablePesewas),
    netDisbursementPesewas,
    netDisbursementGHS: pesewasToGHS(netDisbursementPesewas),
    statutoryApr,
    repaymentDueDate: dueDate,
    isEligible,
    rejectionReason,
    bogDisclosureNotice,
  };
}
