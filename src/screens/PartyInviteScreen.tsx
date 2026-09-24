import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Copy } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { usePartyForSession } from '@/features/party/hooks/use-party';
import { partyDeepLink } from '@/features/party/utils';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { colors } from '@/theme/tokens';

function formatSessionDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  const formatted = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function PartyInviteScreen({ sessionId }: { sessionId: string }) {
  const partyQuery = usePartyForSession(sessionId);
  const [copied, setCopied] = useState(false);
  const party = partyQuery.data;
  const sessionDate = useMemo(() => {
    const hostSession = party?.members.find((member) => member.role === 'host')?.gamingSession;
    return formatSessionDate(hostSession?.startsAt);
  }, [party]);

  const copyCode = async () => {
    if (!party) return;
    await Clipboard.setStringAsync(party.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1_400);
  };

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <AppContent className="flex-1 pb-[112px] pt-4">
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la sesiune"
                onBack={() => router.replace('/sessions')}
                title="Invită Prieteni"
                titleParts={[{ text: 'Invită ' }, { text: 'Prieteni', gradient: true }]}
                titleSize="compact"
                subtitle={sessionDate}
              />
            </Entrance>

            {partyQuery.isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color={colors.brandGradientEnd} />
              </View>
            ) : party ? (
              <View className="flex-1 items-center">
                <Entrance delay={60}>
                  <View className="mt-[70px] items-center">
                    <Text className="text-center font-inter-medium text-[19px] leading-[20px] text-ora-secondary">
                      Scanează sau introdu codul
                    </Text>
                    <View className="flex-row items-center justify-center">
                      <Text className="font-inter-medium text-[19px] leading-[20px] text-ora-secondary">pentru a te </Text>
                      <GoldGradientText className="font-inter-medium text-[19px] leading-[20px]">alătura sesiunii</GoldGradientText>
                    </View>
                  </View>
                </Entrance>

                <Entrance delay={120} depth>
                  <GlassSurface
                    className="mt-[42px]"
                    radius={18}
                    intensity={20}
                    fillColor="rgba(255,255,255,0.055)"
                    borderColor="rgba(226,158,62,0.34)"
                    shadowStyle={{ boxShadow: '0 14px 34px rgba(0,0,0,0.24)' }}>
                    <View className="h-[250px] w-[250px] items-center justify-center">
                      <QRCode
                        backgroundColor="transparent"
                        color={colors.textPrimary}
                        size={190}
                        value={partyDeepLink(party.joinCode)}
                      />
                    </View>
                  </GlassSurface>
                </Entrance>

                <Entrance delay={180}>
                  <View className="mt-[38px] w-full">
                    <Text className="mb-2.5 font-inter text-sm text-ora-secondary">Cod sesiune</Text>
                    <PremiumPressable accessibilityLabel="Copiază codul sesiunii" onPress={copyCode}>
                      <GlassSurface
                        radius={18}
                        intensity={18}
                        fillColor="rgba(255,255,255,0.045)"
                        borderColor="rgba(226,158,62,0.42)">
                        <View className="h-[62px] w-full flex-row items-center justify-between px-5">
                          <Text className="font-inter-semibold text-lg tracking-[0.4px] text-ora-primary">{party.joinCode}</Text>
                          <Copy color={copied ? '#45C99A' : colors.textPrimary} size={27} strokeWidth={2.1} />
                        </View>
                      </GlassSurface>
                    </PremiumPressable>
                    <Text
                      accessibilityLiveRegion="polite"
                      className="absolute right-0 top-[76px] font-inter text-[10px]"
                      style={{ color: copied ? '#45C99A' : 'transparent' }}>
                      Cod copiat
                    </Text>
                  </View>
                </Entrance>

                <Entrance delay={240}>
                  <Text
                    className="mt-[38px] text-center font-inter text-sm leading-5 text-ora-secondary"
                    style={{ letterSpacing: 4, opacity: 0.58 }}>
                    Fiecare participant primește{`\n`}puncte individual pentru timp
                  </Text>
                </Entrance>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center font-inter text-ora-error">Invitația nu a putut fi încărcată.</Text>
              </View>
            )}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
