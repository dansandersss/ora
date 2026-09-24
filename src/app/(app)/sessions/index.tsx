import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { CurrentSessionCard } from '@/features/home/components/CurrentSessionCard';
import { TabContentTransition } from '@/features/home/components/TabContentTransition';
import { ReceptionTimeModal } from '@/features/home/components/ReceptionTimeModal';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { setNotificationReturnRoute } from '@/features/notifications/navigation';
import { InactiveSessionCard } from '@/features/sessions/components/InactiveSessionCard';
import { SessionHistory } from '@/features/sessions/components/SessionHistory';
import { useActivateGamingSession } from '@/features/sessions/hooks/use-activate-gaming-session';
import { useCurrentGamingSession } from '@/features/sessions/hooks/use-current-gaming-session';
import { useSessionCountdown } from '@/features/sessions/hooks/use-session-countdown';
import { useSessionExpiration } from '@/features/sessions/hooks/use-session-expiration';
import { ActiveSessionScreen } from '@/screens/ActiveSessionScreen';

function SessionsOverviewHeader() {
  const localizedDate = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const today = localizedDate.charAt(0).toUpperCase() + localizedDate.slice(1);

  return (
    <View className="flex-row items-center justify-between">
      <View>
        <View accessible accessibilityLabel="Sesiuni" className="flex-row items-center">
          <Text accessible={false} className="font-inter-semibold text-xl text-ora-primary">Sesi</Text>
          <GoldGradientText accessible={false} className="font-inter-semibold text-xl">uni</GoldGradientText>
        </View>
        <Text className="mt-1 font-inter text-xs text-ora-secondary">{today}</Text>
      </View>
      <NotificationBell
        onPress={() => {
          setNotificationReturnRoute('/sessions');
          router.navigate('/notifications');
        }}
      />
    </View>
  );
}

export default function SessionsRoute() {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const sessionQuery = useCurrentGamingSession();
  const activateSession = useActivateGamingSession();
  const activationInFlight = useRef(false);
  const handleSessionExpired = useSessionExpiration();
  const countdown = useSessionCountdown(
    sessionQuery.data?.status === 'active' ? sessionQuery.data : null,
    handleSessionExpired,
  );
  const currentSession = sessionQuery.data?.status === 'active' && countdown.isExpired
    ? null
    : sessionQuery.data ?? null;

  if (!sessionQuery.isLoading && currentSession?.status === 'active') {
    return (
      <TabContentTransition tabName="sessions">
        <ActiveSessionScreen sessionId={currentSession.id} />
      </TabContentTransition>
    );
  }
  const handleAction = () => {
    if (!currentSession) {
      setShowTimeModal(true);
      return;
    }
    if (currentSession.status === 'scheduled') {
      if (activationInFlight.current || activateSession.isPending) return;
      activationInFlight.current = true;
      activateSession.mutate(currentSession.id, {
        onSettled: () => { activationInFlight.current = false; },
      });
      return;
    }
  };
  return (
    <TabContentTransition tabName="sessions">
      <GlassBlurProvider>
        <AppScreen backgroundClassName="bg-transparent">
          <PremiumAnimatedBackground />
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-32 pt-5"
            showsVerticalScrollIndicator={false}>
            <AppContent>
              <Entrance><SessionsOverviewHeader /></Entrance>
              <Entrance delay={70} depth>
                <View className="mt-7">
                  {sessionQuery.isLoading ? (
                    <GlassSurface radius={22}>
                      <View className="h-[118px] items-center justify-center">
                        <Text className="font-inter text-sm text-ora-secondary">Se verifică sesiunea...</Text>
                      </View>
                    </GlassSurface>
                  ) : sessionQuery.isError ? (
                    <GlassSurface borderColor="rgba(224,140,125,0.40)" radius={22}>
                      <View className="min-h-[118px] items-center justify-center px-6">
                        <Text className="text-center font-inter text-sm text-ora-error">Sesiunea nu a putut fi încărcată.</Text>
                      </View>
                    </GlassSurface>
                  ) : currentSession ? (
                    <CurrentSessionCard
                      activeSession={currentSession}
                      actionError={activateSession.isError ? 'Sesiunea nu a putut fi activată. Încearcă din nou.' : null}
                      actionPending={activateSession.isPending}
                      onActionPress={handleAction}
                    />
                  ) : (
                    <InactiveSessionCard onAddTimePress={handleAction} />
                  )}
                </View>
              </Entrance>
              {!sessionQuery.isLoading && currentSession?.status !== 'active' ? (
                <Entrance delay={140}><SessionHistory /></Entrance>
              ) : null}
            </AppContent>
          </ScrollView>
          <ReceptionTimeModal onClose={() => setShowTimeModal(false)} visible={showTimeModal} />
        </AppScreen>
      </GlassBlurProvider>
    </TabContentTransition>
  );
}
