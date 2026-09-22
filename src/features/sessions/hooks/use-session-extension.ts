import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { gamingSessionQueryKeys } from '@/features/sessions/hooks/use-current-gaming-session';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';
import type { SessionExtensionRequest } from '@/features/sessions/types';
import { BackendError, getSessionExtensionRequest, requestSessionExtension } from '@/lib/backend';

export const sessionExtensionQueryKeys = {
  bySession: (sessionId: string) => ['session-extension-request', sessionId] as const,
};

function retryTransientFailure(failureCount: number, error: Error) {
  if (failureCount >= 2) return false;
  return !(error instanceof BackendError) || error.status === undefined || error.status >= 500;
}

export function useSessionExtensionRequest(sessionId: string) {
  return useQuery({
    enabled: Boolean(sessionId),
    queryFn: () => getSessionExtensionRequest(sessionId),
    queryKey: sessionExtensionQueryKeys.bySession(sessionId),
    refetchInterval: (query) => query.state.data?.status === 'pending' ? 7_000 : false,
    refetchOnReconnect: true,
    retry: retryTransientFailure,
  });
}

export function useRequestSessionExtension(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestedMinutes: number) => requestSessionExtension(sessionId, requestedMinutes),
    onSuccess: async (request) => {
      queryClient.setQueryData<SessionExtensionRequest | null>(sessionExtensionQueryKeys.bySession(sessionId), request);
      if (request.status === 'approved') await queryClient.invalidateQueries({ queryKey: gamingSessionQueryKeys.current });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
    retry: false,
  });
}
