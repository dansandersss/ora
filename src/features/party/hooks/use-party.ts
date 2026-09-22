import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SessionParty } from '@/features/party/types';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';
import { createSessionParty, getPartyForGamingSession, getPartyPreview, isPartyJoinApiEnabled, joinPartyByCode } from '@/lib/backend';

export const partyQueryKeys = {
  forSession: (sessionId: string) => ['party', 'session', sessionId] as const,
  preview: (code: string) => ['party', 'preview', code] as const,
};

export function usePartyForSession(sessionId: string) {
  return useQuery({
    enabled: Boolean(sessionId),
    queryFn: () => getPartyForGamingSession(sessionId),
    queryKey: partyQueryKeys.forSession(sessionId),
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useCreateParty(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createSessionParty(sessionId),
    onSuccess: async (party) => {
      queryClient.setQueryData<SessionParty | null>(partyQueryKeys.forSession(sessionId), party);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partyQueryKeys.forSession(sessionId) }),
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
      ]);
    },
    retry: false,
  });
}

export function usePartyPreview(code: string, enabled = true) {
  return useQuery({
    enabled: isPartyJoinApiEnabled && enabled && code.length === 9,
    queryFn: () => getPartyPreview(code),
    queryKey: partyQueryKeys.preview(code),
    retry: false,
  });
}

export function useJoinParty(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinPartyByCode(code),
    onSuccess: (party) => {
      party.members.forEach((member) => {
        queryClient.setQueryData(partyQueryKeys.forSession(member.gamingSessionId), party);
      });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }).catch(() => undefined);
    },
    retry: false,
  });
}
