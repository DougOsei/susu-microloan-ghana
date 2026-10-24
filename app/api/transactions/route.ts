import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/ledger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_kwame_mensah_001';
    const txs = getTransactions(userId);
    return NextResponse.json({ transactions: txs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
