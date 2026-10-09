import { ActivityIndicator, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/AppScreen';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { colors } from '@/theme/tokens';

export function PremiumTabLoader({ label }: { label: string }) {
  return (
      <AppScreen backgroundClassName="bg-transparent">
        <View className="flex-1 items-center justify-center pb-24">
          <GlassSurface
            borderColor="rgba(226,158,62,0.30)"
            fillColor="rgba(255,255,255,0.045)"
            intensity={18}
            radius={20}
            shadowStyle={{ boxShadow: '0 10px 30px rgba(226,158,62,0.10)' }}>
            <View accessibilityLabel={label} accessibilityRole="progressbar" className="min-w-[174px] items-center px-7 py-6">
              <ActivityIndicator color={colors.gold} />
              <Text className="mt-3 font-inter-medium text-sm text-ora-secondary">{label}</Text>
            </View>
          </GlassSurface>
        </View>
      </AppScreen>
  );
}
