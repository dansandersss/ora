import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { PointsHistoryItem } from '@/features/points/components/PointsHistoryItem';
import { usePointsHistory } from '@/features/points/hooks/use-points';
import { groupPointsTransactions } from '@/features/points/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';

export function PointsHistoryScreen() {
  const historyQuery = usePointsHistory();
  const groups = groupPointsTransactions(historyQuery.data ?? []);
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
                backLabel="Înapoi la puncte"
                onBack={() => router.replace('/points')}
                title="Istoric puncte"
                titleParts={[{ text: 'Istoric ' }, { text: 'puncte', gradient: true }]}
                titleSize="compact"
                subtitle={today}
              />
            </Entrance>

            {historyQuery.isLoading ? <View className="mt-20 items-center"><ActivityIndicator color="#E29E3E" /></View> : null}
            {historyQuery.isError ? (
              <GlassSurface className="mt-20" radius={22} borderColor="rgba(224,140,125,0.36)">
                <View className="items-center px-6 py-10">
                  <Text className="text-center font-inter-semibold text-lg text-ora-primary">Istoricul punctelor nu a putut fi încărcat.</Text>
                  <PremiumPressable accessibilityLabel="Reîncearcă încărcarea istoricului" onPress={() => historyQuery.refetch()}>
                    <Text className="mt-4 px-5 py-3 font-inter-semibold text-ora-gold">Reîncearcă</Text>
                  </PremiumPressable>
                </View>
              </GlassSurface>
            ) : null}
            {historyQuery.isSuccess && groups.length === 0 ? (
              <GlassSurface className="mt-20" radius={22}>
                <View className="items-center px-7 py-12">
                  <Text className="text-center font-inter-semibold text-xl text-ora-primary">Nu ai încă istoric de puncte.</Text>
                  <Text className="mt-2 text-center font-inter text-sm text-ora-secondary">Activitatea ta ORA va apărea aici.</Text>
                </View>
              </GlassSurface>
            ) : null}
            {groups.map((group) => (
              <Entrance delay={70} key={group.month}>
                <View className="mt-[30px]">
                  <Text className="mb-[14px] font-inter-medium text-lg text-ora-primary">{group.month}</Text>
                  {group.items.map((transaction, index) => <PointsHistoryItem index={index} key={transaction.id} transaction={transaction} />)}
                </View>
              </Entrance>
            ))}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
