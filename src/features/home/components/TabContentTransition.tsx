import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect } from 'react';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TAB_TRANSITION_DURATION = 180;
const ActiveTabContext = createContext('home');

export const ActiveTabProvider = ActiveTabContext.Provider;

type TabContentTransitionProps = PropsWithChildren<{ tabName: string }>;

export function TabContentTransition({ children, tabName }: TabContentTransitionProps) {
  const activeTab = useContext(ActiveTabContext);
  const progress = useSharedValue(activeTab === tabName ? 1 : 0);

  useEffect(() => {
    const isActive = activeTab === tabName;
    progress.set(
      withTiming(isActive ? 1 : 0, {
        duration: isActive ? TAB_TRANSITION_DURATION : 180,
        easing: isActive ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [activeTab, progress, tabName]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: 0.96 + progress.value * 0.04,
    transform: [{ translateY: (1 - progress.value) * 4 }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
