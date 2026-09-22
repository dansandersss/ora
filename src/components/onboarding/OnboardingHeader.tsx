import { Pressable, Text, View } from 'react-native';
import OraLogo from '@/../assets/images/ora-logo.svg';

export function OnboardingHeader({ onSkip }: { onSkip: () => void }) {
  return (
    <View className="min-h-[64px] flex-row items-center justify-between">
      <OraLogo accessibilityLabel="ORA Project" height={38} width={68} />
      <Pressable accessibilityRole="button" className="min-h-[44px] min-w-[72px] items-end justify-center" onPress={onSkip}>
        <Text className="font-inter text-xs text-ora-secondary">Sari peste</Text>
      </Pressable>
    </View>
  );
}
