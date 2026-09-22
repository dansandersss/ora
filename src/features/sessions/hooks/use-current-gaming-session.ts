import { useQuery } from '@tanstack/react-query';

import { getCurrentGamingSession } from '@/lib/backend';

export const gamingSessionQueryKeys = {
  current: ['gaming-session', 'current'] as const,
};

/** Fetches the authenticated user's server-authoritative active gaming session. */
export function useCurrentGamingSession() {
  return useQuery({
    queryFn: getCurrentGamingSession,
    queryKey: gamingSessionQueryKeys.current,
    refetchInterval: 30_000,
    refetchOnReconnect: true,
  });
}
