import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function AmbientGoldGlow() {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, {
        duration: 12000,
        easing: Easing.inOut(Easing.sin),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );
  }, [drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.11 + drift.value * 0.04,
    transform: [
      { translateX: -90 + drift.value * 180 },
      { translateY: -40 + drift.value * 280 },
      { scale: 0.94 + drift.value * 0.12 },
    ],
  }));
  const secondaryStyle = useAnimatedStyle(() => ({
    opacity: 0.06 + (1 - drift.value) * 0.04,
    transform: [
      { translateX: 70 - drift.value * 150 },
      { translateY: 160 - drift.value * 210 },
      { scale: 1.08 - drift.value * 0.12 },
    ],
  }));

  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
      <Animated.View className="absolute -right-28 -top-20 h-96 w-96 rotate-12" style={animatedStyle}>
        <LinearGradient
          className="h-full w-full rounded-full"
          colors={['rgba(217,164,65,0.68)', 'rgba(201,162,75,0.24)', 'rgba(201,162,75,0)']}
          end={{ x: 0.9, y: 0.9 }}
          start={{ x: 0.05, y: 0.1 }}
        />
      </Animated.View>
      <Animated.View className="absolute -bottom-20 -left-32 h-80 w-80 -rotate-12" style={secondaryStyle}>
        <LinearGradient
          className="h-full w-full rounded-full"
          colors={['rgba(180,119,38,0.48)', 'rgba(201,162,75,0)']}
          end={{ x: 0.85, y: 0.2 }}
          start={{ x: 0.1, y: 0.8 }}
        />
      </Animated.View>
    </View>
  );
}
