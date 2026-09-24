import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import GiftIcon from '@/../assets/images/gift.svg';
import StarIcon from '@/../assets/images/star.svg';
import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { PointsRuleRow } from '@/features/points/components/PointsRuleRow';
import { pointsRules } from '@/features/points/data/points-rules';
import { usePointsBalance } from '@/features/points/hooks/use-points';
import { HistoryActionIcon } from '@/features/sessions/components/HistoryActionIcon';

function PointsHeader() {
  const date = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const today = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <View className="flex-row items-center justify-between py-2">
      <View>
        <View accessible accessibilityLabel="ORA Points" className="flex-row items-center">
          <Text accessible={false} className="font-inter-semibold text-lg text-ora-primary">ORA </Text>
          <GoldGradientText accessible={false} className="font-inter-semibold text-lg">Points</GoldGradientText>
        </View>
        <Text className="mt-0.5 font-inter text-xs text-ora-secondary">{today}</Text>
      </View>
      <PremiumPressable accessibilityLabel="Istoric puncte" onPress={() => router.navigate('/points/history')}>
        <GlassSurface
          radius={15}
          intensity={18}
          fillColor="rgba(255,255,255,0.05)"
          borderColor="rgba(226,158,62,0.34)"
          shadowStyle={{ boxShadow: '0 6px 16px rgba(0,0,0,0.20)' }}>
          <View className="h-11 w-11 items-center justify-center"><HistoryActionIcon size={24} /></View>
        </GlassSurface>
      </PremiumPressable>
    </View>
  );
}

export function PointsScreen() {
  const balanceQuery = usePointsBalance();
  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView contentContainerClassName="pb-[112px] pt-4" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance><PointsHeader /></Entrance>

            <Entrance delay={70} depth>
              <View className="mt-[28px] flex-row gap-3">
                <View className="min-w-0 flex-1">
                  <GlassSurface
                    radius={20}
                    intensity={20}
                    fillColor="rgba(255,255,255,0.052)"
                    borderColor="rgba(226,158,62,0.42)"
                    shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.20)' }}>
                    <View className="h-[130px] px-4 py-4">
                      <View className="h-9 w-9 p-2 items-center justify-center rounded-[9px] border border-ora-gold/35 bg-ora-gold/15">
                        <StarIcon height={16} width={16} />
                      </View>
                      {balanceQuery.isLoading ? (
                        <View className="flex-1 items-start justify-center"><ActivityIndicator color="#E29E3E" size="small" /></View>
                      ) : balanceQuery.isError || !balanceQuery.data ? (
                        <Text className="mt-3 font-inter text-xs leading-4 text-ora-secondary">Punctele nu au putut fi încărcate.</Text>
                      ) : (
                        <View className="mt-3">
                          <View className="flex-row items-baseline">
                            <Text className="max-w-[78%] font-inter-semibold text-[29px] leading-8 text-ora-primary" numberOfLines={1}>{balanceQuery.data.balance}</Text>
                            <Text className="ml-1.5 font-inter-bold text-[29px] leading-8 text-ora-gold">P</Text>
                          </View>
                          <Text className="mt-1 font-inter text-xs text-ora-secondary">Total puncte active</Text>
                        </View>
                      )}
                    </View>
                  </GlassSurface>
                </View>

                <View className="min-w-0 flex-1" style={{ opacity: 0.48 }}>
                  <GlassSurface
                    radius={20}
                    intensity={18}
                    fillColor="rgba(255,255,255,0.035)"
                    borderColor="rgba(226,158,62,0.28)">
                    <View accessibilityLabel="Recompense, disponibile în curând" className="h-[130px] px-4 py-4">
                      <View className="h-9 w-9 items-center p-2 justify-center rounded-[9px] border border-ora-gold/25 bg-ora-gold/10">
                        <GiftIcon height={16} width={16} />
                      </View>
                      <View className="mt-[22px]">
                          <Text className="font-inter-medium text-lg" numberOfLines={1}>
                              <Text className="text-ora-primary">Recom</Text>
                              <Text className="text-ora-gold">pense</Text>
                          </Text>
                        <Text className="mt-1 font-inter text-xs text-ora-secondary">Coming soon</Text>
                      </View>
                    </View>
                  </GlassSurface>
                </View>
              </View>
            </Entrance>

            <Entrance delay={140}>
              <Text className="mb-[14px] mt-[48px] font-inter-medium text-[21px] leading-[26px] text-ora-primary">Cum câștigi puncte?</Text>
              <View className="gap-2.5">
                {pointsRules.map((rule) => <PointsRuleRow key={rule.id} label={rule.label} points={rule.points} />)}
              </View>
            </Entrance>
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
