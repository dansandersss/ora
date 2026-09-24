import { BackendError } from '@/lib/backend';

const PARTY_ERROR_MESSAGES: Record<string, string> = {
  INVALID_PARTY_CODE: 'Codul sesiunii trebuie să conțină 8 caractere valide.',
  PARTY_NOT_FOUND: 'Codul sesiunii nu este valid.',
  PARTY_CLOSED: 'Această sesiune nu mai este disponibilă.',
  PARTY_FULL: 'Sesiunea este deja completă.',
  PARTICIPANT_SESSION_REQUIRED: 'Ai nevoie de o sesiune activă pentru a te alătura.',
  NO_ACTIVE_SESSION: 'Ai nevoie de o sesiune activă pentru a te alătura.',
  UNAUTHORIZED: 'Sesiunea de autentificare a expirat. Conectează-te din nou.',
};

export function getPartyJoinErrorMessage(error: unknown) {
  if (error instanceof BackendError) {
    return PARTY_ERROR_MESSAGES[error.message] ?? 'Nu am putut conecta sesiunea. Încearcă din nou.';
  }
  return 'Nu am putut conecta sesiunea. Încearcă din nou.';
}
