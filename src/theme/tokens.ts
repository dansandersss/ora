import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#1E1E21',
  gold: '#C9A24B',
  textPrimary: '#F5F3EF',
  textSecondary: '#A9A7A4',
  iconBackground: '#151516',
  brandGradientStart: '#D9A441',
  brandGradientEnd: '#FFA600',
} as const;

export const spacing = {
  none: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const radii = {
  none: 0,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  full: 9999,
} as const;

export const typography = {
  size: {
    caption: 12,
    bodySmall: 14,
    body: 16,
    headingSmall: 24,
    heading: 32,
    display: 48,
  },
  lineHeight: {
    caption: 16,
    bodySmall: 20,
    body: 24,
    headingSmall: 32,
    heading: 44,
    display: 52,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } satisfies Record<string, NonNullable<TextStyle['fontWeight']>>,
} as const;

export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  deliberate: 600,
} as const;

export const shadows = {
  none: {} satisfies ViewStyle,
  small: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  } satisfies ViewStyle,
  medium: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  } satisfies ViewStyle,
  large: {
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.16)',
  } satisfies ViewStyle,
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  navigation: 100,
  overlay: 1000,
  modal: 1100,
  toast: 1200,
} as const;
