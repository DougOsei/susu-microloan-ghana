import { NextResponse } from 'next/server';
import { getSusuPlans, executeSusuContribution, executeSusuLiquidation, getUser } from '@/lib/ledger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_kwame_mensah_001';
    const plans = getSusuPlans(userId);
    const user = getUser(userId);

    return NextResponse.json({
      plans,
      totalVaultPesewas: user?.susuVaultPesewas || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch Susu plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, planId, amountGHS, amountPesewas } = body;
    const targetUserId = userId || 'usr_kwame_mensah_001';

    if (action === 'contribute') {
      const pesewas = amountPesewas || Math.round((amountGHS || 0) * 100);
      if (!pesewas || pesewas <= 0) {
        return NextResponse.json({ error: 'Valid contribution amount is required.' }, { status: 400 });
      }

      const entry = await executeSusuContribution(targetUserId, pesewas, planId || 'susu_safelock_001');
      const user = getUser(targetUserId);

      return NextResponse.json({
        success: true,
        message: `Successfully contributed GH₵ ${(pesewas / 100).toFixed(2)} to Susu Vault.`,
        entry,
        walletBalancePesewas: user?.walletBalancePesewas,
        susuVaultPesewas: user?.susuVaultPesewas,
      });
    }

    if (action === 'liquidate') {
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required to liquidate.' }, { status: 400 });
      }

      const result = await executeSusuLiquidation(targetUserId, planId);
      const user = getUser(targetUserId);

      return NextResponse.json({
        success: true,
        message: result.forfeitedYield
          ? `Early SafeLock liquidated. Forfeited accrued yield and deducted 2.0% administrative fee (GH₵ ${(result.feePesewas / 100).toFixed(2)}). GH₵ ${(result.netReturnPesewas / 100).toFixed(2)} credited to wallet.`
          : `Susu plan matured! Full principal and yield paid to your wallet (GH₵ ${(result.netReturnPesewas / 100).toFixed(2)}).`,
        ...result,
        walletBalancePesewas: user?.walletBalancePesewas,
        susuVaultPesewas: user?.susuVaultPesewas,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Susu operation failed.' }, { status: 500 });
  }
}
