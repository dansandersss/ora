import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle, View } from 'react-native';

import { colors } from '@/theme/tokens';

type GoldGradientTextProps = Omit<TextProps, 'children'> & {
  children: ReactNode;
  className?: string;
};

const webGradientStyle = {
  backgroundClip: 'text',
  backgroundImage: `linear-gradient(90deg, ${colors.brandGradientStart}, ${colors.brandGradientEnd})`,
  color: 'transparent',
  WebkitBackgroundClip: 'text',
} as unknown as TextStyle;

/** Renders ORA's Figma GOLD gradient while preserving the text's natural layout size. */
export function GoldGradientText({ accessibilityLabel, children, className, style, ...textProps }: GoldGradientTextProps) {
  const resolvedAccessibilityLabel = accessibilityLabel ?? (typeof children === 'string' ? children : undefined);

  if (Platform.OS === 'web') {
    return (
      <Text
        {...textProps}
        accessibilityLabel={resolvedAccessibilityLabel}
        className={className}
        style={[style, webGradientStyle]}>
        {children}
      </Text>
    );
  }

  const mask = (
    <Text {...textProps} accessible={false} className={className} style={style}>
      {children}
    </Text>
  );

  return (
    <View accessible accessibilityLabel={resolvedAccessibilityLabel} accessibilityRole="text">
      <Text {...textProps} accessible={false} className={className} style={[style, styles.measure]}>
        {children}
      </Text>
      <MaskedView maskElement={mask} pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[colors.brandGradientStart, colors.brandGradientEnd]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  measure: {
    opacity: 0,
  },
});
