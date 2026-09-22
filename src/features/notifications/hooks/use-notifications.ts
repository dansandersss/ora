import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { OraNotification } from '@/features/notifications/types';
import { normalizeNotifications } from '@/features/notifications/utils';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from '@/lib/backend';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryFn: () => getNotifications(50),
    queryKey: notificationQueryKeys.all,
    refetchInterval: 20_000,
    refetchOnReconnect: true,
    select: normalizeNotifications,
  });
  useEffect(() => {
    if (!query.data) return;
    queryClient.setQueryData(notificationQueryKeys.unreadCount, query.data.filter((item) => !item.isRead).length);
  }, [query.data, queryClient]);
  return query;
}

/** Polls gently for persistent unread state so the Home bell can react without push delivery. */
export function useUnreadNotificationCount() {
  return useQuery({
    queryFn: getUnreadNotificationCount,
    queryKey: notificationQueryKeys.unreadCount,
    refetchInterval: 20_000,
    refetchOnReconnect: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationIds: string[]) => Promise.all(notificationIds.map(markNotificationRead)),
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousNotifications = queryClient.getQueryData<OraNotification[]>(notificationQueryKeys.all);
      const previousUnreadCount = queryClient.getQueryData<number>(notificationQueryKeys.unreadCount);
      const wasUnread = previousNotifications?.some((item) => notificationIds.includes(item.id) && !item.isRead) ?? false;
      queryClient.setQueryData<OraNotification[]>(notificationQueryKeys.all, (current = []) => current.map((item) => (
        notificationIds.includes(item.id) ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() } : item
      )));
      if (wasUnread) queryClient.setQueryData<number>(notificationQueryKeys.unreadCount, (current = 0) => Math.max(0, current - 1));
      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) queryClient.setQueryData(notificationQueryKeys.all, context.previousNotifications);
      if (context?.previousUnreadCount !== undefined) queryClient.setQueryData(notificationQueryKeys.unreadCount, context.previousUnreadCount);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
      ]);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousNotifications = queryClient.getQueryData<OraNotification[]>(notificationQueryKeys.all);
      const previousUnreadCount = queryClient.getQueryData<number>(notificationQueryKeys.unreadCount);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<OraNotification[]>(notificationQueryKeys.all, (current = []) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? readAt })));
      queryClient.setQueryData(notificationQueryKeys.unreadCount, 0);
      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) queryClient.setQueryData(notificationQueryKeys.all, context.previousNotifications);
      if (context?.previousUnreadCount !== undefined) queryClient.setQueryData(notificationQueryKeys.unreadCount, context.previousUnreadCount);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
      ]);
    },
  });
}
