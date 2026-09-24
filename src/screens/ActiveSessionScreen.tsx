import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { PartyModeChoiceModal } from '@/features/party/components/PartyModeChoiceModal';
import { PartySection } from '@/features/party/components/PartySection';
import { useCreateParty, usePartyForSession } from '@/features/party/hooks/use-party';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { HistoryActionIcon } from '@/features/sessions/components/HistoryActionIcon';
import { SessionTimerRing } from '@/features/sessions/components/SessionTimerRing';
import { useCurrentGamingSession } from '@/features/sessions/hooks/use-current-gaming-session';
import { useSessionExpiration } from '@/features/sessions/hooks/use-session-expiration';
import { formatDuration, useSessionCountdown } from '@/features/sessions/hooks/use-session-countdown';
import { colors } from '@/theme/tokens';

function formatLocalTime(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatSessionDate(value: string) {
  const date = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
  return date.charAt(0).toUpperCase() + date.slice(1);
}

function ScreenState({ children }: { children: ReactNode }) {
  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <AppContent className="flex-1 items-center justify-center">{children}</AppContent>
      </AppScreen>
    </GlassBlurProvider>
  );
}

export function ActiveSessionScreen({ sessionId }: { sessionId: string }) {
  const sessionQuery = useCurrentGamingSession();
  const [partyChoiceVisible, setPartyChoiceVisible] = useState(false);
  const returnHome = useCallback(() => router.replace('/home'), []);
  const handleExpired = useSessionExpiration(returnHome);
  const session = sessionQuery.data?.id === sessionId && sessionQuery.data.status === 'active'
    ? sessionQuery.data
    : null;
  const countdown = useSessionCountdown(session, handleExpired);
  const partyQuery = usePartyForSession(session?.id ?? '');
  const createParty = useCreateParty(session?.id ?? '');

  if (sessionQuery.isLoading) {
    return <ScreenState><ActivityIndicator color={colors.gold} /><Text className="mt-3 font-inter text-ora-secondary">Se încarcă sesiunea...</Text></ScreenState>;
  }
  if (sessionQuery.isError) {
    return <ScreenState><Text className="text-center font-inter-medium text-lg text-ora-primary">Sesiunea nu a putut fi încărcată.</Text></ScreenState>;
  }
  if (!session) {
    return (
      <ScreenState>
        <Text className="text-center font-inter-medium text-xl text-ora-primary">Această sesiune nu mai este activă.</Text>
        <PremiumPressable accessibilityLabel="Înapoi acasă" onPress={returnHome}>
          <Text className="mt-4 px-5 py-3 font-inter-semibold text-ora-gold">Înapoi acasă</Text>
        </PremiumPressable>
      </ScreenState>
    );
  }

  const totalDuration = Date.parse(session.endsAt) - Date.parse(session.startsAt);
  const stats = [
    { label: 'START', value: formatLocalTime(session.startsAt) },
    { label: 'SFÂRȘIT', value: formatLocalTime(session.endsAt) },
    { label: 'DURATĂ', value: `${formatDuration(totalDuration)} h` },
  ];

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-32 pt-3"
          showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi acasă"
                onBack={returnHome}
                onRightPress={() => router.navigate('/sessions/history')}
                rightAccessibilityLabel="Deschide istoricul sesiunilor"
                rightContent={(
                  <GlassSurface
                    radius={15}
                    intensity={18}
                    fillColor="rgba(255,255,255,0.05)"
                    borderColor="rgba(226,158,62,0.32)"
                    shadowStyle={{ boxShadow: '0 5px 14px rgba(0,0,0,0.18)' }}>
                    <View className="h-11 w-11 items-center justify-center"><HistoryActionIcon size={24} /></View>
                  </GlassSurface>
                )}
                title="Sesiune activă"
                titleParts={[{ text: 'Sesiune ' }, { text: 'activă', gradient: true }]}
                titleSize="compact"
                subtitle={formatSessionDate(session.startsAt)}
              />
            </Entrance>

            <Entrance delay={60}>
              <View className="items-center pt-7">
                <Text className="font-inter-semibold text-[31px] leading-[38px] text-ora-primary">{session.deviceName}</Text>
                <Text className="mt-1.5 font-inter text-sm text-ora-secondary">Timp rămas</Text>
              </View>
            </Entrance>

            <Entrance delay={120} depth>
              <View className="mt-5 items-center">
                <SessionTimerRing
                  progress={countdown.progress}
                  remaining={countdown.remainingFormatted}
                  total={countdown.totalFormatted}
                />
              </View>
            </Entrance>

            <Entrance delay={180} depth>
              <GlassSurface
                className="mt-[52px]"
                radius={18}
                intensity={20}
                fillColor="rgba(255,255,255,0.05)"
                borderColor="rgba(226,158,62,0.30)"
                shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.22)' }}>
                <View className="flex-row px-2 py-[14px]">
                  {stats.map((stat, index) => (
                    <View className="flex-1 flex-row" key={stat.label}>
                      <View className="flex-1 items-center px-1">
                        <Text className="font-inter-medium text-[10px] tracking-[1.3px] text-ora-secondary">{stat.label}</Text>
                        <Text className="mt-1.5 font-inter-semibold text-lg text-ora-primary">{stat.value}</Text>
                      </View>
                      {index < stats.length - 1 ? <View className="w-px bg-white/10" /> : null}
                    </View>
                  ))}
                </View>
              </GlassSurface>
            </Entrance>

            {partyQuery.data ? (
              <Entrance delay={225} depth>
                <PartySection party={partyQuery.data} sessionId={session.id} />
              </Entrance>
            ) : null}

            <Entrance delay={240} depth>
              <PremiumPressable
                accessibilityLabel="Prelungește sesiunea"
                className={partyQuery.data ? 'mt-[26px]' : 'mt-[28px]'}
                onPress={() => router.push(`/sessions/${session.id}/extend`)}>
                <View
                  className="h-14 overflow-hidden rounded-[17px]"
                  style={{ boxShadow: '0 8px 22px rgba(226,158,62,0.20)' }}>
                  <LinearGradient
                    colors={['#F0B552', '#D99639']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 17 }}>
                    <Text className="font-inter-semibold text-base text-ora-dark">Prelungește sesiunea</Text>
                  </LinearGradient>
                </View>
              </PremiumPressable>
            </Entrance>

            <Entrance delay={300}>
              {partyQuery.isPending ? (
                <View className="mt-5 items-center py-3"><ActivityIndicator color={colors.gold} size="small" /></View>
              ) : partyQuery.isError ? (
                <View className="mt-5 items-center">
                  <Text className="font-inter text-xs text-ora-error">Party nu a putut fi verificat.</Text>
                  <PremiumPressable accessibilityLabel="Reîncearcă verificarea Party" onPress={() => partyQuery.refetch()}>
                    <Text className="px-5 py-3 font-inter-medium text-sm text-ora-gold">Reîncearcă</Text>
                  </PremiumPressable>
                </View>
              ) : !partyQuery.data ? (
                <View className="mt-3 items-center">
                  <PremiumPressable
                    accessibilityLabel="Începe sesiunea cu prietenii"
                    onPress={() => setPartyChoiceVisible(true)}>
                    <View className="flex-row items-center justify-center px-5 py-3">
                      <Text className="mr-2 font-inter-semibold text-xl leading-5 text-ora-gold">+</Text>
                      <Text className="font-inter-medium text-sm text-ora-gold">Începe sesiune cu prietenii</Text>
                    </View>
                  </PremiumPressable>
                  {createParty.isError ? (
                    <Text className="mt-2 text-center font-inter text-xs text-ora-error">Party nu a putut fi creat. Încearcă din nou.</Text>
                  ) : null}
                </View>
              ) : null}
            </Entrance>
          </AppContent>
        </ScrollView>

        <PartyModeChoiceModal
          creating={createParty.isPending}
          onClose={() => setPartyChoiceVisible(false)}
          onCreateHost={() => createParty.mutate(undefined, {
            onSuccess: () => {
              setPartyChoiceVisible(false);
              router.push(`/sessions/${session.id}/invite`);
            },
          })}
          onJoin={() => { setPartyChoiceVisible(false); router.push('/party/join'); }}
          visible={partyChoiceVisible}
        />
      </AppScreen>
    </GlassBlurProvider>
  );
}
