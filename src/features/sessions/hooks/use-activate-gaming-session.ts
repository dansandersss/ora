import { useMutation, useQueryClient } from '@tanstack/react-query';

import { gamingSessionQueryKeys } from '@/features/sessions/hooks/use-current-gaming-session';
import type { GamingSession } from '@/features/sessions/types';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';
import { activateGamingSession } from '@/lib/backend';

/**
 * Activates a scheduled session and publishes only the backend-confirmed session to React Query.
 * This avoids optimistic timer state because activation timestamps are server-owned.
 */
export function useActivateGamingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateGamingSession,
    onSuccess: (session) => {
      queryClient.setQueryData<GamingSession | null>(gamingSessionQueryKeys.current, session);
      queryClient.invalidateQueries({ queryKey: gamingSessionQueryKeys.current }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }).catch(() => undefined);
    },
  });
}
