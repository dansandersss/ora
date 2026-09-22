import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useCardTilt } from '@/features/home/motion/use-card-tilt';

type PremiumPressableProps = PropsWithChildren<{
  accessibilityLabel: string;
  className?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  tilt?: boolean;
}>;

export function PremiumPressable({ accessibilityLabel, children, className, onPress, onPressIn, onPressOut, tilt = false }: PremiumPressableProps) {
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const cardTilt = useCardTilt();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.94 + scale.value * 0.06,
    transform: [{ perspective: 900 }, { scale: scale.value }],
  }));

  useEffect(() => {
    scale.set(withTiming(pressed ? 0.985 : 1, { duration: pressed ? 100 : 140, reduceMotion: ReduceMotion.System }));
  }, [pressed, scale]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={className}
      onLayout={tilt ? cardTilt.onLayout : undefined}
      onPointerLeave={tilt ? cardTilt.onPointerLeave : undefined}
      onPointerMove={tilt ? cardTilt.onPointerMove : undefined}
      onPress={onPress}
      onPressIn={(event) => { setPressed(true); if (tilt) cardTilt.onPressIn(event); onPressIn?.(); }}
      onPressOut={() => { setPressed(false); if (tilt) cardTilt.resetTilt(); onPressOut?.(); }}>
      <Animated.View style={[animatedStyle, tilt && cardTilt.animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
