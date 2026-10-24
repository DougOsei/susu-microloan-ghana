import { NextResponse } from 'next/server';
import { getLoans, getUser, executeLoanDisbursement } from '@/lib/ledger';
import { calculateLoanQuote } from '@/lib/underwriting';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_kwame_mensah_001';
    const isQuote = searchParams.get('quote') === 'true';

    const user = getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (isQuote) {
      const amountGHS = Number(searchParams.get('amount') || 500);
      const tenureDays = Number(searchParams.get('tenure') || 30);
      const quote = calculateLoanQuote({
        user,
        requestedPrincipalPesewas: Math.round(amountGHS * 100),
        tenureDays,
      });
      return NextResponse.json(quote);
    }

    const loans = getLoans(userId);
    return NextResponse.json({
      loans,
      activeLoanBalancePesewas: user.activeLoanBalancePesewas,
      creditLimitPesewas: user.creditLimitPesewas,
      kycTier: user.kycTier,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Loan query failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amountGHS, amountPesewas, tenureDays } = body;
    const targetUserId = userId || 'usr_kwame_mensah_001';

    const user = getUser(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const requestedPrincipalPesewas = amountPesewas || Math.round((amountGHS || 0) * 100);
    const tenure = Number(tenureDays || 30);

    const quote = calculateLoanQuote({
      user,
      requestedPrincipalPesewas,
      tenureDays: tenure,
    });

    if (!quote.isEligible) {
      return NextResponse.json({ error: quote.rejectionReason }, { status: 400 });
    }

    // Execute disbursement
    const { entry, loanRecord } = await executeLoanDisbursement(
      targetUserId,
      requestedPrincipalPesewas,
      quote.processingFeePesewas,
      tenure,
      quote.monthlyInterestRate
    );

    return NextResponse.json({
      success: true,
      message: `Micro-credit loan of GH₵ ${(requestedPrincipalPesewas / 100).toFixed(2)} disbursed! GH₵ ${(quote.netDisbursementPesewas / 100).toFixed(2)} credited to your wallet (1.5% statutory processing fee deducted).`,
      loan: loanRecord,
      entry,
      walletBalancePesewas: user.walletBalancePesewas,
      activeLoanBalancePesewas: user.activeLoanBalancePesewas,
      bogDisclosure: quote.bogDisclosureNotice,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Loan disbursement failed.' }, { status: 500 });
  }
}
