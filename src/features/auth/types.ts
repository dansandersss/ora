export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  avatarUrl?: string | null;
  status: 'active' | string;
};

export type AuthSession = {
  sessionToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type LoginCredentials = {
  localPhone: string;
  pin: string;
  deviceName: string;
};

export type AuthErrorCode =
  | 'INVALID_PHONE'
  | 'INVALID_PIN_FORMAT'
  | 'INVALID_CREDENTIALS'
  | 'TOO_MANY_ATTEMPTS'
  | 'AUTH_UNAVAILABLE'
  | 'INTERNAL_ERROR';
