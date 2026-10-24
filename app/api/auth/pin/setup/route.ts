import { NextResponse } from 'next/server';
import { normalizeGhanaPhone, UserProfile } from '@/lib/types';
import { hashPin, signSessionToken } from '@/lib/auth';
import { getUserByPhone, saveUser } from '@/lib/ledger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, fullName, pin } = body;

    if (!phone || !pin) {
      return NextResponse.json({ error: 'Phone and 4-digit PIN are required.' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must consist of exactly 4 numeric digits.' }, { status: 400 });
    }

    const { normalized } = normalizeGhanaPhone(phone);
    let user = getUserByPhone(normalized);

    const hashedPin = await hashPin(pin);

    if (!user) {
      // New User Onboarding
      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = {
        id: newUserId,
        phone: normalized,
        fullName: fullName?.trim() || 'QuickSave Customer',
        email: null,
        pinHash: hashedPin,
        kycTier: 'TIER_1',
        ghanaCardNumber: null,
        ghanaCardVerified: false,
        biometricEnabled: false,
        walletBalancePesewas: 0,
        susuVaultPesewas: 0,
        activeLoanBalancePesewas: 0,
        creditLimitPesewas: 50_000, // GH₵ 500.00 Tier 1 credit limit
        createdAt: new Date().toISOString(),
      };
      saveUser(user);
    } else {
      // Update existing user's PIN
      user.pinHash = hashedPin;
      if (fullName?.trim()) {
        user.fullName = fullName.trim();
      }
      saveUser(user);
    }

    // Issue HttpOnly JWT Session Cookie
    const token = signSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Security PIN established successfully.',
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        kycTier: user.kycTier,
        ghanaCardVerified: user.ghanaCardVerified,
        walletBalancePesewas: user.walletBalancePesewas,
        susuVaultPesewas: user.susuVaultPesewas,
        activeLoanBalancePesewas: user.activeLoanBalancePesewas,
        creditLimitPesewas: user.creditLimitPesewas,
      },
    });

    response.cookies.set({
      name: 'qs_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'PIN setup failed.' }, { status: 500 });
  }
}
