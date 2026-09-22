import { Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { NotificationSemanticIcon } from '@/features/notifications/components/NotificationSemanticIcon';
import type { OraNotification } from '@/features/notifications/types';
import { formatNotificationTime } from '@/features/notifications/utils';

export function NotificationItem({ index, notification, onPress }: { index: number; notification: OraNotification; onPress: () => void }) {
  return (
    <Entrance delay={Math.min(index, 6) * 35}>
      <PremiumPressable accessibilityLabel={`${notification.title}. ${notification.body}`} onPress={onPress}>
        <GlassSurface
          className="mb-4"
          borderColor="rgba(226,158,62,0.30)"
          fillColor={notification.isRead ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.06)'}
          intensity={18}
          radius={24}
          shadowStyle={{ boxShadow: '0 8px 22px rgba(0,0,0,0.16)' }}>
          <View className="min-h-[96px] flex-row items-center px-4 py-4">
            <View className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-ora-gold/15">
              <NotificationSemanticIcon size={27} type={notification.type} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-start">
                <Text className="mr-2 flex-1 font-inter-semibold text-base text-ora-primary" numberOfLines={2}>{notification.title}</Text>
                {!notification.isRead ? <View className="mt-2 h-2 w-2 rounded-full bg-ora-gold" /> : null}
              </View>
              <Text className="mt-1 font-inter text-sm leading-5 text-ora-secondary" numberOfLines={3}>{notification.body}</Text>
              <Text className="mt-3 font-inter text-xs text-ora-gold">{formatNotificationTime(notification.createdAt)}</Text>
            </View>
          </View>
        </GlassSurface>
      </PremiumPressable>
    </Entrance>
  );
}
