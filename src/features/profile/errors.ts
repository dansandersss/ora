import { BackendError } from '@/lib/backend';

const messages: Record<string, string> = {
  INVALID_FULL_NAME: 'Numele nu este valid.',
  INVALID_PHONE: 'Numărul de telefon nu este valid.',
  PHONE_ALREADY_IN_USE: 'Acest număr de telefon este deja folosit.',
  NO_PROFILE_CHANGES: 'Nu ai făcut nicio modificare.',
  INVALID_CURRENT_PIN: 'PIN-ul curent este incorect.',
  INVALID_NEW_PIN: 'Noul PIN trebuie să conțină exact 4 cifre.',
  PIN_UNCHANGED: 'Noul PIN trebuie să fie diferit de PIN-ul curent.',
  PIN_CHANGE_FAILED: 'PIN-ul nu a putut fi schimbat.',
};

export function getProfileErrorMessage(error: unknown, fallback = 'A apărut o eroare. Încearcă din nou.') {
  return error instanceof BackendError ? messages[error.message] ?? fallback : fallback;
}
