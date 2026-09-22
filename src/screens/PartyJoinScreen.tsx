import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { authQueryKeys, restoreSession } from '@/features/auth/session/auth-session';
import type { AuthUser } from '@/features/auth/types';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { useJoinParty, usePartyPreview } from '@/features/party/hooks/use-party';
import { normalizePartyCode } from '@/features/party/utils';
import { formatDuration } from '@/features/sessions/hooks/use-session-countdown';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/tokens';

function sessionRemaining(endsAt: string) {
  return formatDuration(Math.max(0, Date.parse(endsAt) - Date.now()));
}

export function PartyJoinScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const initialCode = useMemo(() => normalizePartyCode(params.code ?? ''), [params.code]);
  const [code, setCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode.length === 9 ? initialCode : '');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const preview = usePartyPreview(submittedCode, !checkingAuth);
  const joinParty = useJoinParty(submittedCode);

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

  const party = preview.data?.party;
  const ownSession = preview.data?.currentUserSession;
  const canJoin = ownSession?.status === 'active' || ownSession?.status === 'scheduled';

  return (
    <AppScreen>
      <AmbientGoldGlow />
      <AppContent className="flex-1 pb-8 pt-6">
        <Entrance><Text className="text-center font-inter-semibold text-xl text-ora-primary">Alatura-te unei sesiuni</Text></Entrance>
        {checkingAuth ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.gold} /></View> : !party ? (
          <Entrance delay={80}>
            <View className="mt-20">
              <Text className="text-center font-inter text-base text-ora-secondary">Introdu codul Party primit de la prietenul tau.</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                className="mt-8 h-16 rounded-xl border-2 border-ora-divider px-5 text-center font-inter-semibold text-2xl tracking-[3px] text-ora-primary focus:border-ora-gold"
                maxLength={9}
                onChangeText={(value) => { setCode(normalizePartyCode(value)); setSubmittedCode(''); }}
                placeholder="XXXX-XXXX"
                placeholderTextColor={colors.textSecondary}
                value={code}
              />
              <PremiumPressable accessibilityLabel="Verifica codul Party" className="mt-5" onPress={() => code.length === 9 && setSubmittedCode(code)}>
                <View className={`h-14 items-center justify-center rounded-xl ${code.length === 9 ? 'bg-ora-gold' : 'bg-ora-gold/35'}`}><Text className="font-inter-semibold text-lg text-ora-dark">Continua</Text></View>
              </PremiumPressable>
              {preview.isError ? <Text className="mt-4 text-center font-inter text-sm text-ora-error">Codul Party nu este valid sau nu mai este activ.</Text> : null}
            </View>
          </Entrance>
        ) : (
          <View className="flex-1 justify-center">
            <Entrance delay={60}><Text className="text-center font-inter-semibold text-[28px] text-ora-primary">{party.hostName ?? 'Un prieten'} te invita la sesiune</Text></Entrance>
            <Entrance delay={120} depth>
              <View className="mt-8 rounded-[28px] border border-white/10 bg-ora-surface p-6">
                <Text className="font-inter text-sm text-ora-secondary">Host</Text><Text className="mt-1 font-inter-semibold text-xl text-ora-primary">{party.hostName ?? 'Membru ORA'}</Text>
                <Text className="mt-5 font-inter text-sm text-ora-secondary">Participanti</Text><Text className="mt-1 font-inter-semibold text-xl text-ora-primary">{party.members.length}/{party.maxMembers}</Text>
                <View className="my-5 h-px bg-ora-divider" />
                <Text className="font-inter-medium text-lg text-ora-gold">Sesiunea ta</Text>
                {ownSession ? <><Text className="mt-2 font-inter-semibold text-2xl text-ora-primary">{ownSession.deviceName}</Text><Text className="mt-1 font-inter text-lg text-ora-secondary">{ownSession.status === 'active' ? sessionRemaining(ownSession.endsAt) : 'Programata'}</Text></> : <><Text className="mt-2 font-inter-semibold text-xl text-ora-primary">Nu ai o sesiune disponibila.</Text><Text className="mt-2 font-inter text-sm text-ora-secondary">Adreseaza-te receptiei ORA pentru a adauga timp.</Text></>}
              </View>
            </Entrance>
            <Entrance delay={180}>
              <PremiumPressable accessibilityLabel="Alatura-te Party" className="mt-6" onPress={() => canJoin && joinParty.mutate(undefined, { onSuccess: () => ownSession && router.replace(`/sessions/${ownSession.id}`) })}>
                <View className={`h-14 items-center justify-center rounded-xl ${canJoin ? 'bg-ora-gold' : 'bg-ora-gold/35'}`}><Text className="font-inter-semibold text-lg text-ora-dark">Alatura-te</Text></View>
              </PremiumPressable>
              <PremiumPressable accessibilityLabel="Renunta" className="mt-2" onPress={() => router.replace('/home')}><Text className="py-3 text-center font-inter-medium text-ora-secondary">Renunta</Text></PremiumPressable>
              {joinParty.isError ? <Text className="text-center font-inter text-sm text-ora-error">Nu te-ai putut alatura sesiunii.</Text> : null}
            </Entrance>
          </View>
        )}
      </AppContent>
    </AppScreen>
  );
}
