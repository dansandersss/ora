import type { Href } from 'expo-router';

import { AuthApiError } from '@/features/auth/errors';
import { getCurrentUser, logout } from '@/features/auth/api/auth-api';
import { sessionStorage } from '@/features/auth/session/session-storage';
import type { AuthSession } from '@/features/auth/types';
import { queryClient } from '@/lib/query-client';

export const authQueryKeys = {
  currentUser: ['auth', 'current-user'] as const,
  session: ['auth', 'session'] as const,
};

export const POST_LOGIN_ROUTE: Href = '/home';

export async function persistSession(session: AuthSession) {
  await sessionStorage.setToken(session.sessionToken);
  queryClient.setQueryData(authQueryKeys.session, session);
  queryClient.setQueryData(authQueryKeys.currentUser, session.user);
}

export async function restoreSession() {
  const token = await sessionStorage.getToken();
  if (!token) return null;
  try {
    const user = await getCurrentUser(token);
    queryClient.setQueryData(authQueryKeys.currentUser, user);
    return user;
  } catch (error) {
    if (!(error instanceof AuthApiError) || (error.status !== 401 && error.status !== 403)) {
      throw error;
    }
    await sessionStorage.removeToken();
    queryClient.removeQueries({ queryKey: authQueryKeys.session });
    queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    return null;
  }
}

export async function clearSession() {
  const token = await sessionStorage.getToken();
  try {
    if (token) await logout(token);
  } finally {
    await sessionStorage.removeToken();
    queryClient.removeQueries({ queryKey: authQueryKeys.session });
    queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
  }
}
