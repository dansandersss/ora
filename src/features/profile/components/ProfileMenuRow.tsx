import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

type ProfileMenuRowProps = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
};

export function ProfileMenuRow({ Icon, label, onPress, showDivider = true }: ProfileMenuRowProps) {
  return (
    <PremiumPressable accessibilityLabel={label} onPress={onPress}>
      <View className={`h-[62px] flex-row items-center px-5 ${showDivider ? 'border-b border-ora-divider' : ''}`}>
        <Icon color={colors.textPrimary} size={20} strokeWidth={1.8} />
        <Text className="ml-4 flex-1 font-inter-medium text-base text-ora-primary">{label}</Text>
        <ChevronRight color={colors.textPrimary} size={20} strokeWidth={2} />
      </View>
    </PremiumPressable>
  );
}
