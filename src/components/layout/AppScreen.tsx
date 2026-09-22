import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHONE_FRAME_MAX_WIDTH = 430;
const DESIGN_WIDTH = 393;
const MIN_HORIZONTAL_PADDING = 21;
const BASE_HORIZONTAL_PADDING = 22;
const MAX_HORIZONTAL_PADDING = 26;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function useAppLayout() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, PHONE_FRAME_MAX_WIDTH);
  const horizontalPadding = clamp(
    BASE_HORIZONTAL_PADDING + ((contentWidth - DESIGN_WIDTH) * 4) / (PHONE_FRAME_MAX_WIDTH - DESIGN_WIDTH),
    MIN_HORIZONTAL_PADDING,
    MAX_HORIZONTAL_PADDING,
  );

  return useMemo(
    () => ({ contentWidth, horizontalPadding }),
    [contentWidth, horizontalPadding],
  );
}

type AppScreenProps = PropsWithChildren<{
  backgroundClassName?: string;
}>;

export function AppScreen({ backgroundClassName = 'bg-ora-background', children }: AppScreenProps) {
  return (
    <SafeAreaView className={`flex-1 ${backgroundClassName}`} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

type AppContentProps = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function AppContent({ children, className, style }: AppContentProps) {
  const { horizontalPadding } = useAppLayout();

  return (
    <View
      className={className}
      style={[{
        alignSelf: 'center',
        maxWidth: PHONE_FRAME_MAX_WIDTH,
        paddingHorizontal: horizontalPadding,
        width: '100%',
      }, style]}
    >
      {children}
    </View>
  );
}
