import { NextResponse } from 'next/server';
import { executeLoanRepayment, getUser } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, loanId, amountGHS, amountPesewas } = body;
    const targetUserId = userId || 'usr_kwame_mensah_001';

    const user = getUser(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const pesewas = amountPesewas || Math.round((amountGHS || 0) * 100);
    if (!pesewas || pesewas <= 0) {
      return NextResponse.json({ error: 'Valid repayment amount is required.' }, { status: 400 });
    }

    if (user.walletBalancePesewas < pesewas) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance for repayment. Current balance: GH₵ ${(user.walletBalancePesewas / 100).toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    const result = await executeLoanRepayment(targetUserId, loanId || 'loan_sme_001', pesewas);

    return NextResponse.json({
      success: true,
      message: `Repayment of GH₵ ${(pesewas / 100).toFixed(2)} completed. Remaining loan balance: GH₵ ${(result.loan.balanceRemainingPesewas / 100).toFixed(2)}`,
      loan: result.loan,
      walletBalancePesewas: user.walletBalancePesewas,
      activeLoanBalancePesewas: user.activeLoanBalancePesewas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Loan repayment failed.' }, { status: 500 });
  }
}
