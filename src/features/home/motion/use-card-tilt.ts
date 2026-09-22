import { Platform } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent, PointerEvent } from 'react-native';
import {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MAX_TILT_DEGREES = 2;
const TILT_TIMING = 70;
const RESET_SPRING = { damping: 18, mass: 0.7, reduceMotion: ReduceMotion.System, stiffness: 190 } as const;

export function useCardTilt() {
  const width = useSharedValue(1);
  const height = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const updateTilt = (locationX: number, locationY: number) => {
    const normalizedX = Math.max(-1, Math.min(1, (locationX / width.value - 0.5) * 2));
    const normalizedY = Math.max(-1, Math.min(1, (locationY / height.value - 0.5) * 2));
    rotateX.value = withTiming(-normalizedY * MAX_TILT_DEGREES, { duration: TILT_TIMING });
    rotateY.value = withTiming(normalizedX * MAX_TILT_DEGREES, { duration: TILT_TIMING });
  };

  const resetTilt = () => {
    rotateX.value = withSpring(0, RESET_SPRING);
    rotateY.value = withSpring(0, RESET_SPRING);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = Math.max(1, event.nativeEvent.layout.width);
    height.value = Math.max(1, event.nativeEvent.layout.height);
  };

  const onPressIn = (event: GestureResponderEvent) => {
    updateTilt(event.nativeEvent.locationX, event.nativeEvent.locationY);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (Platform.OS === 'web') updateTilt(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { translateY: rotateX.value === 0 && rotateY.value === 0 ? 0 : -1 },
    ],
  }));

  return { animatedStyle, onLayout, onPointerLeave: resetTilt, onPointerMove, onPressIn, resetTilt };
}
