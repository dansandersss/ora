import { useQuery } from '@tanstack/react-query';

import type { SessionHistoryFilter } from '@/features/sessions/types';
import { getGamingSessionHistory } from '@/lib/backend';

export const gamingSessionHistoryQueryKeys = {
  all: ['gaming-sessions', 'history'] as const,
  filtered: (filter: SessionHistoryFilter) => ['gaming-sessions', 'history', filter] as const,
};

/** Fetches completed/cancelled sessions using the backend's matching history filter. */
export function useGamingSessionHistory(filter: SessionHistoryFilter = 'all') {
  return useQuery({
    queryFn: () => getGamingSessionHistory(filter),
    queryKey: gamingSessionHistoryQueryKeys.filtered(filter),
    staleTime: 60_000,
  });
}
