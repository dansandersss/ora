import { router } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/use-notifications';
import { consumeNotificationReturnRoute } from '@/features/notifications/navigation';
import type { DisplayNotification } from '@/features/notifications/utils';
import { openNotificationDestination } from '@/features/notifications/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { colors } from '@/theme/tokens';

export function NotificationsScreen() {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = [...(notificationsQuery.data ?? [])].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const hasUnread = notifications.some((item) => !item.isRead);
  const localizedDate = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const today = localizedDate.charAt(0).toUpperCase() + localizedDate.slice(1);

  const returnToPreviousScreen = () => {
    router.replace(consumeNotificationReturnRoute());
  };

  const openNotification = (notification: DisplayNotification) => {
    if (!notification.isRead) markRead.mutate(notification.sourceIds);
    openNotificationDestination(notification);
  };

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView className="flex-1" contentContainerClassName="pb-10 pt-4" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi"
                onBack={returnToPreviousScreen}
                onRightPress={hasUnread && !markAllRead.isPending ? () => markAllRead.mutate() : undefined}
                rightAccessibilityLabel="Marchează toate notificările ca citite"
                rightContent={hasUnread ? <CheckCheck color={colors.gold} size={23} /> : null}
                title="Notificări"
                titleParts={[{ text: 'Notific' }, { text: 'ări', color: colors.gold }]}
                subtitle={today}
              />
            </Entrance>

            {notificationsQuery.isPending ? (
              <View className="mt-12 h-32 items-center justify-center"><ActivityIndicator color={colors.gold} /></View>
            ) : notificationsQuery.isError ? (
              <GlassSurface className="mt-8" radius={24}>
                <View className="items-center px-6 py-8">
                  <Text className="text-center font-inter-semibold text-base text-ora-primary">Notificările nu au putut fi încărcate.</Text>
                  <PremiumPressable accessibilityLabel="Reîncearcă încărcarea notificărilor" onPress={() => notificationsQuery.refetch()}><Text className="mt-3 px-5 py-3 font-inter-semibold text-sm text-ora-gold">Reîncearcă</Text></PremiumPressable>
                </View>
              </GlassSurface>
            ) : notifications.length === 0 ? (
              <Entrance delay={70} depth>
                <GlassSurface className="mt-8" radius={24}>
                  <View className="items-center px-7 py-10">
                    <View className="h-14 w-14 items-center justify-center rounded-[17px] bg-ora-gold/15"><Bell color={colors.gold} size={27} /></View>
                    <Text className="mt-5 text-center font-inter-semibold text-xl text-ora-primary">Nu ai notificări</Text>
                    <Text className="mt-2 text-center font-inter text-sm leading-5 text-ora-secondary">Notificările importante despre sesiunile tale vor apărea aici.</Text>
                  </View>
                </GlassSurface>
              </Entrance>
            ) : (
              <View className="mt-7">
                {notifications.map((notification, index) => <NotificationItem index={index} key={notification.id} notification={notification} onPress={() => openNotification(notification)} />)}
              </View>
            )}
            {markAllRead.isError ? <Text className="mt-2 text-center font-inter text-sm text-ora-error">Notificările nu au putut fi marcate. Încearcă din nou.</Text> : null}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
