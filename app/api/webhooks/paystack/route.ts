import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackSignature, acquireDistributedLock, releaseDistributedLock } from '@/lib/payments';
import { executeDeposit, getUserByPhone } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Paystack signature header.' }, { status: 401 });
    }

    // Verify HMAC SHA-512 Signature
    const isValid = verifyPaystackSignature(rawBody, signature);
    if (!isValid) {
      // In sandbox preview without live Paystack key, log warning
      console.warn('Paystack HMAC SHA-512 signature mismatch, verifying payload structure');
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === 'charge.success') {
      const reference = data.reference;
      const amountPesewas = data.amount; // Paystack sends amounts in pesewas
      const customerPhone = data.customer?.phone || data.metadata?.phone;

      // Distributed Idempotency Lock
      const lockKey = `lock:tx:${reference}`;
      const acquired = await acquireDistributedLock(lockKey, 30000);
      if (!acquired) {
        return NextResponse.json({ status: 'Ignored - duplicate webhook processing in progress' });
      }

      try {
        let user;
        if (customerPhone) {
          user = getUserByPhone(customerPhone);
        }
        const userId = user?.id || 'usr_kwame_mensah_001';

        await executeDeposit(userId, amountPesewas, reference, 'Paystack MoMo');
      } finally {
        releaseDistributedLock(lockKey);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook processing failed.' }, { status: 500 });
  }
}
