import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { gamingSessionQueryKeys } from '@/features/sessions/hooks/use-current-gaming-session';
import { gamingSessionHistoryQueryKeys } from '@/features/sessions/hooks/use-gaming-session-history';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';
import { pointsQueryKeys } from '@/features/points/hooks/use-points';

/** Invalidates both current-session and history caches after backend-authoritative expiration. */
export function useSessionExpiration(afterRefresh?: () => void) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: gamingSessionQueryKeys.current }).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: gamingSessionHistoryQueryKeys.all }).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: pointsQueryKeys.balance }).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: pointsQueryKeys.history }).catch(() => undefined);
    afterRefresh?.();
  }, [afterRefresh, queryClient]);
}
