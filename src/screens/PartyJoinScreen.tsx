import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { authQueryKeys, restoreSession } from '@/features/auth/session/auth-session';
import type { AuthUser } from '@/features/auth/types';
import { PartyQrScanner } from '@/features/party/components/PartyQrScanner';
import { getPartyJoinErrorMessage } from '@/features/party/errors';
import { useJoinParty } from '@/features/party/hooks/use-party';
import { isValidPartyCode, normalizePartyCode } from '@/features/party/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/tokens';

export function PartyJoinScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const initialCode = useMemo(() => normalizePartyCode(params.code ?? ''), [params.code]);
  const [code, setCode] = useState(initialCode);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [entryMode, setEntryMode] = useState<'scan' | 'manual'>(initialCode ? 'manual' : 'scan');
  const joinParty = useJoinParty();
  const joinError = joinParty.error ? getPartyJoinErrorMessage(joinParty.error) : null;

  useEffect(() => {
    let active = true;
    const cachedUser = queryClient.getQueryData<AuthUser>(authQueryKeys.currentUser);
    (cachedUser ? Promise.resolve(cachedUser) : restoreSession()).then((user) => {
      if (!active) return;
      if (!user) {
        router.replace({ pathname: '/login', params: { partyCode: initialCode } });
        return;
      }
      setCheckingAuth(false);
    });
    return () => { active = false; };
  }, [initialCode]);

  const returnToSession = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/sessions');
  };

  const joinWithCode = async (value: string) => {
    const normalizedCode = normalizePartyCode(value);
    if (!isValidPartyCode(normalizedCode)) throw new Error('INVALID_PARTY_CODE');
    setCode(normalizedCode);

    await joinParty.mutateAsync(normalizedCode);
    // Enter through the stable tab route. The Sessions tab resolves the current
    // user's active session without passing frozen nested-router params.
    router.replace('/sessions');
  };

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la sesiune"
                onBack={returnToSession}
                title="Alătură-te unei sesiuni"
                titleSize="compact"
              />
            </Entrance>

            {checkingAuth ? (
              <View className="h-[440px] items-center justify-center">
                <ActivityIndicator color={colors.brandGradientEnd} />
              </View>
            ) : (
              <Entrance delay={70} depth>
                <View className="mt-7">
                  <Text className="mb-5 text-center font-inter text-sm leading-5 text-ora-secondary">
                    Scanează codul QR primit de la prietenul tău sau introdu codul sesiunii.
                  </Text>
                  {entryMode === 'scan' ? (
                    <PartyQrScanner
                      busy={joinParty.isPending}
                      errorMessage={joinError}
                      onCodeScanned={joinWithCode}
                      onManualEntry={() => {
                        joinParty.reset();
                        setEntryMode('manual');
                      }}
                    />
                  ) : (
                    <ManualCodeEntry
                      code={code}
                      errorMessage={joinError}
                      loading={joinParty.isPending}
                      onChangeCode={(value) => {
                        joinParty.reset();
                        setCode(normalizePartyCode(value));
                      }}
                      onScan={() => {
                        joinParty.reset();
                        setEntryMode('scan');
                      }}
                      onSubmit={() => joinWithCode(code).catch(() => undefined)}
                    />
                  )}
                </View>
              </Entrance>
            )}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}

type ManualCodeEntryProps = {
  code: string;
  errorMessage?: string | null;
  loading: boolean;
  onChangeCode: (value: string) => void;
  onScan: () => void;
  onSubmit: () => void;
};

function ManualCodeEntry({ code, errorMessage, loading, onChangeCode, onScan, onSubmit }: ManualCodeEntryProps) {
  const ready = isValidPartyCode(code) && !loading;

  return (
    <GlassSurface
      radius={26}
      intensity={20}
      fillColor="rgba(255,255,255,0.055)"
      borderColor="rgba(226,158,62,0.34)">
      <View className="px-6 py-7">
        <Text className="text-center font-inter-semibold text-xl text-ora-primary">Codul sesiunii</Text>
        <Text className="mt-2 text-center font-inter text-sm text-ora-secondary">
          Introdu cele 8 caractere primite de la prietenul tău. Cratima se adaugă automat.
        </Text>
        <TextInput
          accessibilityLabel="Codul sesiunii"
          autoCapitalize="characters"
          autoCorrect={false}
          className="mt-7 h-16 rounded-[16px] border border-ora-gold/55 bg-black/20 px-5 text-center font-inter-semibold text-2xl tracking-[3px] text-ora-primary"
          maxLength={9}
          onChangeText={onChangeCode}
          onSubmitEditing={ready ? onSubmit : undefined}
          placeholder="XXXX-XXXX"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          value={code}
        />
        <PremiumPressable accessibilityLabel="Alătură-te folosind codul sesiunii" className="mt-5" onPress={ready ? onSubmit : undefined}>
          <View className={`min-h-[52px] items-center justify-center rounded-[14px] ${ready ? 'bg-ora-gold' : 'bg-ora-gold/35'}`}>
            {loading ? <ActivityIndicator color={colors.iconBackground} size="small" /> : (
              <Text className="font-inter-semibold text-base text-ora-dark">Continuă</Text>
            )}
          </View>
        </PremiumPressable>
        {errorMessage ? <Text className="mt-4 text-center font-inter text-sm text-ora-error">{errorMessage}</Text> : null}
        <PremiumPressable accessibilityLabel="Scanează codul QR" className="mt-4" onPress={onScan}>
          <View className="h-12 flex-row items-center justify-center rounded-[14px] border border-ora-gold/65">
            <Camera color={colors.brandGradientEnd} size={19} />
            <Text className="ml-2 font-inter-medium text-sm text-ora-primary">Scanează codul QR</Text>
          </View>
        </PremiumPressable>
      </View>
    </GlassSurface>
  );
}
