import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import CheckIcon from '@/../assets/images/check.svg';
import type { OnboardingSlideData } from '@/components/onboarding/onboarding-data';
import { colors, radii, spacing, typography } from '@/theme/tokens';

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
};

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  const { height, width } = useWindowDimensions();
  const compact = height < 740;
  const horizontalInset = compact ? spacing.four : spacing.five;
  const contentWidth = Math.min(width - horizontalInset * 2, 420);
  const Icon = slide.Icon;

  return (
    <View
      style={[
        styles.container,
        slide.variant === 'hero' ? styles.heroContainer : styles.iconContainer,
        { paddingHorizontal: horizontalInset },
      ]}>
      {slide.variant === 'hero' ? (
        <View
          style={[
            styles.heroFrame,
            {
              width: contentWidth,
              height: Math.min(contentWidth * 0.9, compact ? height * 0.34 : height * 0.37),
            },
          ]}>
          <Image
            accessibilityLabel="Cameră de gaming ORA"
            contentFit="cover"
            source={require('@/../assets/images/onboarding.png')}
            style={styles.heroImage}
          />
        </View>
      ) : (
        Icon && <Icon accessibilityLabel={slide.title} height={compact ? 138 : 168} width={compact ? 138 : 168} />
      )}

      <View
        style={[
          styles.copy,
          slide.variant === 'hero' ? styles.heroCopy : styles.iconCopy,
          { marginTop: compact ? spacing.three : slide.variant === 'hero' ? spacing.five : spacing.six },
        ]}>
        <Text style={slide.variant === 'hero' ? styles.heroTitle : styles.iconTitle}>{slide.title}</Text>
        {slide.variant === 'hero' && <Text style={styles.brandTitle}>ORA Project</Text>}
        {slide.description && <Text style={styles.description}>{slide.description}</Text>}
      </View>

      {slide.benefits && (
        <View style={[styles.benefits, { width: contentWidth, marginTop: compact ? spacing.three : spacing.five }]}> 
          {slide.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <CheckIcon height={14} width={14} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  heroContainer: {
    justifyContent: 'flex-start',
    paddingTop: spacing.four,
  },
  iconContainer: {
    justifyContent: 'flex-start',
    paddingTop: '16%',
  },
  heroFrame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.iconBackground,
    borderRadius: radii.extraLarge,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  copy: {
    width: '100%',
  },
  heroCopy: {
    alignItems: 'center',
  },
  iconCopy: {
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  iconTitle: {
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
  },
  brandTitle: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.three,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    textAlign: 'center',
    opacity: 0.72,
  },
  benefits: {
    gap: 12,
    alignSelf: 'center',
    alignItems: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
});
