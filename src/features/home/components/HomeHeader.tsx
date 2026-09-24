import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';

import CoolIcon from '@/../assets/images/cool.svg';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useProfile } from '@/features/profile/hooks/use-profile';

type HomeHeaderProps = { onNotificationsPress: () => void };

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  const { data: profile } = useProfile();
  const firstName = profile?.fullName?.trim().split(/\s+/)[0];
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleMidnightRefresh = () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      midnightTimer = setTimeout(() => {
        setCurrentDate(new Date());
        scheduleMidnightRefresh();
      }, Math.max(1_000, nextMidnight.getTime() - Date.now()));
    };
    scheduleMidnightRefresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setCurrentDate(new Date());
        scheduleMidnightRefresh();
      }
    });
    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      subscription.remove();
    };
  }, []);

  const today = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' }).format(currentDate);
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <View className="flex-row items-center justify-between">
      <View>
        <View className="flex-row items-center">
          {firstName ? (
            <View accessible accessibilityLabel={`Salut, ${firstName}!`} className="flex-row items-center">
              <Text accessible={false} className="font-inter-semibold text-xl text-ora-primary">Salut, </Text>
              <GoldGradientText accessible={false} className="font-inter-semibold text-xl">{firstName}!</GoldGradientText>
            </View>
          ) : (
            <Text className="font-inter-semibold text-xl text-ora-primary">Salut!</Text>
          )}
          <View className="ml-2">
            <CoolIcon height={16} width={16} />
          </View>
        </View>
        <Text className="mt-1 font-inter text-xs text-ora-secondary">{formattedDate}</Text>
      </View>
      <NotificationBell onPress={onNotificationsPress} />
    </View>
  );
}
