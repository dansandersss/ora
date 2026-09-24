import { AuthApiError } from '@/features/auth/errors';
import { sessionStorage } from '@/features/auth/session/session-storage';
import type { AuthErrorCode, AuthSession, AuthUser } from '@/features/auth/types';
import type { DeviceAvailability } from '@/features/home/types';
import type { OraNotification } from '@/features/notifications/types';
import type { PartyMember, SessionParty } from '@/features/party/types';
import { isValidPartyCode, normalizePartyCode } from '@/features/party/utils';
import type { PointsBalance, PointsTransaction } from '@/features/points/types';
import type { AvatarUpload, ChangePinInput, OraProfile, ProfileStatistics, ProfileUpdateInput } from '@/features/profile/types';
import type { GamingSession, GamingSessionHistoryItem, SessionExtensionRequest, SessionHistoryFilter } from '@/features/sessions/types';

const AUTH_API_URL = process.env.EXPO_PUBLIC_ORA_AUTH_URL ??
  'https://hueiutmfxyusmlhqkynd.supabase.co/functions/v1/ora-auth';
const ORA_API_URL = process.env.EXPO_PUBLIC_ORA_API_URL ??
  'https://hueiutmfxyusmlhqkynd.supabase.co/functions/v1/ora-api';
const NOTIFICATIONS_API_URL = process.env.EXPO_PUBLIC_ORA_NOTIFICATIONS_URL ??
  'https://hueiutmfxyusmlhqkynd.supabase.co/functions/v1/ora-notifications';
const PROFILE_API_URL = process.env.EXPO_PUBLIC_ORA_PROFILE_URL ??
  'https://hueiutmfxyusmlhqkynd.supabase.co/functions/v1/ora-profile';
export const isPartyJoinApiEnabled = process.env.EXPO_PUBLIC_ORA_PARTY_JOIN_API_ENABLED !== 'false';

type ErrorPayload = { error?: string; code?: string; message?: string };

export class BackendError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'BackendError';
  }
}

export class BackendFeatureUnavailableError extends Error {
  constructor(feature: string) {
    super(`${feature} is not available from the backend yet.`);
    this.name = 'BackendFeatureUnavailableError';
  }
}

function requirePartyJoinApi() {
  if (!isPartyJoinApiEnabled) throw new BackendFeatureUnavailableError('Party joining');
}

async function parseJson<T>(response: Response): Promise<T | ErrorPayload> {
  try {
    return await response.json() as T;
  } catch {
    return {};
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    });
  } catch {
    throw new BackendError('Serviciul ORA nu este disponibil momentan.');
  }

  const payload = await parseJson<T>(response);
  if (!response.ok) {
    const error = payload as ErrorPayload;
    throw new BackendError(error.message ?? error.error ?? error.code ?? 'ORA API request failed.', response.status);
  }
  return payload as T;
}

async function getRequiredSessionToken() {
  const token = await sessionStorage.getToken();
  if (!token) throw new BackendError('Sesiunea de autentificare lipseste.', 401);
  return token;
}

function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return ['INVALID_PHONE', 'INVALID_PIN_FORMAT', 'INVALID_CREDENTIALS', 'TOO_MANY_ATTEMPTS',
    'AUTH_UNAVAILABLE', 'INTERNAL_ERROR'].includes(String(value));
}

