import { Text, View } from 'react-native';
import Animated, { Easing, FadeOutUp, ReduceMotion, SlideInUp } from 'react-native-reanimated';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { NotificationSemanticIcon } from '@/features/notifications/components/NotificationSemanticIcon';
import type { DisplayNotification } from '@/features/notifications/utils';
import { formatNotificationTime } from '@/features/notifications/utils';

export function InAppNotificationBanner({ notification, onPress }: { notification: DisplayNotification; onPress: () => void }) {
  return (
    <Animated.View
      accessible
      accessibilityLabel={`${notification.title}. ${notification.body}`}
      entering={SlideInUp.duration(320).easing(Easing.out(Easing.cubic)).reduceMotion(ReduceMotion.System)}
      exiting={FadeOutUp.duration(220).reduceMotion(ReduceMotion.System)}>
      <PremiumPressable accessibilityLabel={`Deschide notificarea: ${notification.title}`} onPress={onPress}>
        <View
          className="flex-row rounded-2xl border border-ora-gold/30 bg-ora-surface px-4 py-4"
          style={{ boxShadow: '0 10px 26px rgba(0, 0, 0, 0.34)', elevation: 16 }}>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-ora-gold/15">
            <NotificationSemanticIcon type={notification.type} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-inter-semibold text-base text-ora-primary" numberOfLines={1}>{notification.title}</Text>
            <Text className="mt-1 font-inter text-sm leading-5 text-ora-secondary" numberOfLines={2}>{notification.body}</Text>
            <Text className="mt-1 text-right font-inter text-xs text-ora-gold">{formatNotificationTime(notification.createdAt)}</Text>
          </View>
        </View>
      </PremiumPressable>
    </Animated.View>
  );
}
