import { NextResponse } from 'next/server';
import { normalizeGhanaPhone } from '@/lib/types';
import { verifyOtp } from '@/lib/auth';
import { getUserByPhone } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and 6-digit OTP code are required.' }, { status: 400 });
    }

    const { normalized } = normalizeGhanaPhone(phone);
    const result = verifyOtp(normalized, otp);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const existingUser = getUserByPhone(normalized);

    return NextResponse.json({
      success: true,
      message: 'Phone number successfully verified.',
      phone: normalized,
      isRegistered: !!existingUser,
      userId: existingUser?.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OTP verification failed.' }, { status: 500 });
  }
}
