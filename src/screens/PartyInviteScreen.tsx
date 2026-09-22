import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Copy } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { usePartyForSession } from '@/features/party/hooks/use-party';
import { partyDeepLink } from '@/features/party/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { colors } from '@/theme/tokens';

export function PartyInviteScreen({ sessionId }: { sessionId: string }) {
  const partyQuery = usePartyForSession(sessionId);
  const [copied, setCopied] = useState(false);
  const party = partyQuery.data;

  return (
    <AppScreen>
      <AmbientGoldGlow />
      <AppContent className="flex-1 pb-8 pt-4">
        <Entrance><SessionHeader backLabel="Inapoi la sesiune" onBack={() => router.replace(`/sessions/${sessionId}`)} title="Invita prieteni" titleSize="compact" /></Entrance>
        {partyQuery.isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.gold} /></View> : party ? (
          <View className="flex-1 items-center pt-8">
            <Entrance delay={60}><Text className="text-center font-inter text-base leading-5 text-ora-secondary">Scaneaza sau introdu codul{`\n`}pentru a te alatura sesiunii</Text></Entrance>
            <Entrance delay={120} depth>
              <View className="mt-8 rounded-2xl border-2 border-ora-gold bg-white p-5">
                <QRCode backgroundColor="#FFFFFF" color="#151516" size={190} value={partyDeepLink(party.joinCode)} />
              </View>
            </Entrance>
            <Entrance delay={180}>
              <View className="mt-7 w-full">
                <Text className="mb-2 font-inter text-xs text-ora-secondary">Cod sesiune</Text>
                <PremiumPressable accessibilityLabel="Copiaza codul sesiunii" onPress={async () => { await Clipboard.setStringAsync(party.joinCode); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>
                  <View className="h-12 flex-row items-center justify-between rounded-xl border border-ora-gold px-4">
                    <Text className="font-inter text-base text-ora-primary">{party.joinCode}</Text>
                    <Copy color={copied ? '#45C99A' : colors.textPrimary} size={22} />
                  </View>
                </PremiumPressable>
                <Text accessibilityLiveRegion="polite" className={`mt-2 text-center font-inter text-xs ${copied ? 'text-[#45C99A]' : 'text-transparent'}`}>Cod copiat</Text>
              </View>
            </Entrance>
            <Entrance delay={240}><Text className="mt-4 text-center font-inter text-sm leading-5 text-ora-secondary">Fiecare participant primeste{`\n`}puncte individual pentru timp</Text></Entrance>
          </View>
        ) : <View className="flex-1 items-center justify-center"><Text className="text-center font-inter text-ora-error">Invitatia nu a putut fi incarcata.</Text></View>}
      </AppContent>
    </AppScreen>
  );
}
