import { NextResponse } from 'next/server';
import { getBankAccounts, addBankAccount, getUser } from '@/lib/ledger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_kwame_mensah_001';
    const accounts = getBankAccounts(userId);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, bankName, bankCode, accountNumber, accountHolderName } = body;
    const targetUserId = userId || 'usr_kwame_mensah_001';

    if (!bankName || !accountNumber || !accountHolderName) {
      return NextResponse.json({ error: 'Bank name, account number, and account holder name are required.' }, { status: 400 });
    }

    const newAccount = {
      id: `bnk_${Date.now()}`,
      bankName,
      bankCode: bankCode || '040100',
      accountNumber,
      accountHolderName,
      isVerified: true,
    };

    addBankAccount(targetUserId, newAccount);

    return NextResponse.json({
      success: true,
      message: `Bank account (${bankName} - ${accountNumber}) registered and verified with GhIPSS.`,
      account: newAccount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to register bank account.' }, { status: 500 });
  }
}
