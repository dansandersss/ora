import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
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

import { EntryAmbientBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import OraLogo from '@/../assets/images/ora-logo.svg';
import { colors, duration, spacing } from '@/theme/tokens';

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
const LINE_WIDTH_RATIO = 0.25;
const LINE_MIN_WIDTH = 90;
const LINE_MAX_WIDTH = 102;
const SWIPE_DISTANCE_RATIO = 0.16;
const SWIPE_DISTANCE_MAX = 140;
const SWIPE_VELOCITY_THRESHOLD = -800;
const SWIPE_ACTIVATION_DISTANCE = 12;
const DISMISS_DURATION = 380;
const RESET_DURATION = 280;
const AUTHENTICATED_AUTO_DISMISS_DELAY = 1500;
const ENTRANCE_EASING = Easing.bezier(0.22, 1, 0.36, 1);

type OraSplashScreenProps = {
  autoDismiss?: boolean;
  allowDismiss?: boolean;
  onComplete: () => void;
  onReady: () => void;
};

export function OraSplashScreen({ autoDismiss = false, allowDismiss = true, onComplete, onReady }: OraSplashScreenProps) {
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
  const logoWidth = Math.min(Math.min(width, 430) * LOGO_WIDTH_RATIO, LOGO_MAX_WIDTH);
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

  const dismissSplash = useCallback(() => {
    'worklet';
    if (!allowDismiss || isDismissing.value) return;

    isDismissing.set(true);
    screenTranslateY.set(withTiming(
      -height * 1.05,
      {
        duration: reduceMotion ? duration.normal : DISMISS_DURATION,
        easing: ENTRANCE_EASING,
        reduceMotion: ReduceMotion.System,
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    ));
  }, [allowDismiss, height, isDismissing, onComplete, reduceMotion, screenTranslateY]);

  useEffect(() => {
    if (!autoDismiss) return;
    const timeout = setTimeout(() => dismissSplash(), AUTHENTICATED_AUTO_DISMISS_DELAY);
    return () => clearTimeout(timeout);
  }, [autoDismiss, dismissSplash]);

  const swipeGesture = Gesture.Pan()
    .enabled(allowDismiss && !autoDismiss)
    .activeOffsetY([-SWIPE_ACTIVATION_DISTANCE, SWIPE_ACTIVATION_DISTANCE])
    .onUpdate((event) => {
      if (!entranceComplete.value || isDismissing.value) return;
      screenTranslateY.set(Math.min(0, event.translationY));
    })
    .onEnd((event) => {
      if (!entranceComplete.value || isDismissing.value) return;

      const passedDistance = event.translationY <= -swipeDistanceThreshold;
      const passedVelocity = event.velocityY <= SWIPE_VELOCITY_THRESHOLD;
      if (passedDistance || passedVelocity) {
        dismissSplash();
        return;
      }

      screenTranslateY.set(withTiming(0, {
        duration: reduceMotion ? duration.fast : RESET_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }));
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
    transform: [{ translateY: logoTranslateY.value - height * 0.055 }, { scale: logoScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: lineScaleX.value }] }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View onLayout={onReady} style={[{ position: 'absolute', inset: 0, zIndex: 1000, backgroundColor: '#080808' }, screenStyle]}>
        <View className="w-full max-w-[430px] flex-1 self-center">
        <EntryAmbientBackground />
        <Pressable accessibilityRole="button" accessibilityLabel="Continuă în ORA" accessibilityHint="Atinge sau glisează în sus" onPress={() => dismissSplash()} className="absolute inset-0" />
        <View className="flex-1 items-center justify-center" style={{ pointerEvents: 'none' }}>
          <Animated.View style={logoStyle}>
            <OraLogo accessibilityLabel="ORA Project" width={logoWidth} height={logoHeight} />
          </Animated.View>
          <View className="absolute inset-x-[24px] bottom-0 items-center"><Animated.View
            style={[
              { paddingBottom: Math.max(insets.bottom + spacing.four, 34) },
              taglineStyle,
            ]}>
            <Text className="text-center font-inter-medium text-xs tracking-[1.25px] text-ora-primary">Games. Movies. Good company.</Text>
            <Animated.View style={[{ width: lineWidth, height: 4, marginTop: 16, alignSelf: 'center' }, lineStyle]}>
              <LinearGradient
                colors={[colors.brandGradientStart, colors.brandGradientEnd]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={{ flex: 1, borderRadius: 2 }}
              />
            </Animated.View>
          </Animated.View></View>
        </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
