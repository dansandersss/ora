import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

type ProfileMenuRowProps = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
};

export function ProfileMenuRow({ Icon, label, onPress }: ProfileMenuRowProps) {
  return (
    <PremiumPressable accessibilityLabel={label} onPress={onPress}>
      <GlassSurface
        radius={18}
        intensity={18}
        fillColor="rgba(255,255,255,0.045)"
        borderColor="rgba(226,158,62,0.30)"
        shadowStyle={{ boxShadow: '0 8px 20px rgba(0,0,0,0.16)' }}>
        <View className="h-16 flex-row items-center px-4">
          <View className="h-9 w-9 items-center justify-center rounded-[9px] border border-white/10 bg-white/[0.07]">
            <Icon color={colors.textSecondary} size={20} strokeWidth={1.9} />
          </View>
          <Text className="ml-3 flex-1 font-inter-medium text-base text-ora-primary">{label}</Text>
          <ChevronRight color={colors.textSecondary} size={20} strokeWidth={2.2} />
        </View>
      </GlassSurface>
    </PremiumPressable>
  );
}
