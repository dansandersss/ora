import { Gamepad2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

type InactiveSessionCardProps = {
  onAddTimePress: () => void;
};

export function InactiveSessionCard({ onAddTimePress }: InactiveSessionCardProps) {
  return (
    <GlassSurface
      radius={22}
      intensity={20}
      fillColor="rgba(255,255,255,0.05)"
      borderColor="rgba(226,158,62,0.34)">
      <View className="min-h-[118px] flex-row items-center px-[16px] py-[16px]">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-[16px] bg-ora-gold/15">
          <Gamepad2 color={colors.gold} size={25} strokeWidth={1.9} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-inter-semibold text-lg leading-6 text-ora-primary">Nicio sesiune activă</Text>
          <Text className="mt-1 font-inter text-[13px] leading-[18px] text-ora-secondary">
            Începe o sesiune pe PC sau Xbox pentru a urmări timpul și a câștiga puncte.
          </Text>
          <PremiumPressable accessibilityLabel="Cum adaug timp" className="self-start" onPress={onAddTimePress}>
            <Text className="mt-1.5 font-inter-semibold text-sm text-ora-gold">Cum adaug timp?</Text>
          </PremiumPressable>
        </View>
      </View>
    </GlassSurface>
  );
}
