/**
 * Ghanaian Fintech Security & Authentication Services
 * Salt-hashed 4-Digit Security PIN (bcrypt) & JWT HttpOnly Session Tokens
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserProfile } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'quicksave_ghana_bog_fintech_master_secret_2026';
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

// In-Memory OTP Store & Rate Limiter (Redis interface abstraction)
interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
  lockedUntil?: number;
}

const otpStore = new Map<string, OtpEntry>();

/**
 * Generates a cryptographically secure 6-digit OTP for Ghanaian MSISDN
 */
export function generateOtp(phone: string): { otp: string; expiresAt: number } {
  const existing = otpStore.get(phone);
  if (existing?.lockedUntil && Date.now() < existing.lockedUntil) {
    const remainingMin = Math.ceil((existing.lockedUntil - Date.now()) / (60 * 1000));
    throw new Error(`Too many failed attempts. Account locked for ${remainingMin} more minutes.`);
  }

  // 6-digit cryptographically strong integer (100000 - 999999)
  const otpNumber = crypto.randomInt(100000, 999999);
  const otp = otpNumber.toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  otpStore.set(phone, {
    otp,
    expiresAt,
    attempts: 0,
  });

  return { otp, expiresAt };
}

/**
 * Validates submitted OTP with strict 3-attempt lockout
 */
export function verifyOtp(phone: string, submittedOtp: string): { success: boolean; error?: string } {
  const entry = otpStore.get(phone);
  if (!entry) {
    return { success: false, error: 'OTP expired or not requested. Please request a new code.' };
  }

  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const remaining = Math.ceil((entry.lockedUntil - Date.now()) / (60 * 1000));
    return { success: false, error: `Account locked. Please try again in ${remaining} minutes.` };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { success: false, error: 'OTP has expired (valid for 5 minutes). Please request a new code.' };
  }

  if (entry.otp !== submittedOtp.trim()) {
    entry.attempts += 1;
    if (entry.attempts >= MAX_OTP_FAILED_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      return {
        success: false,
        error: `Exceeded maximum attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
      };
    }
    const remainingAttempts = MAX_OTP_FAILED_ATTEMPTS - entry.attempts;
    return {
      success: false,
      error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before security lock.`,
    };
  }

  // Success - consume OTP
  otpStore.delete(phone);
  return { success: true };
}

/**
 * Hash 4-Digit Security PIN using bcrypt with cost factor 10-12
 */
export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('Security PIN must be exactly 4 numerical digits.');
  }
  return bcrypt.hash(pin, 10);
}

/**
 * Verify submitted PIN against bcrypt hash
 */
export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Signs an HttpOnly JWT session token
 */
export function signSessionToken(user: UserProfile): string {
  const payload = {
    sub: user.id,
    phone: user.phone,
    name: user.fullName,
    kycTier: user.kycTier,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies JWT session token from request cookies
 */
export function verifySessionToken(token: string): { sub: string; phone: string; name: string; kycTier: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}