async function authRequest<T>(action: 'login' | 'me' | 'logout', options: RequestInit & { token?: string }) {
  try {
    return await request<T>(`${AUTH_API_URL}?action=${action}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });
  } catch (error) {
    if (error instanceof BackendError) {
      const code = isAuthErrorCode(error.message) ? error.message :
        error.status ? 'INTERNAL_ERROR' : 'AUTH_UNAVAILABLE';
      throw new AuthApiError(code, error.status);
    }
    throw error;
  }
}

/** Authenticates a phone/PIN pair and returns a server-created ORA session. */
export function loginWithPhone(credentials: { phone: string; pin: string; deviceName: string }) {
  return authRequest<AuthSession>('login', { method: 'POST', body: JSON.stringify(credentials) });
}

/** Returns the user represented by an existing ORA auth token. */
export async function getAuthenticatedUser(sessionToken: string) {
  const payload = await authRequest<AuthUser | { user: AuthUser }>('me', { method: 'GET', token: sessionToken });
  return 'user' in payload ? payload.user : payload;
}

/** Invalidates the supplied ORA auth token on the server. */
export function logoutSession(sessionToken: string) {
  return authRequest<void>('logout', { method: 'POST', token: sessionToken });
}

async function profileRequest<T>(action: string, options: RequestInit = {}) {
  const token = await getRequiredSessionToken();
  return request<T>(`${PROFILE_API_URL}?action=${action}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
}

export async function getProfile(): Promise<OraProfile> {
  const payload = await profileRequest<{ profile: OraProfile }>('profile', { method: 'GET' });
  return payload.profile;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<OraProfile> {
  const payload = await profileRequest<{ profile: OraProfile }>('update-profile', { method: 'POST', body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' } });
  return payload.profile;
}

export async function changeProfilePin(input: ChangePinInput): Promise<void> {
  await profileRequest('change-pin', { method: 'POST', body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' } });
}

export async function uploadProfileAvatar(upload: AvatarUpload): Promise<OraProfile> {
  const formData = new FormData();
  const nativeFile = { name: upload.name, type: upload.mimeType, uri: upload.uri } as unknown as Blob;
  formData.append('avatar', upload.file ?? nativeFile, upload.name);
  const payload = await profileRequest<{ profile: OraProfile }>('upload-avatar', { method: 'POST', body: formData });
  return payload.profile;
}

export async function removeProfileAvatar(): Promise<OraProfile> {
  const payload = await profileRequest<{ profile: OraProfile }>('remove-avatar', { method: 'POST' });
  return payload.profile;
}

export async function getProfileStatistics(): Promise<ProfileStatistics> {
  const payload = await profileRequest<ProfileStatistics | { statistics: ProfileStatistics }>('profile-statistics', { method: 'GET' });
  return 'statistics' in payload ? payload.statistics : payload;
}

/**
 * Returns the authenticated user's currently active gaming session.
 * Returns null when no session is active and requires the stored ORA session token.
 */
export async function getCurrentGamingSession(): Promise<GamingSession | null> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ session: GamingSession | null }>(`${ORA_API_URL}?action=current-session`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return payload.session;
}

/**
 * Activates a reception-assigned scheduled session using server time.
 * Returns the authoritative active session; no client timestamps are generated or applied optimistically.
 */
export async function activateGamingSession(sessionId: string): Promise<GamingSession> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ session: GamingSession }>(`${ORA_API_URL}?action=activate-session`, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return payload.session;
}

/**
 * Returns the authenticated user's completed or cancelled gaming-session history.
 * The full collection is fetched once so PC/Xbox filters can be applied locally without extra requests.
 */
export async function getGamingSessionHistory(filter: SessionHistoryFilter = 'all'): Promise<GamingSessionHistoryItem[]> {
  const token = await getRequiredSessionToken();
  const payload = await request<
    GamingSessionHistoryItem[] | { sessions?: GamingSessionHistoryItem[]; history?: GamingSessionHistoryItem[]; items?: GamingSessionHistoryItem[] }
  >(`${ORA_API_URL}?action=session-history&filter=${encodeURIComponent(filter)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (Array.isArray(payload)) return payload;
  return payload.sessions ?? payload.history ?? payload.items ?? [];
}

/** Submits a server-priced extension request for reception approval without changing the local timer. */
export async function requestSessionExtension(gamingSessionId: string, requestedMinutes: number): Promise<SessionExtensionRequest> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ request: SessionExtensionRequest }>(`${ORA_API_URL}?action=request-session-extension`, {
    method: 'POST',
    body: JSON.stringify({ gamingSessionId, requestedMinutes }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return payload.request;
}

/** Returns the server-owned extension request for a gaming session, or null when none exists. */
export async function getSessionExtensionRequest(gamingSessionId: string): Promise<SessionExtensionRequest | null> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ request: SessionExtensionRequest | null }>(
    `${ORA_API_URL}?action=session-extension-request&gamingSessionId=${encodeURIComponent(gamingSessionId)}`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  );
  return payload.request;
}

/** Returns persistent in-app notifications for the authenticated ORA user. */
export async function getNotifications(limit = 50): Promise<OraNotification[]> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ notifications: OraNotification[] }>(`${NOTIFICATIONS_API_URL}?action=list&limit=${limit}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return payload.notifications;
}

/** Returns the authoritative unread notification count used by the Home bell. */
export async function getUnreadNotificationCount(): Promise<number> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ unreadCount?: number | string; count?: number | string }>(`${NOTIFICATIONS_API_URL}?action=unread-count`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const unreadCount = Number(payload.unreadCount ?? payload.count ?? 0);
  return Number.isFinite(unreadCount) ? Math.max(0, unreadCount) : 0;
}

/** Marks one persistent notification as read. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const token = await getRequiredSessionToken();
  await request(`${NOTIFICATIONS_API_URL}?action=mark-read`, {
    method: 'POST',
    body: JSON.stringify({ notificationId }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

/** Marks every notification belonging to the authenticated user as read. */
export async function markAllNotificationsRead(): Promise<void> {
  const token = await getRequiredSessionToken();
  await request(`${NOTIFICATIONS_API_URL}?action=mark-all-read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Returns the authenticated user's server-authoritative points transaction sum. */
export async function getPointsBalance(): Promise<PointsBalance> {
  const token = await getRequiredSessionToken();
  return request<PointsBalance>(`${ORA_API_URL}?action=points-balance`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Returns the authenticated user's points transactions, newest first. */
export async function getPointsHistory(): Promise<PointsTransaction[]> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ transactions: PointsTransaction[] }>(`${ORA_API_URL}?action=points-history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return payload.transactions;
}

/**
 * Returns reception-controlled device availability when that API becomes available.
 * Device cards currently consume isolated beta data and remain mounted for every status.
 */
export async function getDeviceAvailability(): Promise<DeviceAvailability[]> {
  throw new BackendFeatureUnavailableError('Device availability');
}

/** Creates a party for one gaming session. The backend owns unique join-code generation. */
export async function createSessionParty(gamingSessionId: string): Promise<SessionParty> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ party: SessionParty }>(`${ORA_API_URL}?action=create-party`, {
    method: 'POST',
    body: JSON.stringify({ gamingSessionId }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return payload.party;
}

export async function getPartyForGamingSession(gamingSessionId: string): Promise<SessionParty | null> {
  const token = await getRequiredSessionToken();
  const payload = await request<{ party: SessionParty | null }>(
    `${ORA_API_URL}?action=party-for-session&gamingSessionId=${encodeURIComponent(gamingSessionId)}`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  );
  return payload.party;
}

export async function joinPartyByCode(joinCode: string): Promise<SessionParty> {
  requirePartyJoinApi();
  const normalizedCode = normalizePartyCode(joinCode);
  if (!isValidPartyCode(normalizedCode)) throw new BackendError('INVALID_PARTY_CODE', 400);
  const token = await getRequiredSessionToken();
  try {
    const payload = await request<{ party: SessionParty }>(`${ORA_API_URL}?action=join-party`, {
      method: 'POST',
      body: JSON.stringify({ joinCode: normalizedCode }),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return payload.party;
  } catch (error) {
    if (__DEV__ && error instanceof BackendError) {
      console.debug('[party-join] request failed', { code: error.message, status: error.status });
    }
    throw error;
  }
}

export async function leaveSessionParty(partyId: string): Promise<void> {
  requirePartyJoinApi();
  const token = await getRequiredSessionToken();
  await request(`${ORA_API_URL}?action=leave-party`, {
    method: 'POST',
    body: JSON.stringify({ partyId }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

export async function getPartyMembers(partyId: string): Promise<PartyMember[]> {
  requirePartyJoinApi();
  const token = await getRequiredSessionToken();
  const payload = await request<{ members: PartyMember[] }>(
    `${ORA_API_URL}?action=party-members&partyId=${encodeURIComponent(partyId)}`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  );
  return payload.members;
}
