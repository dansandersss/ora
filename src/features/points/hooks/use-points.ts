import { useQuery } from '@tanstack/react-query';

import { getPointsBalance, getPointsHistory } from '@/lib/backend';

export const pointsQueryKeys = {
  balance: ['points', 'balance'] as const,
  history: ['points', 'history'] as const,
};

export function usePointsBalance() {
  return useQuery({ queryFn: getPointsBalance, queryKey: pointsQueryKeys.balance, retry: false });
}

export function usePointsHistory() {
  return useQuery({ queryFn: getPointsHistory, queryKey: pointsQueryKeys.history, retry: false });
}
