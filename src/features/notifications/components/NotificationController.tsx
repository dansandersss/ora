import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InAppNotificationBanner } from '@/features/notifications/components/InAppNotificationBanner';
import { notificationQueryKeys, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/use-notifications';
import type { DisplayNotification } from '@/features/notifications/utils';
import { openNotificationDestination } from '@/features/notifications/utils';
import { getOraPreferences } from '@/lib/preferences';

const BANNER_DURATION_MS = 4_200;

/** Establishes an initial ID baseline, then queues only notifications first observed during this app session. */
export function NotificationController({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const knownIds = useRef<Set<string> | null>(null);
  const queuedIds = useRef(new Set<string>());
  const [queue, setQueue] = useState<DisplayNotification[]>([]);
  const [bannersEnabled, setBannersEnabled] = useState(true);
  const activeNotification = queue[0] ?? null;
  const notificationsScreenVisible = pathname === '/notifications';

  useEffect(() => {
    getOraPreferences().then((preferences) => setBannersEnabled(preferences.inAppNotificationsEnabled)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const notifications = notificationsQuery.data;
    if (!notifications) return;
    const currentIds = new Set(notifications.flatMap((notification) => notification.sourceIds));
    if (knownIds.current === null) {
      knownIds.current = currentIds;
      return;
    }
    const fresh = notifications.filter((notification) => notification.sourceIds.some((id) => !knownIds.current?.has(id)));
    currentIds.forEach((id) => knownIds.current?.add(id));
    if (!bannersEnabled || notificationsScreenVisible || fresh.length === 0) return;
    const enqueue = fresh.filter((notification) => !queuedIds.current.has(notification.id));
    enqueue.forEach((notification) => queuedIds.current.add(notification.id));
    if (enqueue.length) setQueue((current) => [...current, ...enqueue]);
  }, [bannersEnabled, notificationsQuery.data, notificationsScreenVisible]);

  useEffect(() => {
    if (!activeNotification) return;
    const timeout = setTimeout(() => {
      queuedIds.current.delete(activeNotification.id);
      setQueue((current) => current.slice(1));
    }, BANNER_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [activeNotification]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [queryClient]);

  const openBanner = () => {
    if (!activeNotification) return;
    if (!activeNotification.isRead) markRead.mutate(activeNotification.sourceIds);
    queuedIds.current.delete(activeNotification.id);
    setQueue((current) => current.slice(1));
    openNotificationDestination(activeNotification);
  };

  return (
    <View className="flex-1">
      {children}
      {activeNotification && !notificationsScreenVisible ? (
        <View
          className="absolute inset-x-4"
          pointerEvents="box-none"
          style={{ elevation: 50, top: insets.top + 10, zIndex: 1200 }}>
          <InAppNotificationBanner key={activeNotification.id} notification={activeNotification} onPress={openBanner} />
        </View>
      ) : null}
    </View>
  );
}
