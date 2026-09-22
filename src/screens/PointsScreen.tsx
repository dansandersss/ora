import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import GiftIcon from '@/../assets/images/gift.svg';
import StarIcon from '@/../assets/images/star.svg';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { PointsRuleRow } from '@/features/points/components/PointsRuleRow';
import { pointsRules } from '@/features/points/data/points-rules';
import { usePointsBalance } from '@/features/points/hooks/use-points';
import { HistoryActionIcon } from '@/features/sessions/components/HistoryActionIcon';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';

export function PointsScreen() {
  const balanceQuery = usePointsBalance();
  return (
    <AppScreen>
      <AmbientGoldGlow />
      <ScrollView contentContainerClassName="pb-24 pt-3" showsVerticalScrollIndicator={false}>
        <AppContent>
          <Entrance>
            <SessionHeader backLabel="Înapoi acasă" onBack={() => router.replace('/home')} onRightPress={() => router.navigate('/points/history')} rightAccessibilityLabel="Istoric puncte" rightContent={<HistoryActionIcon />} title="ORA Points" titleSize="compact" />
          </Entrance>
          <Entrance delay={70} depth>
            <View className="mt-6 flex-row gap-3">
              <View className="min-w-0" style={{ flexBasis: 0, flexGrow: 1.08, height: 144 }}>
                <LinearGradient className="w-full overflow-hidden rounded-[20px] border-[3px] border-ora-gold" colors={['#5A4515', '#3D321B']} style={{ borderRadius: 20, height: 144 }}>
                  <View className="flex-1 items-center justify-center px-4 py-3">
                    <View className="h-10 w-10 items-center justify-center"><StarIcon height={38} width={38} /></View>
                    {balanceQuery.isLoading ? (
                      <View className="mt-2 h-11 justify-center"><ActivityIndicator color="#C9A24B" size="small" /></View>
                    ) : balanceQuery.isError || !balanceQuery.data ? (
                      <Text className="mt-2 text-center font-inter text-xs leading-4 text-ora-secondary">Punctele nu au putut fi încărcate.</Text>
                    ) : (
                      <View className="mt-1 items-center">
                        <View className="flex-row items-baseline justify-center"><Text adjustsFontSizeToFit className="max-w-[78%] font-inter-medium text-[28px] leading-8 text-ora-primary" numberOfLines={1}>{balanceQuery.data.balance}</Text><Text className="ml-1.5 font-inter-medium text-lg text-ora-gold">P</Text></View>
                        <Text className="mt-0.5 font-inter text-xs text-ora-secondary">Total puncte</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </View>
              <View className="min-w-0" style={{ flexBasis: 0, flexGrow: 0.92, height: 144 }}>
                <View accessibilityLabel="Recompense, disponibile în curând" className="w-full items-center justify-center rounded-[20px] border-2 border-ora-divider bg-ora-surface/25 px-3 py-3 opacity-50" style={{ height: 144 }}>
                  <View className="h-10 w-10 items-center justify-center"><GiftIcon height={38} width={38} /></View>
                  <View className="mt-2 items-center"><Text className="font-inter-medium text-sm text-ora-secondary" numberOfLines={1}>Recompense</Text><Text className="mt-0.5 font-inter text-xs text-ora-secondary/70">Coming soon</Text></View>
                </View>
              </View>
            </View>
          </Entrance>
          <Text className="mb-3 mt-7 font-inter-medium text-lg text-ora-primary">Cum câștigi puncte?</Text>
          <View className="gap-2">{pointsRules.map((rule) => <PointsRuleRow key={rule.id} label={rule.label} points={rule.points} />)}</View>
        </AppContent>
      </ScrollView>
    </AppScreen>
  );
}
