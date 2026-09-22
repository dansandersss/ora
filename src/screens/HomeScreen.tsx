import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { AppContent, AppScreen, useAppLayout } from '@/components/layout/AppScreen';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import { CurrentSessionCard } from '@/features/home/components/CurrentSessionCard';
import { DeviceCard } from '@/features/home/components/DeviceCard';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeHeroCard } from '@/features/home/components/HomeHeroCard';
import { PointsCard } from '@/features/home/components/PointsCard';
import { ReceptionTimeModal } from '@/features/home/components/ReceptionTimeModal';
import { mockDevices } from '@/features/home/data/mock-devices';
import type { DeviceAvailability } from '@/features/home/types';
import { setNotificationReturnRoute } from '@/features/notifications/navigation';
import { usePointsBalance } from '@/features/points/hooks/use-points';
import { useActivateGamingSession } from '@/features/sessions/hooks/use-activate-gaming-session';
import { useCurrentGamingSession } from '@/features/sessions/hooks/use-current-gaming-session';
import { useSessionExpiration } from '@/features/sessions/hooks/use-session-expiration';
import {PremiumAnimatedBackground} from "@/components/backgrounds/PremiumAnimatedBackground";

function interactionHaptic() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
}

export function HomeScreen() {
  const { horizontalPadding } = useAppLayout();
  const [showTimeModal, setShowTimeModal] = useState(false);
  const currentSession = useCurrentGamingSession();
  const pointsBalance = usePointsBalance();
  const activateSession = useActivateGamingSession();
  const handleSessionExpired = useSessionExpiration();
  const activationInFlight = useRef(false);

  const handleSessionAction = () => {
    interactionHaptic();
    if (currentSession.data?.status === 'scheduled') {
      if (activationInFlight.current || activateSession.isPending) return;
      activationInFlight.current = true;
      activateSession.mutate(currentSession.data.id, {
        onSettled: () => { activationInFlight.current = false; },
      });
      return;
    }
    if (currentSession.data) {
      router.navigate(`/sessions/${currentSession.data.id}`);
      return;
    }
    setShowTimeModal(true);
  };
  const handleNotificationsPress = () => {
    setNotificationReturnRoute('/home');
    router.navigate('/notifications');
  };
  const handleDevicePress = (_device: DeviceAvailability) => interactionHaptic();

  return (
    <GlassBlurProvider>
    <AppScreen backgroundClassName="bg-transparent">
        <View className="absolute inset-0" pointerEvents="none">
            <PremiumAnimatedBackground />
        </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 pt-5"
        showsVerticalScrollIndicator={false}>
        <AppContent className="gap-7">
          <Entrance delay={0}>
            <HomeHeader onNotificationsPress={handleNotificationsPress} />
          </Entrance>

            <Entrance delay={100} depth>
                <View className="w-full items-center">
                    {currentSession.isLoading ? (
                        <View className="h-60 items-center justify-center rounded-[28px] bg-transparent">
                            <Text className="font-inter text-sm text-ora-secondary">
                                Se verifica sesiunea...
                            </Text>
                        </View>
                    ) : currentSession.isError ? (
                        <View className="rounded-[28px] border border-ora-error/40 bg-transparent p-6">
                            <Text className="font-inter-medium text-xl text-ora-primary">
                                Sesiunea nu a putut fi incarcata
                            </Text>

                            <Text className="mt-3 font-inter text-sm text-ora-secondary">
                                Trage in jos sau incearca din nou in cateva momente.
                            </Text>
                        </View>
                    ) : currentSession.data ? (
                        <CurrentSessionCard
                            activeSession={currentSession.data ?? null}
                            actionError={
                                activateSession.isError
                                    ? 'Sesiunea nu a putut fi activata. Incearca din nou.'
                                    : null
                            }
                            actionPending={activateSession.isPending}
                            onActionPress={handleSessionAction}
                            onExpired={handleSessionExpired}
                        />
                    ) : (
                        <HomeHeroCard onPress={() => setShowTimeModal(true)} />
                    )}
                </View>
            </Entrance>

            <Entrance delay={200} depth>
                <View className="w-full items-center">
                    {pointsBalance.isLoading ? (
                        <View className="h-32 items-center justify-center rounded-[28px] bg-transparent">
                            <Text className="font-inter text-sm text-ora-secondary">
                                Se încarcă punctele...
                            </Text>
                        </View>
                    ) : pointsBalance.isError || !pointsBalance.data ? (
                        <View className="h-32 items-center justify-center rounded-[32px] border border-ora-error/30 bg-transparent px-6">
                            <Text className="text-center font-inter text-sm text-ora-secondary">
                                Punctele nu au putut fi încărcate.
                            </Text>
                        </View>
                    ) : (
                        <PointsCard
                            onPress={() => {
                                interactionHaptic();
                                router.navigate('/points');
                            }}
                            points={pointsBalance.data.balance}
                        />
                    )}
                </View>
            </Entrance>

            <Entrance delay={300} depth>
                <View style={{ marginHorizontal: -horizontalPadding }}>
                    <Text
                        className="mb-[7px] font-inter-medium text-[18px] text-ora-secondary"
                        style={{ marginLeft: horizontalPadding }}
                    >
                        Disponibil acum
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        decelerationRate="fast"
                        contentContainerStyle={{
                            paddingLeft: horizontalPadding,
                            paddingRight: horizontalPadding,
                            gap: 12,
                        }}
                    >
                        {[
                            {
                                ...mockDevices[1],
                                id: 'ps5',
                                name: 'PlayStation 5',
                                image: require('@/../assets/images/ps5_bg.png'),
                            },
                            {
                                ...mockDevices[0],
                                id: 'pc',
                                name: 'PC',
                                image: require('@/../assets/images/pc_bg.png'),
                            },
                            {
                                ...mockDevices[1],
                                id: 'cinema',
                                name: 'Cinema Room',
                                image: require('@/../assets/images/cinema_bg.png'),
                            },
                        ].map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                image={device.image}
                                onPress={handleDevicePress}
                            />
                        ))}
                    </ScrollView>
                </View>
            </Entrance>
        </AppContent>
      </ScrollView>
      <ReceptionTimeModal onClose={() => setShowTimeModal(false)} visible={showTimeModal} />
    </AppScreen>
    </GlassBlurProvider>
  );
}
