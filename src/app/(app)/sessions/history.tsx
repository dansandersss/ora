import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { SessionHistory } from '@/features/sessions/components/SessionHistory';

export default function SessionHistoryRoute() {
  const date = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const today = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView contentContainerClassName="pb-[112px] pt-4" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la sesiuni"
                onBack={() => router.replace('/sessions')}
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
