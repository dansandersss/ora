import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

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
        <GlassSurface
          radius={18}
          intensity={selected ? 22 : 18}
          fillColor={selected ? 'rgba(226,158,62,0.105)' : 'rgba(255,255,255,0.045)'}
          borderColor={selected ? 'rgba(255,166,0,0.86)' : 'rgba(255,255,255,0.14)'}
          >
          <View className="h-14 w-full flex-row items-center justify-between px-5">
            <View className="flex-row items-center">
              <View
                className="h-[22px] w-[22px] items-center justify-center border-2"
                style={{
                  backgroundColor: selected ? colors.brandGradientStart : 'transparent',
                  borderColor: selected ? colors.brandGradientStart : colors.textSecondary,
                  borderRadius: 200,
                  boxShadow: selected ? '0 0 12px rgba(226,158,62,0.55)' : undefined,
                }}
              />
              <Text className="ml-4 font-inter-semibold text-base text-ora-primary">{durationLabel}</Text>
            </View>
            <Text className={`font-inter-semibold text-base ${selected ? 'text-ora-gold' : 'text-ora-secondary'}`}>{priceMdl} MDL</Text>
          </View>
        </GlassSurface>
      </Animated.View>
    </PremiumPressable>
  );
}
