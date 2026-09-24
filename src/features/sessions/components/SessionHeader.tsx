import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import BackIcon from '@/../assets/images/Active Session/back.svg';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { PremiumPressable } from '@/components/ui/PremiumPressable';

type SessionHeaderProps = {
  backLabel: string;
  onBack: () => void;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightContent?: ReactNode;
  title: string;
  titleParts?: { text: string; color?: string; gradient?: boolean }[];
  titleSize?: 'compact' | 'default';
  subtitle?: string;
};

/** Shared Sessions header that keeps the centered title stable with or without a right action. */
export function SessionHeader({ backLabel, onBack, onRightPress, rightAccessibilityLabel, rightContent, title, titleParts, titleSize = 'default', subtitle }: SessionHeaderProps) {
  const titleClassName = `font-inter-semibold text-ora-primary ${titleSize === 'compact' ? 'text-lg' : 'text-xl'}`;

  return (
    <View className="flex-row items-center justify-between py-2">
      <PremiumPressable accessibilityLabel={backLabel} onPress={onBack}>
        <View className="h-12 w-12 items-center justify-center"><BackIcon height={40} width={40} /></View>
      </PremiumPressable>
      <View className="min-w-0 flex-1 items-center justify-center">
        {titleParts ? (
          <View accessible accessibilityLabel={title} className="flex-row items-center justify-center">
            {titleParts.map((part, index) => part.gradient ? (
              <GoldGradientText accessible={false} className={titleClassName} key={`${index}-${part.text}`}>
                {part.text}
              </GoldGradientText>
            ) : (
              <Text accessible={false} className={titleClassName} key={`${index}-${part.text}`} style={part.color ? { color: part.color } : undefined}>
                {part.text}
              </Text>
            ))}
          </View>
        ) : (
          <Text accessibilityLabel={title} className={`text-center ${titleClassName}`} numberOfLines={1}>{title}</Text>
        )}
        {subtitle ? <Text className="mt-0.5 text-center font-inter text-xs text-ora-secondary" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {rightContent && onRightPress && rightAccessibilityLabel ? (
        <PremiumPressable accessibilityLabel={rightAccessibilityLabel} onPress={onRightPress}>
          <View className="h-12 w-12 items-center justify-center">{rightContent}</View>
        </PremiumPressable>
      ) : <View className="h-12 w-12 items-center justify-center">{rightContent}</View>}
    </View>
  );
}
