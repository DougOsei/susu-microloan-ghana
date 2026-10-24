import { NextResponse } from 'next/server';
import { verifyGhanaCardNia } from '@/lib/kyc';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ghanaCardNumber, fullName, selfieImageBase64 } = body;

    if (!userId || !ghanaCardNumber) {
      return NextResponse.json({ error: 'User ID and Ghana Card number are required.' }, { status: 400 });
    }

    const result = await verifyGhanaCardNia({
      userId,
      ghanaCardNumber,
      fullName: fullName || 'QuickSave Customer',
      selfieImageBase64,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ghana Card NIA verification failed.' }, { status: 400 });
  }
}
