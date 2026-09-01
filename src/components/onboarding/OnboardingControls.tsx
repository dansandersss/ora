import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import ArrowIcon from '@/../assets/images/arrow.svg';
import { colors, radii, spacing } from '@/theme/tokens';

type PaginationDotProps = {
  active: boolean;
  index: number;
  onPress: (index: number) => void;
};

function PaginationDot({ active, index, onPress }: PaginationDotProps) {
  const activeProgress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active, activeProgress]);

  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(activeProgress.value, [0, 1], ['transparent', colors.gold]),
      transform: [{ scale: 1 + activeProgress.value * 0.15 }],
    };
  });

  return (
    <Pressable accessibilityLabel={`Mergi la pagina ${index + 1}`} hitSlop={10} onPress={() => onPress(index)}>
      <Animated.View style={[styles.dot, style]} />
    </Pressable>
  );
}

type OnboardingControlsProps = {
  activeIndex: number;
  onNext: () => void;
  onSelectPage: (index: number) => void;
};

export function OnboardingControls({ activeIndex, onNext, onSelectPage }: OnboardingControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonPlaceholder} />
      <View accessibilityLabel="Pagina de onboarding" style={styles.pagination}>
        {[0, 1, 2].map((index) => (
          <PaginationDot active={activeIndex === index} index={index} key={index} onPress={onSelectPage} />
        ))}
      </View>
      <Pressable
        accessibilityLabel="Continuă"
        accessibilityRole="button"
        onPress={onNext}
        style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}>
        <ArrowIcon height={23} width={31} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.full,
  },
  nextButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderRadius: radii.full,
  },
  nextButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonPlaceholder: {
    width: 46,
    height: 46,
  },
});
