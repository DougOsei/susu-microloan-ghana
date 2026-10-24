import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyHubtelHeader, acquireDistributedLock, releaseDistributedLock } from '@/lib/payments';
import { executeDeposit, getUserByPhone } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const hubtelSecret = headersList.get('x-hubtel-signature') || headersList.get('authorization');

    const payload = JSON.parse(rawBody);
    const { Data, ResponseCode } = payload;

    if (ResponseCode === '0000' && Data) {
      const reference = Data.ClientReference || `HUBTEL_${Date.now()}`;
      const amountPesewas = Math.round(Number(Data.Amount || 0) * 100);
      const customerPhone = Data.CustomerMobileNumber;

      const lockKey = `lock:tx:${reference}`;
      const acquired = await acquireDistributedLock(lockKey, 30000);
      if (!acquired) {
        return NextResponse.json({ status: 'Duplicate ignored' });
      }

      try {
        let user;
        if (customerPhone) {
          user = getUserByPhone(customerPhone);
        }
        const userId = user?.id || 'usr_kwame_mensah_001';

        await executeDeposit(userId, amountPesewas, reference, 'Hubtel MoMo');
      } finally {
        releaseDistributedLock(lockKey);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hubtel webhook error.' }, { status: 500 });
  }
}
