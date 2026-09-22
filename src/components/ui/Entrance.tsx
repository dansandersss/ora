import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type EntranceProps = PropsWithChildren<{ delay?: number; depth?: boolean }>;

export function Entrance({ children, delay = 0, depth = false }: EntranceProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    }));
  }, [delay, progress]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * (depth ? 16 : 12) }, { scale: depth ? 0.985 + progress.value * 0.015 : 1 }],
  }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
