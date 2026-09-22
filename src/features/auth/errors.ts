import type { AuthErrorCode } from '@/features/auth/types';

export class AuthApiError extends Error {
  constructor(public readonly code: AuthErrorCode, public readonly status?: number) {
    super(code);
    this.name = 'AuthApiError';
  }
}

const ERROR_MESSAGES = {
  INVALID_PHONE: 'Numarul de telefon nu este valid.',
  INVALID_PIN_FORMAT: 'PIN-ul trebuie sa contina 4 cifre.',
  INVALID_CREDENTIALS: 'Numarul de telefon sau PIN-ul este incorect.',
  TOO_MANY_ATTEMPTS: 'Prea multe incercari. Incearca din nou mai tarziu.',
  AUTH_UNAVAILABLE: 'Serviciul de autentificare nu este disponibil momentan.',
  INTERNAL_ERROR: 'A aparut o eroare. Incearca din nou.',
} as const;

export function getAuthErrorMessage(error: unknown) {
  return error instanceof AuthApiError ? ERROR_MESSAGES[error.code] : ERROR_MESSAGES.INTERNAL_ERROR;
}
