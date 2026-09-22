import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { ExtensionOption } from '@/features/sessions/components/ExtensionOption';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { gamingSessionQueryKeys, useCurrentGamingSession } from '@/features/sessions/hooks/use-current-gaming-session';
import { useSessionCountdown } from '@/features/sessions/hooks/use-session-countdown';
import { useRequestSessionExtension, useSessionExtensionRequest } from '@/features/sessions/hooks/use-session-extension';
import { BackendError } from '@/lib/backend';
import { notificationQueryKeys } from '@/features/notifications/hooks/use-notifications';

const EXTENSION_OPTIONS = [
  { durationLabel: '+30 Minute', minutes: 30, priceMdl: 20 },
  { durationLabel: '+1 Ora', minutes: 60, priceMdl: 45 },
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

export function SessionExtensionScreen({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const sessionQuery = useCurrentGamingSession();
  const requestQuery = useSessionExtensionRequest(sessionId);
  const requestMutation = useRequestSessionExtension(sessionId);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
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
    <AppScreen>
      <AmbientGoldGlow />
      <ScrollView contentContainerClassName="pb-8 pt-4" showsVerticalScrollIndicator={false}>
        <AppContent>
          <Entrance><SessionHeader backLabel="Înapoi la sesiune" onBack={() => router.replace('/sessions')} title="Prelungește sesiunea" titleSize="compact" /></Entrance>
          {sessionQuery.isLoading || requestQuery.isLoading ? (
            <View className="h-64 items-center justify-center"><ActivityIndicator color="#C9A24B" /></View>
          ) : !session ? (
            <Text className="mt-20 text-center font-inter-medium text-lg text-ora-secondary">Sesiunea nu mai poate fi prelungită.</Text>
          ) : (
            <>
              <Entrance delay={60} depth>
                <View className="mt-14 h-[218px] justify-center rounded-[28px] bg-ora-surface px-7 py-6">
                  <Text className="font-inter text-lg text-ora-secondary">Timp curent</Text>
                  <Text className="mt-3 font-inter-semibold text-[44px] leading-[52px] text-ora-primary">{countdown.remainingFormatted}</Text>
                  <Text className="mt-4 font-inter text-lg text-ora-secondary">{session.deviceName}</Text>
                </View>
              </Entrance>
              <Entrance delay={120}>
                <Text className="mb-4 mt-10 font-inter-medium text-xl text-ora-primary">Alege durata</Text>
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
              <Entrance delay={180}>
                {statusMessage ? (
                  <View className="mt-5 rounded-xl border border-ora-gold/30 bg-ora-gold/10 p-4">
                    <Text className="text-center font-inter-medium text-sm text-ora-gold">{statusMessage}</Text>
                    {latestRequest?.status === 'rejected' && latestRequest.rejectionReason ? <Text className="mt-2 text-center font-inter text-xs text-ora-secondary">{latestRequest.rejectionReason}</Text> : null}
                    {pending ? <Text className="mt-2 text-center font-inter text-xs text-ora-secondary">Personalul de la recepție o va procesa în curând.</Text> : null}
                  </View>
                ) : null}
                {requestQuery.isError ? (
                  <View className="mt-5 items-center rounded-xl border border-ora-error/30 bg-ora-error/10 p-4">
                    <Text className="text-center font-inter text-sm text-ora-error">{requestLookupErrorMessage(requestQuery.error)}</Text>
                    <PremiumPressable accessibilityLabel="Reîncearcă verificarea solicitării" onPress={() => requestQuery.refetch()}>
                      <Text className="mt-2 px-4 py-2 font-inter-semibold text-sm text-ora-gold">Reîncearcă</Text>
                    </PremiumPressable>
                  </View>
                ) : null}
                <PremiumPressable accessibilityLabel="Solicită prelungire" className="mt-5" onPress={() => { if (canSubmit && selectedMinutes) requestMutation.mutate(selectedMinutes); }}>
                  <View className={`h-16 items-center justify-center rounded-xl ${canSubmit ? 'bg-ora-gold' : 'bg-ora-gold/40'}`}>
                    {requestMutation.isPending ? <ActivityIndicator color="#151516" /> : <Text className="font-inter-medium text-lg text-ora-dark">{pending ? 'Cerere în așteptare' : 'Solicită prelungire'}</Text>}
                  </View>
                </PremiumPressable>
                {requestMutation.isError ? <Text className="mt-3 text-center font-inter text-sm text-ora-error">{requestErrorMessage(requestMutation.error)}</Text> : null}
                <Text className="mt-5 text-center font-inter text-xs tracking-[2px] text-ora-secondary/70">Cererea va fi aprobată de personal</Text>
              </Entrance>
            </>
          )}
        </AppContent>
      </ScrollView>
    </AppScreen>
  );
}
