import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { PointsHistoryItem } from '@/features/points/components/PointsHistoryItem';
import { usePointsHistory } from '@/features/points/hooks/use-points';
import { groupPointsTransactions } from '@/features/points/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';

export function PointsHistoryScreen() {
  const historyQuery = usePointsHistory();
  const groups = groupPointsTransactions(historyQuery.data ?? []);
  return (
    <AppScreen>
      <AmbientGoldGlow />
      <ScrollView contentContainerClassName="pb-10 pt-4" showsVerticalScrollIndicator={false}>
        <AppContent>
          <SessionHeader backLabel="Înapoi la puncte" onBack={() => router.replace('/points')} title="Istoric puncte" titleSize="compact" />
          {historyQuery.isLoading ? <View className="mt-20 items-center"><ActivityIndicator color="#C9A24B" /></View> : null}
          {historyQuery.isError ? (
            <View className="mt-20 items-center rounded-[28px] border border-ora-error/30 bg-ora-surface px-6 py-10">
              <Text className="text-center font-inter-semibold text-lg text-ora-primary">Istoricul punctelor nu a putut fi încărcat.</Text>
              <PremiumPressable accessibilityLabel="Reîncearcă încărcarea istoricului" onPress={() => historyQuery.refetch()}><Text className="mt-4 px-5 py-3 font-inter-semibold text-ora-gold">Reîncearcă</Text></PremiumPressable>
            </View>
          ) : null}
          {historyQuery.isSuccess && groups.length === 0 ? (
            <View className="mt-20 items-center rounded-[28px] border border-white/10 bg-ora-surface px-7 py-12">
              <Text className="text-center font-inter-semibold text-xl text-ora-primary">Nu ai încă istoric de puncte.</Text>
              <Text className="mt-2 text-center font-inter text-sm text-ora-secondary">Activitatea ta ORA va apărea aici.</Text>
            </View>
          ) : null}
          {groups.map((group) => <View className="mt-12" key={group.month}><Text className="mb-5 font-inter-medium text-lg text-ora-secondary">{group.month}</Text>{group.items.map((transaction, index) => <PointsHistoryItem index={index} key={transaction.id} transaction={transaction} />)}</View>)}
        </AppContent>
      </ScrollView>
    </AppScreen>
  );
}
