import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { shadows } from '@/theme/tokens';

type ExtensionOptionProps = { durationLabel: string; onPress: () => void; priceMdl: number; selected: boolean };

export function ExtensionOption({ durationLabel, onPress, priceMdl, selected }: ExtensionOptionProps) {
  const selection = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    selection.value = withTiming(selected ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.System });
  }, [selected, selection]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + selection.value * 0.006 }],
  }));
  return (
    <PremiumPressable accessibilityLabel={`${durationLabel}, ${priceMdl} MDL`} className="w-full" onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <View
          className={`h-[74px] w-full flex-row items-center justify-between rounded-xl border-2 px-5 ${selected ? 'border-ora-gold bg-ora-gold/5' : 'border-ora-divider bg-ora-background/20'}`}
          style={selected ? shadows.small : undefined}>
          <Text className="font-inter text-lg text-ora-secondary">{durationLabel}</Text>
          <Text className="font-inter text-lg text-ora-gold">{priceMdl} MDL</Text>
        </View>
      </Animated.View>
    </PremiumPressable>
  );
}
