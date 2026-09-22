import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ImageBackground, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import GoldArrow from '@/../assets/images/arrow 2.svg';
import GamerIcon from '@/../assets/images/gamer.svg';
import { useAppLayout } from '@/components/layout/AppScreen';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { TiltSurface } from '@/features/home/motion/TiltSurface';
import { formatClock, useSessionCountdown } from '@/features/sessions/hooks/use-session-countdown';
import type { GamingSession } from '@/features/sessions/types';
import { shadows } from '@/theme/tokens';

type CurrentSessionCardProps = {
  activeSession: GamingSession | null;
  actionError?: string | null;
  actionPending?: boolean;
  onActionPress: () => void;
  onExpired?: () => void;
};

const CARD_RADIUS = 25;
const GOLD = '#E5AD55';

export function CurrentSessionCard({
  activeSession,
  actionError,
  actionPending = false,
  onActionPress,
  onExpired,
}: CurrentSessionCardProps) {
  const { contentWidth, horizontalPadding } = useAppLayout();
  const cardWidth = contentWidth - horizontalPadding * 2;
  const cardHeight = Math.max(205, cardWidth * 0.63);
  const inset = Math.max(16, cardWidth * 0.045);
  const timerSize = Math.min(68, Math.max(48, cardWidth * 0.18));
  const countdown = useSessionCountdown(
    activeSession?.status === 'active' ? activeSession : null,
    onExpired,
  );
  const isScheduled = activeSession?.status === 'scheduled';
  const isActive = activeSession?.status === 'active' && !countdown.isExpired;
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * 6 }] }));

  if (activeSession && (isScheduled || isActive)) {
    const timer = isScheduled
      ? formatClock(Date.parse(activeSession.endsAt) - Date.parse(activeSession.startsAt))
      : countdown.remainingFormatted;

    return (
      <View style={{ width: '100%' }}>
        <TiltSurface>
          <View style={{
            width: '100%',
            height: cardHeight,
            borderRadius: CARD_RADIUS,
            shadowColor: '#E29E3E',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.14,
            shadowRadius: 18,
            elevation: 6,
          }}>
            <View style={{ flex: 1, overflow: 'hidden', borderRadius: CARD_RADIUS }}>
              <ImageBackground
                source={require('@/../assets/images/ora_bg.png')}
                resizeMode="cover"
                style={{ flex: 1 }}>
                <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.38)' }} />
                <View style={{ flex: 1, justifyContent: 'space-between', padding: inset }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{
                      borderWidth: 1,
                      borderColor: 'rgba(226,158,62,0.55)',
                      borderRadius: 999,
                      backgroundColor: 'rgba(33,27,19,0.72)',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                      <Text style={{ color: GOLD, fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 14 }}>
                        SESIUNE ACTIVĂ
                      </Text>
                    </View>
                    {isActive ? (
                      <Text
                        numberOfLines={1}
                        style={{
                          maxWidth: '48%',
                          color: '#F5F3EF',
                          fontFamily: 'Inter_700Bold',
                          fontSize: Math.min(24, Math.max(18, cardWidth * 0.065)),
                          lineHeight: 29,
                          textAlign: 'right',
                        }}>
                        {activeSession.deviceName}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      numberOfLines={1}
                      style={{
                        color: '#F5F3EF',
                        fontFamily: 'Inter_700Bold',
                        fontSize: timerSize,
                        lineHeight: timerSize * 1.08,
                        fontVariant: ['tabular-nums'],
                        opacity: .7,
                      }}>
                      {timer}
                    </Text>
                    <Text style={{ color: '#C6C1BD', fontFamily: 'Inter_500Medium', fontSize: Math.max(15, cardWidth * 0.048), lineHeight: 24 }}>
                      Timp rămas
                    </Text>
                  </View>

                  <PremiumPressable
                    accessibilityLabel={isScheduled ? 'Activează sesiunea' : 'Vezi sesiunea'}
                    onPress={actionPending ? undefined : onActionPress}>
                    {isScheduled ? (
                      <LinearGradient
                        colors={['#EAB45D', '#D79A42']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: Math.max(48, cardWidth * 0.14), borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F2CA79' }}>
                        <Text style={{ color: '#201B16', fontFamily: 'Inter_600SemiBold', fontSize: Math.max(17, cardWidth * 0.05) }}>
                          {actionPending ? 'Se activează...' : 'Activează sesiunea'}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={{
                        height: Math.max(48, cardWidth * 0.14),
                        borderRadius: 15,
                        borderWidth: 1.5,
                        borderColor: '#E8AF51',
                        backgroundColor: 'rgba(42,31,15,0.78)',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      }}>
                        <Text style={{ color: '#F5F3EF', fontFamily: 'Inter_600SemiBold', fontSize: Math.max(17, cardWidth * 0.05) }}>
                          Vezi sesiunea
                        </Text>
                        <GoldArrow width={19} height={19} />
                      </View>
                    )}
                  </PremiumPressable>
                </View>
              </ImageBackground>
            </View>
            <View pointerEvents="none" style={{ position: 'absolute', inset: 0, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: 'rgba(226,158,62,0.46)' }} />
          </View>
        </TiltSurface>
        {actionError ? <Text className="mt-3 font-inter text-xs text-ora-error">{actionError}</Text> : null}
      </View>
    );
  }

  return (
    <TiltSurface>
      <View className="absolute inset-x-2 top-2 h-full rounded-[28px] bg-black/20" />
      <View className="overflow-hidden rounded-[28px] border border-white/10 bg-ora-surface p-5" style={shadows.medium}>
      <View className="absolute inset-x-8 top-0 h-px bg-ora-gold/20" />
      {activeSession ? (
        <>
          <Text className="font-inter-medium text-[10px] uppercase tracking-[4px] text-ora-gold">Sesiune {activeSession.status}</Text>
          <Text className="mt-4 font-inter-semibold text-[32px] text-ora-primary">{activeSession.deviceName}</Text>
          <Text className="mt-4 font-inter text-base text-ora-secondary">Sesiunea nu poate fi pornită în această stare.</Text>
        </>
      ) : (
        <>
          <Text className="font-inter-medium text-[27px] leading-8 text-ora-primary">Nici o sesiune activa</Text>
          <Text className="mt-3 max-w-[255px] font-inter text-base leading-6 text-ora-secondary">
            Incepe o sesiune pe PC sau Xbox pentru a urmari timpul si a castiga puncte
          </Text>
          <View className="mt-5 flex-row items-end justify-between">
            <PremiumPressable accessibilityLabel="Cum adaug timp" onPress={onActionPress}>
              <Text className="font-inter-semibold text-sm text-ora-gold">Cum adaug timp?</Text>
            </PremiumPressable>
            <Animated.View style={floatStyle}><GamerIcon height={52} width={52} /></Animated.View>
          </View>
        </>
      )}
      </View>
    </TiltSurface>
  );
}
