import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import NotificationsIcon from '@/../assets/images/bell-dot.svg';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { useNotifications, useUnreadNotificationCount } from '@/features/notifications/hooks/use-notifications';

type NotificationBellProps = { onPress: () => void };

function shakeBell(rotation: SharedValue<number>) {
  rotation.value = withSequence(
    withTiming(-6, { duration: 90, reduceMotion: ReduceMotion.System }),
    withTiming(6, { duration: 100, reduceMotion: ReduceMotion.System }),
    withTiming(-3, { duration: 85, reduceMotion: ReduceMotion.System }),
    withTiming(3, { duration: 85, reduceMotion: ReduceMotion.System }),
    withSpring(0, { damping: 13, stiffness: 230, reduceMotion: ReduceMotion.System }),
  );
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const unreadQuery = useUnreadNotificationCount();
  const notificationsQuery = useNotifications();
  const listUnreadCount = notificationsQuery.data?.filter((notification) => !notification.isRead).length ?? 0;
  const unreadCount = Math.max(unreadQuery.data ?? 0, listUnreadCount);
  const previousCount = useRef<number | null>(null);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (previousCount.current !== null && unreadCount > previousCount.current) shakeBell(rotation);
    previousCount.current = unreadCount;
  }, [rotation, unreadCount]);

  useEffect(() => {
    if (unreadCount <= 0) return;
    const interval = setInterval(() => shakeBell(rotation), 10_000);
    return () => clearInterval(interval);
  }, [rotation, unreadCount]);

  const bellStyle = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${rotation.value}deg` }] }));
  const label = unreadCount > 0 ? `Notificări, ${unreadCount} necitite` : 'Notificări';

  return (
    <PremiumPressable accessibilityLabel={label} className="h-12 w-12" onPress={onPress}>
      <GlassSurface
        borderColor="rgba(226,158,62,0.32)"
        fillColor="rgba(255,255,255,0.05)"
        intensity={18}
        radius={16}
        shadowStyle={{ boxShadow: '0 5px 14px rgba(0,0,0,0.18)' }}>
        <View className="relative h-12 w-12 items-center justify-center">
          <Animated.View style={bellStyle}><NotificationsIcon height={20} width={20} /></Animated.View>
        </View>
      </GlassSurface>
      {unreadCount > 0 ? (
        <View
          className="absolute h-[10px] w-[10px] rounded-full border-2 border-ora-background"
          pointerEvents="none"
          style={{ backgroundColor: '#F05B57', boxShadow: '0 0 8px rgba(240, 91, 87, 0.9)', elevation: 20, position: 'absolute', right: 2, top: 2, zIndex: 20 }}
        />
      ) : null}
    </PremiumPressable>
  );
}
