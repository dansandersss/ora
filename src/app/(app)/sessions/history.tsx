import { router, useNavigation } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { SessionHistory } from '@/features/sessions/components/SessionHistory';
import { consumeSessionHistoryReturnRoute } from '@/features/sessions/history-navigation';

export default function SessionHistoryRoute() {
  const navigation = useNavigation();
  const date = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const today = date.charAt(0).toUpperCase() + date.slice(1);
  const returnFromHistory = () => {
    const destination = consumeSessionHistoryReturnRoute();
    if (destination === 'profile') {
      const tabsNavigation = navigation.getParent();
      if (tabsNavigation) tabsNavigation.navigate('profile' as never);
      else router.replace('/profile');
      return;
    }
    router.replace('/sessions');
  };

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView contentContainerClassName="pb-[112px] pt-4" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la sesiuni"
                onBack={returnFromHistory}
                title="Istoric sesiuni"
                titleParts={[{ text: 'Istoric ' }, { text: 'sesiuni', gradient: true }]}
                titleSize="compact"
                subtitle={today}
              />
            </Entrance>
            <Entrance delay={70}>
              <View className="mt-[30px]">
                <SessionHistory showTitle={false} />
              </View>
            </Entrance>
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
