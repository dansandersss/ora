import { Text, View } from 'react-native';

import StarIcon from '@/../assets/images/star.svg';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function PointsRuleRow({ label, points }: { label: string; points: number }) {
  return (
    <GlassSurface
      radius={16}
      intensity={18}
      fillColor="rgba(255,255,255,0.042)"
      borderColor="rgba(226,158,62,0.28)"
      shadowStyle={{ boxShadow: '0 7px 18px rgba(0,0,0,0.16)' }}>
      <View className="h-[64px] flex-row items-center justify-between px-3">
        <View className="min-w-0 flex-1 flex-row items-center">
          <View className="h-9 w-9 p-2 shrink-0 items-center justify-center rounded-[9px] border border-ora-gold/30 bg-ora-gold/10">
            <StarIcon height={16} width={16} />
          </View>
          <Text className="ml-3 min-w-0 flex-1 font-inter-semibold text-sm text-ora-primary" numberOfLines={1}>{label}</Text>
        </View>
        <Text className="ml-3 font-inter-semibold text-sm text-ora-gold">+{points} P</Text>
      </View>
    </GlassSurface>
  );
}
