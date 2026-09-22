import { BlurView } from 'expo-blur';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useGlassBlurTarget } from '@/components/ui/GlassSurface';

type PremiumModalProps = PropsWithChildren<{
  accessibilityLabel: string;
  onClose: () => void;
  visible: boolean;
}>;

export function PremiumModal({ accessibilityLabel, children, onClose, visible }: PremiumModalProps) {
  const target = useGlassBlurTarget();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (finished) runOnJS(setMounted)(true);
      });
    } else if (mounted) {
      progress.value = withTiming(0, {
        duration: 210,
        easing: Easing.in(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [mounted, progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }, { translateY: (1 - progress.value) * 12 }],
  }));

  return (
    <Modal animationType="none" onRequestClose={onClose} presentationStyle="overFullScreen" statusBarTranslucent transparent visible={visible || mounted}>
      <View accessibilityViewIsModal accessibilityLabel={accessibilityLabel} style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }, backdropStyle]}>
          <BlurView blurMethod={target ? 'dimezisBlurView' : undefined} blurTarget={target ?? undefined} intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        </Animated.View>
        <Pressable accessibilityLabel="Închide fereastra" style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.cardContainer, cardStyle]}>{children}</Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  scrim: { backgroundColor: 'rgba(0,0,0,0.72)' },
  cardContainer: { width: '100%', maxWidth: 390 },
});
