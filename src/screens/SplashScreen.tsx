import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OraLogo from '@/../assets/images/ora-logo.svg';
import { colors, duration, spacing, typography, zIndex } from '@/theme/tokens';

const LOGO_ASPECT_RATIO = 248 / 137;
const LOGO_WIDTH_RATIO = 0.62;
const LOGO_MAX_WIDTH = 300;
const LOGO_DELAY = 120;
const LOGO_DURATION = 560;
const TAGLINE_DELAY = 650;
const TAGLINE_DURATION = 450;
const LINE_DELAY = 950;
const LINE_DURATION = 400;
const TAGLINE_OPACITY = 0.7;
const LINE_WIDTH_RATIO = 0.35;
const LINE_MIN_WIDTH = 112;
const LINE_MAX_WIDTH = 140;
const SWIPE_DISTANCE_RATIO = 0.16;
const SWIPE_DISTANCE_MAX = 140;
const SWIPE_VELOCITY_THRESHOLD = -800;
const SWIPE_ACTIVATION_DISTANCE = 12;
const DISMISS_DURATION = 380;
const RESET_DURATION = 280;
const ENTRANCE_EASING = Easing.bezier(0.22, 1, 0.36, 1);

type OraSplashScreenProps = {
  onComplete: () => void;
  onReady: () => void;
};

export function OraSplashScreen({ onComplete, onReady }: OraSplashScreenProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(reduceMotion ? 1 : 0.96);
  const logoTranslateY = useSharedValue(reduceMotion ? 0 : 8);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(reduceMotion ? 0 : 8);
  const lineScaleX = useSharedValue(0);
  const screenTranslateY = useSharedValue(0);
  const entranceComplete = useSharedValue(false);
  const isDismissing = useSharedValue(false);
  const logoWidth = Math.min(width * LOGO_WIDTH_RATIO, LOGO_MAX_WIDTH);
  const logoHeight = logoWidth / LOGO_ASPECT_RATIO;
  const lineWidth = Math.min(Math.max(width * LINE_WIDTH_RATIO, LINE_MIN_WIDTH), LINE_MAX_WIDTH);
  const swipeDistanceThreshold = Math.min(height * SWIPE_DISTANCE_RATIO, SWIPE_DISTANCE_MAX);

  useEffect(() => {
    const logoDuration = reduceMotion ? duration.normal : LOGO_DURATION;
    const taglineDelay = reduceMotion ? duration.fast : TAGLINE_DELAY;
    const timing = { duration: logoDuration, easing: ENTRANCE_EASING, reduceMotion: ReduceMotion.System };

    logoOpacity.value = withDelay(reduceMotion ? 0 : LOGO_DELAY, withTiming(1, timing));
    logoScale.value = withDelay(reduceMotion ? 0 : LOGO_DELAY, withTiming(1, timing));
    logoTranslateY.value = withDelay(reduceMotion ? 0 : LOGO_DELAY, withTiming(0, timing));
    taglineOpacity.value = withDelay(
      taglineDelay,
      withTiming(TAGLINE_OPACITY, {
        duration: reduceMotion ? duration.normal : TAGLINE_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
    taglineTranslateY.value = withDelay(
      taglineDelay,
      withTiming(0, {
        duration: reduceMotion ? duration.normal : TAGLINE_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
    lineScaleX.value = withDelay(
      reduceMotion ? duration.slow : LINE_DELAY,
      withTiming(1, {
        duration: reduceMotion ? duration.normal : LINE_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (finished) entranceComplete.value = true;
      }),
    );
  }, [entranceComplete, lineScaleX, logoOpacity, logoScale, logoTranslateY, reduceMotion, taglineOpacity, taglineTranslateY]);

  const dismissSplash = () => {
    'worklet';
    if (isDismissing.value) return;

    isDismissing.value = true;
    screenTranslateY.value = withTiming(
      -height * 1.05,
      {
        duration: reduceMotion ? duration.normal : DISMISS_DURATION,
        easing: ENTRANCE_EASING,
        reduceMotion: ReduceMotion.System,
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetY([-SWIPE_ACTIVATION_DISTANCE, SWIPE_ACTIVATION_DISTANCE])
    .onUpdate((event) => {
      if (!entranceComplete.value || isDismissing.value) return;
      screenTranslateY.value = Math.min(0, event.translationY);
    })
    .onEnd((event) => {
      if (!entranceComplete.value || isDismissing.value) return;

      const passedDistance = event.translationY <= -swipeDistanceThreshold;
      const passedVelocity = event.velocityY <= SWIPE_VELOCITY_THRESHOLD;
      if (passedDistance || passedVelocity) {
        dismissSplash();
        return;
      }

      screenTranslateY.value = withTiming(0, {
        duration: reduceMotion ? duration.fast : RESET_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      });
    });

  const screenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      screenTranslateY.value,
      [-height, -height * 0.45, 0],
      [0, 0.92, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: screenTranslateY.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }, { scale: logoScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: lineScaleX.value }] }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View onLayout={onReady} style={[styles.container, screenStyle]}>
        <View pointerEvents="none" style={styles.composition}>
          <Animated.View style={[styles.logo, logoStyle]}>
            <OraLogo accessibilityLabel="ORA Project" width={logoWidth} height={logoHeight} />
          </Animated.View>
          <Animated.View
            style={[
              styles.taglineContainer,
              { paddingBottom: Math.max(insets.bottom + spacing.five, spacing.six) },
              taglineStyle,
            ]}>
            <Text style={styles.tagline}>Games. Movies. Good company.</Text>
            <Animated.View style={[styles.lineReveal, { width: lineWidth }, lineStyle]}>
              <LinearGradient
                colors={[colors.brandGradientStart, colors.brandGradientEnd]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.line}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.overlay,
    backgroundColor: colors.background,
  },
  composition: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { transform: [{ translateY: -spacing.three }] },
  taglineContainer: {
    position: 'absolute',
    right: spacing.four,
    bottom: 0,
    left: spacing.four,
    alignItems: 'center',
  },
  tagline: {
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    letterSpacing: 1.25,
    textAlign: 'center',
  },
  lineReveal: {
    height: spacing.one,
    marginTop: spacing.three,
  },
  line: {
    flex: 1,
    borderRadius: spacing.half,
  },
});
