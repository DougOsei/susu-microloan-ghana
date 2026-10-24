import { NextResponse } from 'next/server';
import { normalizeGhanaPhone } from '@/lib/types';
import { generateOtp } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const { isValid, normalized, network } = normalizeGhanaPhone(phone);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Ghanaian phone number. Must be a valid MTN, Telecel, or AT number.' },
        { status: 400 }
      );
    }

    const { otp, expiresAt } = generateOtp(normalized);

    // Hubtel SMS Gateway API payload formatting
    const hubtelClientId = process.env.HUBTEL_CLIENT_ID;
    const hubtelClientSecret = process.env.HUBTEL_CLIENT_SECRET;
    if (hubtelClientId && hubtelClientSecret) {
      try {
        await fetch('https://api.hubtel.com/v1/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${hubtelClientId}:${hubtelClientSecret}`).toString('base64'),
          },
          body: JSON.stringify({
            From: 'QuickSave',
            To: normalized,
            Content: `QuickSave Ghana: Your one-time verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
          }),
        });
      } catch (err: any) {
        console.warn('Hubtel SMS live dispatch error:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via SMS to ${normalized} (${network}).`,
      phone: normalized,
      network,
      expiresAt,
      // Expose debugOtp in development or testing sandbox so the tester can enter it directly
      debugOtp: process.env.NODE_ENV === 'production' && hubtelClientId ? undefined : otp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to dispatch OTP.' }, { status: 500 });
  }
}
