/* Reanimated shared values are intentionally mutated by UI-thread gesture worklets. */
/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { colors, duration, spacing } from '@/theme/tokens';

const AUTO_ADVANCE_INTERVAL = 4500;
const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 700;
const TRANSITION_DURATION = 420;
const EDGE_RESISTANCE = 0.18;
const ENTRANCE_DURATION = 650;
const MOTION_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const VIRTUAL_SLIDES = [2, 0, 1, 2, 0] as const;

type OnboardingScreenProps = {
  onComplete: () => void;
};

type SlideLayerProps = {
  index: number;
  offset: SharedValue<number>;
  reduceMotion: boolean;
  slideIndex: number;
  width: number;
};

function SlideLayer({ index, offset, reduceMotion, slideIndex, width }: SlideLayerProps) {
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
    <Animated.View style={[styles.slideLayer, { width }, style]}>
      <OnboardingSlide slide={onboardingSlides[slideIndex]} />
    </Animated.View>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const splashComplete = useHasSplashCompleted();
  const reduceMotion = useReducedMotion();
  const [pageIndex, setPageIndex] = useState(1);
  const [timerVersion, setTimerVersion] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const transitionLocked = useRef(false);
  const completionLocked = useRef(false);
  const offset = useSharedValue(-width);
  const gestureStart = useSharedValue(0);
  const entrance = useSharedValue(0);
  const controlsEntrance = useSharedValue(0);
  const currentIndex = VIRTUAL_SLIDES[pageIndex];

  const finishTransition = useCallback((settledPage: number) => {
    if (settledPage === 0) {
      offset.value = -3 * width;
      setPageIndex(3);
    } else if (settledPage === VIRTUAL_SLIDES.length - 1) {
      offset.value = -width;
      setPageIndex(1);
    }
    transitionLocked.current = false;
  }, [offset, width]);

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
    goToVirtualPage(slideIndex + 1, manual);
  }, [currentIndex, goToVirtualPage, pageIndex]);

  const finishOnboarding = useCallback(() => {
    if (completionLocked.current) return;
    completionLocked.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    offset.value = withTiming(
      -pageIndex * width,
      {
        duration: reduceMotion ? duration.normal : TRANSITION_DURATION,
        easing: MOTION_EASING,
      },
      (finished) => {
        if (finished) runOnJS(finishTransition)(pageIndex);
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
    if (!splashComplete || !isAppActive || isDragging) return;
    const timer = setTimeout(() => goToVirtualPage(pageIndex + 1), AUTO_ADVANCE_INTERVAL);
    return () => clearTimeout(timer);
  }, [goToVirtualPage, isAppActive, isDragging, pageIndex, splashComplete, timerVersion]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onBegin(() => {
      cancelAnimation(offset);
      gestureStart.value = offset.value;
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      const proposed = gestureStart.value + event.translationX;
      const minimum = -(VIRTUAL_SLIDES.length - 1) * width;
      if (proposed > 0) {
        offset.value = proposed * EDGE_RESISTANCE;
      } else if (proposed < minimum) {
        offset.value = minimum + (proposed - minimum) * EDGE_RESISTANCE;
      } else {
        offset.value = proposed;
      }
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
    });

  const headerStyle = useAnimatedStyle(() => ({ opacity: entrance.value }));
  const contentEntranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * (reduceMotion ? 0 : 10) }],
  }));
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsEntrance.value,
    transform: [{ translateY: (1 - controlsEntrance.value) * (reduceMotion ? 0 : 8) }],
  }));

  const handleNext = () => goToVirtualPage(pageIndex + 1, true);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { paddingTop: insets.top + spacing.two }, headerStyle]}>
        <OnboardingHeader onSkip={finishOnboarding} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.pager, contentEntranceStyle]}>
          {VIRTUAL_SLIDES.map((slideIndex, index) => (
            <SlideLayer
              index={index}
              key={`${index}-${onboardingSlides[slideIndex].id}`}
              offset={offset}
              reduceMotion={reduceMotion}
              slideIndex={slideIndex}
              width={width}
            />
          ))}
        </Animated.View>
      </GestureDetector>
      <Animated.View
        style={[
          styles.controls,
          { paddingBottom: Math.max(insets.bottom + spacing.three, spacing.four) },
          controlsStyle,
        ]}>
        <OnboardingControls
          activeIndex={currentIndex}
          onNext={handleNext}
          onSelectPage={goToSlide}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  header: {
    zIndex: 2,
    paddingHorizontal: spacing.five,
  },
  pager: {
    flex: 1,
  },
  slideLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  controls: {
    zIndex: 2,
    paddingHorizontal: spacing.five,
  },
});
