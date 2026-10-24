import { NextResponse } from 'next/server';
import { initiateMoMoDeposit } from '@/lib/payments';
import { getUser } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, phone, amountGHS, amountPesewas, network } = body;

    const resolvedPesewas = amountPesewas || Math.round((amountGHS || 0) * 100);
    if (!resolvedPesewas || resolvedPesewas <= 0) {
      return NextResponse.json({ error: 'Valid deposit amount is required.' }, { status: 400 });
    }

    const targetUserId = userId || 'usr_kwame_mensah_001';
    const user = getUser(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const selectedNetwork = network || 'MTN';
    const momoPhone = phone || user.phone;

    const result = await initiateMoMoDeposit({
      userId: targetUserId,
      phone: momoPhone,
      amountPesewas: resolvedPesewas,
      network: selectedNetwork,
    });

    return NextResponse.json({
      success: true,
      ...result,
      newWalletBalancePesewas: user.walletBalancePesewas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Deposit initiation failed.' }, { status: 500 });
  }
}
