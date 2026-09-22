/* Reanimated shared values are intentionally mutated by UI-thread gesture worklets. */
/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingControls } from '@/components/onboarding/OnboardingControls';
import { onboardingSlides } from '@/components/onboarding/onboarding-data';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { useHasSplashCompleted } from '@/lib/startup-context';
import { EntryAmbientBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import { duration, spacing } from '@/theme/tokens';

const AUTO_ADVANCE_INTERVAL = 4500;
const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 700;
const TRANSITION_DURATION = 420;
const ENTRANCE_DURATION = 650;
const MOTION_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const VIRTUAL_SLIDES = [0, 1, 2] as const;

type OnboardingScreenProps = {
  onComplete: () => void | Promise<void>;
};

type SlideLayerProps = {
  index: number;
  active: boolean;
  offset: SharedValue<number>;
  reduceMotion: boolean;
  slideIndex: number;
  width: number;
};

function SlideLayer({ index, active, offset, reduceMotion, slideIndex, width }: SlideLayerProps) {
  const style = useAnimatedStyle(() => {
    const position = (offset.value + index * width) / width;
    return {
      opacity: interpolate(position, [-1, 0, 1], [0.35, 1, 0.35], Extrapolation.CLAMP),
      transform: [
        { translateX: offset.value + index * width },
        { scale: reduceMotion ? 1 : interpolate(Math.abs(position), [0, 1], [1, 0.98], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'} aria-hidden={!active} style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width, pointerEvents: active ? 'auto' : 'none' }, style]}>
      <OnboardingSlide slide={onboardingSlides[slideIndex]} />
    </Animated.View>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 430);
  const insets = useSafeAreaInsets();
  const splashComplete = useHasSplashCompleted();
  const reduceMotion = useReducedMotion();
  const [pageIndex, setPageIndex] = useState(0);
  const [timerVersion, setTimerVersion] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const transitionLocked = useRef(false);
  const completionLocked = useRef(false);
  const offset = useSharedValue(0);
  const gestureStart = useSharedValue(0);
  const entrance = useSharedValue(0);
  const controlsEntrance = useSharedValue(0);
  const currentIndex = VIRTUAL_SLIDES[pageIndex];

  const finishTransition = useCallback(() => {
    transitionLocked.current = false;
  }, []);

  const goToVirtualPage = useCallback((target: number, manual = false) => {
    const nextPage = Math.max(0, Math.min(VIRTUAL_SLIDES.length - 1, target));
    setIsDragging(false);
    if (manual) setTimerVersion((value) => value + 1);

    if (nextPage === pageIndex) {
      offset.value = withTiming(-pageIndex * width, {
        duration: duration.normal,
        easing: MOTION_EASING,
      });
      return;
    }
    if (transitionLocked.current) return;

    transitionLocked.current = true;
    setPageIndex(nextPage);
  }, [offset, pageIndex, width]);

  const goToSlide = useCallback((slideIndex: number, manual = true) => {
    if (slideIndex === currentIndex) {
      goToVirtualPage(pageIndex, manual);
      return;
    }
    goToVirtualPage(slideIndex, manual);
  }, [currentIndex, goToVirtualPage, pageIndex]);

  const finishOnboarding = useCallback(async () => {
    if (completionLocked.current) return;
    completionLocked.current = true;
    try { await onComplete(); } finally { completionLocked.current = false; }
  }, [onComplete]);

  useEffect(() => {
    offset.value = withTiming(
      -pageIndex * width,
      {
        duration: reduceMotion ? duration.normal : TRANSITION_DURATION,
        easing: MOTION_EASING,
      },
      (finished) => {
        if (finished) runOnJS(finishTransition)();
      },
    );
  }, [finishTransition, offset, pageIndex, reduceMotion, width]);

  useEffect(() => {
    if (!splashComplete) return;
    entrance.value = withTiming(1, { duration: reduceMotion ? duration.normal : ENTRANCE_DURATION, easing: MOTION_EASING });
    controlsEntrance.value = withDelay(
      reduceMotion ? 0 : duration.normal,
      withTiming(1, { duration: reduceMotion ? duration.normal : duration.slow, easing: Easing.out(Easing.cubic) }),
    );
  }, [controlsEntrance, entrance, reduceMotion, splashComplete]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setIsAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!splashComplete || !isAppActive || isDragging || pageIndex === VIRTUAL_SLIDES.length - 1) return;
    const timer = setTimeout(() => goToVirtualPage(pageIndex + 1), AUTO_ADVANCE_INTERVAL);
    return () => clearTimeout(timer);
  }, [goToVirtualPage, isAppActive, isDragging, pageIndex, splashComplete, timerVersion]);

  const unlockTransition = useCallback(() => { transitionLocked.current = false; }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onStart(() => {
      cancelAnimation(offset);
      gestureStart.value = offset.value;
      runOnJS(setIsDragging)(true);
      runOnJS(unlockTransition)();
    })
    .onUpdate((event) => {
      const proposed = gestureStart.value + event.translationX;
      const minimum = -(VIRTUAL_SLIDES.length - 1) * width;
      offset.value = Math.max(minimum, Math.min(0, proposed));
    })
    .onEnd((event) => {
      const passedDistance = Math.abs(event.translationX) >= width * SWIPE_DISTANCE_RATIO;
      const passedVelocity = Math.abs(event.velocityX) >= SWIPE_VELOCITY_THRESHOLD;
      const direction = event.velocityX <= -SWIPE_VELOCITY_THRESHOLD
        ? 1
        : event.velocityX >= SWIPE_VELOCITY_THRESHOLD
          ? -1
          : event.translationX < 0 ? 1 : -1;
      const target = passedDistance || passedVelocity ? pageIndex + direction : pageIndex;
      runOnJS(goToVirtualPage)(target, true);
    })
    .onFinalize((_event, success) => {
      if (!success) runOnJS(goToVirtualPage)(pageIndex, true);
    });

  const headerStyle = useAnimatedStyle(() => ({ opacity: 0.9 + entrance.value * 0.1 }));
  const contentEntranceStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + entrance.value * 0.1,
    transform: [{ translateY: (1 - entrance.value) * (reduceMotion ? 0 : 10) }],
  }));
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + controlsEntrance.value * 0.1,
    transform: [{ translateY: (1 - controlsEntrance.value) * (reduceMotion ? 0 : 8) }],
  }));

  const handleNext = () => currentIndex === 2 ? void finishOnboarding() : goToVirtualPage(pageIndex + 1, true);

  return (
    <GlassBlurProvider>
    <View className="flex-1 bg-[#080808]">
    <View className="w-full max-w-[430px] flex-1 self-center overflow-hidden">
      <EntryAmbientBackground />
      <View className="z-10 px-[22px]" style={{ paddingTop: insets.top + spacing.two }}><Animated.View style={headerStyle}>
        <OnboardingHeader onSkip={finishOnboarding} />
      </Animated.View></View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, contentEntranceStyle]}>
          {VIRTUAL_SLIDES.map((slideIndex, index) => (
            <SlideLayer
              index={index}
              active={index === pageIndex}
              key={`${index}-${onboardingSlides[slideIndex].id}`}
              offset={offset}
              reduceMotion={reduceMotion}
              slideIndex={slideIndex}
              width={width}
            />
          ))}
        </Animated.View>
      </GestureDetector>
      <View className="z-10 px-[22px]"><Animated.View
        style={[
          { paddingBottom: Math.max(insets.bottom + spacing.three, spacing.four) },
          controlsStyle,
        ]}>
        <OnboardingControls
          activeIndex={currentIndex}
          onNext={handleNext}
          onSelectPage={goToSlide}
        />
      </Animated.View></View>
    </View>
    </View>
    </GlassBlurProvider>
  );
}
