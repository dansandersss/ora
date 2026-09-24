import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { ExtensionOption } from '@/features/sessions/components/ExtensionOption';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { gamingSessionQueryKeys, useCurrentGamingSession } from '@/features/sessions/hooks/use-current-gaming-session';
import { useSessionCountdown } from '@/features/sessions/hooks/use-session-countdown';
import { useRequestSessionExtension, useSessionExtensionRequest } from '@/features/sessions/hooks/use-session-extension';
import { BackendError } from '@/lib/backend';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';
import { colors } from '@/theme/tokens';

const EXTENSION_OPTIONS = [
  { durationLabel: '+30 Minute', minutes: 30, priceMdl: 20 },
  { durationLabel: '+1 Oră', minutes: 60, priceMdl: 45 },
  { durationLabel: '+2 Ore', minutes: 120, priceMdl: 85 },
  { durationLabel: '+3 Ore', minutes: 180, priceMdl: 150 },
] as const;

function requestErrorMessage(error: unknown) {
  const backendError = error instanceof BackendError ? error : null;
  const code = backendError?.message ?? '';
  if (code.includes('EXTENSION_REQUEST_ALREADY_PENDING')) return 'Există deja o solicitare în așteptare.';
  if (code.includes('SESSION_NOT_EXTENDABLE')) return 'Sesiunea nu mai poate fi prelungită.';
  if (code.includes('SESSION_NOT_FOUND')) return 'Sesiunea nu a fost găsită.';
  if (backendError?.status === 401 || code.includes('UNAUTHORIZED')) return 'Sesiunea de autentificare a expirat.';
  return 'Solicitarea nu a putut fi trimisă. Încearcă din nou.';
}

function requestLookupErrorMessage(error: unknown) {
  if (error instanceof BackendError && error.status === 401) return 'Sesiunea de autentificare a expirat.';
  return 'Solicitările existente nu au putut fi verificate. Încearcă din nou.';
}

function formatSessionDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  const formatted = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function SessionExtensionScreen({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const sessionQuery = useCurrentGamingSession();
  const requestQuery = useSessionExtensionRequest(sessionId);
  const requestMutation = useRequestSessionExtension(sessionId);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(60);
  const session = sessionQuery.data?.id === sessionId && sessionQuery.data.status === 'active' ? sessionQuery.data : null;
  const countdown = useSessionCountdown(session);
  const latestRequest = requestQuery.data;
  const pending = latestRequest?.status === 'pending';
  const selectedOption = useMemo(
    () => EXTENSION_OPTIONS.find((option) => option.minutes === (pending ? latestRequest.requestedMinutes : selectedMinutes)),
    [latestRequest, pending, selectedMinutes],
  );

  useEffect(() => {
    if (latestRequest?.status !== 'approved' && latestRequest?.status !== 'rejected') return;
    if (latestRequest.status === 'approved') queryClient.invalidateQueries({ queryKey: gamingSessionQueryKeys.current }).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }).catch(() => undefined);
  }, [latestRequest?.status, queryClient]);

  // The POST is authoritative for duplicate-pending validation. A failed optional
  // status lookup must not leave the primary action permanently disabled.
  const canSubmit = Boolean(session && selectedMinutes && !pending && !requestMutation.isPending);
  const statusMessage = latestRequest?.status === 'approved'
    ? 'Sesiunea a fost prelungită.'
    : latestRequest?.status === 'rejected'
      ? 'Solicitarea nu a fost aprobată.'
      : latestRequest?.status === 'cancelled'
        ? 'Solicitarea a fost anulată.'
      : pending
        ? 'Solicitare în așteptare'
        : requestMutation.isSuccess
          ? 'Cererea a fost trimisă.'
          : null;

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView contentContainerClassName="pb-[112px] pt-4" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la sesiune"
                onBack={() => router.replace('/sessions')}
                title="Prelungește sesiunea"
                titleParts={[{ text: 'Prelungește ' }, { text: 'sesiunea', gradient: true }]}
                titleSize="compact"
                subtitle={formatSessionDate(session?.startsAt)}
              />
            </Entrance>

            {sessionQuery.isLoading || requestQuery.isLoading ? (
              <View className="h-[520px] items-center justify-center">
                <ActivityIndicator color={colors.brandGradientEnd} />
              </View>
            ) : !session ? (
              <Text className="mt-20 text-center font-inter-medium text-lg text-ora-secondary">Sesiunea nu mai poate fi prelungită.</Text>
            ) : (
              <>
                <Entrance delay={60} depth>
                  <GlassSurface
                    className="mt-[40px]"
                    radius={22}
                    intensity={20}
                    fillColor="rgba(255,255,255,0.052)"
                    borderColor="rgba(226,158,62,0.34)"
                    shadowStyle={{ boxShadow: '0 12px 30px rgba(0,0,0,0.20)' }}>
                    <View className="h-[98px] flex-row items-center justify-between px-5">
                      <View>
                        <Text className="font-inter text-sm text-ora-secondary">Stație activă</Text>
                        <Text className="mt-1 font-inter-semibold text-[23px] leading-[28px] text-ora-primary">{session.deviceName}</Text>
                      </View>
                      <View className="max-w-[205px] items-end">
                        <Text className="font-inter text-sm text-ora-secondary">Timp rămas</Text>
                        <Text
                          adjustsFontSizeToFit
                          className="mt-1 font-inter-semibold text-[34px] leading-[39px] text-ora-gold"
                          minimumFontScale={0.78}
                          numberOfLines={1}>
                          {countdown.remainingFormatted}
                        </Text>
                      </View>
                    </View>
                  </GlassSurface>
                </Entrance>

                <Entrance delay={120}>
                  <Text className="mb-[18px] mt-[48px] font-inter-medium text-[21px] leading-[26px] text-ora-primary">Alege durata</Text>
                  <View className="w-full gap-3">
                    {EXTENSION_OPTIONS.map((option) => (
                      <ExtensionOption
                        durationLabel={option.durationLabel}
                        key={option.minutes}
                        onPress={() => { if (!pending) setSelectedMinutes(option.minutes); }}
                        priceMdl={pending && option.minutes === latestRequest.requestedMinutes ? latestRequest.quotedPriceMdl : option.priceMdl}
                        selected={selectedOption?.minutes === option.minutes}
                      />
                    ))}
                  </View>
                </Entrance>

                <Entrance delay={180} depth>
                  <GlassSurface
                    className="mt-[28px]"
                    radius={18}
                    intensity={20}
                    fillColor="rgba(255,255,255,0.04)"
                    borderColor="rgba(226,158,62,0.30)"
                    shadowStyle={{ boxShadow: '0 12px 30px rgba(0,0,0,0.20)' }}>
                    <View className="px-4 py-[18px]">
                      {statusMessage ? (
                        <View className="mb-3 rounded-[12px] bg-ora-gold/10 px-3 py-2.5">
                          <Text className="text-center font-inter-medium text-xs text-ora-gold">{statusMessage}</Text>
                          {latestRequest?.status === 'rejected' && latestRequest.rejectionReason ? (
                            <Text className="mt-1 text-center font-inter text-[11px] text-ora-secondary">{latestRequest.rejectionReason}</Text>
                          ) : null}
                          {pending ? <Text className="mt-1 text-center font-inter text-[11px] text-ora-secondary">Personalul de la recepție o va procesa în curând.</Text> : null}
                        </View>
                      ) : null}

                      {requestQuery.isError ? (
                        <View className="mb-3 items-center rounded-[12px] bg-ora-error/10 px-3 py-2.5">
                          <Text className="text-center font-inter text-xs text-ora-error">{requestLookupErrorMessage(requestQuery.error)}</Text>
                          <PremiumPressable accessibilityLabel="Reîncearcă verificarea solicitării" onPress={() => requestQuery.refetch()}>
                            <Text className="mt-1 px-4 py-1.5 font-inter-semibold text-xs text-ora-gold">Reîncearcă</Text>
                          </PremiumPressable>
                        </View>
                      ) : null}

                      <PremiumPressable
                        accessibilityLabel="Solicită prelungire"
                        onPress={() => { if (canSubmit && selectedMinutes) requestMutation.mutate(selectedMinutes); }}>
                        <View className="h-[54px] overflow-hidden rounded-[16px]" style={{ boxShadow: '0 9px 24px rgba(226,158,62,0.24)' }}>
                          <LinearGradient
                            colors={canSubmit ? ['#FFB72C', '#F1A12B'] : ['#8C6A2E', '#725526']}
                            end={{ x: 1, y: 1 }}
                            start={{ x: 0, y: 0 }}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {requestMutation.isPending ? (
                              <ActivityIndicator color={colors.iconBackground} />
                            ) : (
                              <Text className="font-inter-semibold text-base text-ora-dark">{pending ? 'Cerere în așteptare' : 'Solicită prelungire'}</Text>
                            )}
                          </LinearGradient>
                        </View>
                      </PremiumPressable>

                      {requestMutation.isError ? <Text className="mt-3 text-center font-inter text-xs text-ora-error">{requestErrorMessage(requestMutation.error)}</Text> : null}
                      <Text className="mt-[18px] text-center font-inter text-xs text-ora-secondary" style={{ opacity: 0.78 }}>
                        * Cererea va fi aprobată de personal la recepție.
                      </Text>
                    </View>
                  </GlassSurface>
                </Entrance>
              </>
            )}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
