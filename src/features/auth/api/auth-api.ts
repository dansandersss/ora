import { AuthApiError } from '@/features/auth/errors';
import type { LoginCredentials } from '@/features/auth/types';
import { getAuthenticatedUser, loginWithPhone, logoutSession } from '@/lib/backend';
const MOLDOVA_PREFIX = '+373';
const LOCAL_PHONE_LENGTH = 8;

export function normalizeLocalPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const withoutPrefix = digits.startsWith('373') ? digits.slice(3) : digits;
  return withoutPrefix.slice(0, LOCAL_PHONE_LENGTH);
}

export function toMoldovaE164(localPhone: string) {
  const normalized = normalizeLocalPhone(localPhone);
  if (normalized.length !== LOCAL_PHONE_LENGTH) throw new AuthApiError('INVALID_PHONE');
  return `${MOLDOVA_PREFIX}${normalized}`;
}

export function login(credentials: LoginCredentials) {
  return loginWithPhone({
    deviceName: credentials.deviceName,
    phone: toMoldovaE164(credentials.localPhone),
    pin: credentials.pin,
  });
}

export const getCurrentUser = getAuthenticatedUser;

export const logout = logoutSession;
