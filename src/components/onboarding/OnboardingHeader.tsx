import { Pressable, StyleSheet, Text, View } from 'react-native';

import OraLogo from '@/../assets/images/ora-logo.svg';
import { colors, spacing, typography } from '@/theme/tokens';

type OnboardingHeaderProps = {
  onSkip: () => void;
};

export function OnboardingHeader({ onSkip }: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <OraLogo accessibilityLabel="ORA Project" height={44} width={80} />
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Sari peste</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    minWidth: 72,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    paddingHorizontal: spacing.one,
  },
});
