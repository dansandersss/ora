import { useEffect } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { GlassSurface } from '@/components/ui/GlassSurface';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MAX_EFFECTIVE_WIDTH = 430;
const MIN_TIMER_SIZE = 220;
const MAX_TIMER_SIZE = 290;

type SessionTimerRingProps = {
  progress: number;
  remaining: string;
  total: string;
};

export function SessionTimerRing({ progress, remaining, total }: SessionTimerRingProps) {
  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, MAX_EFFECTIVE_WIDTH);
  const size = Math.max(MIN_TIMER_SIZE, Math.min(MAX_TIMER_SIZE, effectiveWidth * 0.55 + 48));
  const strokeWidth = Math.max(12, Math.min(17, size * 0.06));
  const glowStrokeWidth = strokeWidth + 8;
  const radius = (size - glowStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerSize = size - (strokeWidth + 10) * 2;
  const timerFontSize = Math.max(34, Math.min(42, size * 0.155));
  const secondaryFontSize = Math.max(12, Math.min(14, size * 0.05));
  const animatedProgress = useSharedValue(progress);
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [entrance]);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 700,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.System,
    });
  }, [animatedProgress, progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ scale: 0.96 + entrance.value * 0.04 }],
  }));
  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Animated.View
      className="items-center justify-center"
      style={[{ height: size, width: size }, ringStyle]}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          height: size - 6,
          width: size - 6,
          borderRadius: (size - 6) / 2,
          backgroundColor: 'rgba(226,158,62,0.06)',
          boxShadow: '0 0 34px rgba(226,158,62,0.36), 0 0 68px rgba(226,158,62,0.14)',
        }}
      />

      <View style={{ position: 'absolute', height: centerSize, width: centerSize }}>
        <GlassSurface
          className="h-full w-full"
          radius={centerSize / 2}
          intensity={20}
          fillColor="rgba(118,78,31,0.28)"
          borderColor="rgba(226,158,62,0.18)">
          <View style={{ height: centerSize, width: centerSize }} />
        </GlassSurface>
      </View>

      <Svg height={size} style={{ position: 'absolute' }} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="rgba(226,158,62,0.13)"
          strokeWidth={glowStrokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          animatedProps={progressProps}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          opacity={0.22}
          r={radius}
          stroke="#F3B95A"
          strokeDasharray={[circumference, circumference]}
          strokeLinecap="round"
          strokeWidth={glowStrokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <AnimatedCircle
          animatedProps={progressProps}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="#E2A13F"
          strokeDasharray={[circumference, circumference]}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none">
        <Text
          adjustsFontSizeToFit
          className="font-inter-semibold text-ora-primary"
          minimumFontScale={0.82}
          numberOfLines={1}
          style={{
            fontSize: timerFontSize,
            fontVariant: ['tabular-nums'],
            lineHeight: timerFontSize * 1.18,
            textShadowColor: 'rgba(226,158,62,0.38)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 12,
          }}>
          {remaining}
        </Text>
        <Text
          className="mt-1 font-inter text-ora-secondary"
          style={{ fontSize: secondaryFontSize, lineHeight: secondaryFontSize * 1.4 }}>
          din {total}:00
        </Text>
      </View>
    </Animated.View>
  );
}
