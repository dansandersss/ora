import Constants from 'expo-constants';
import { Text, View } from 'react-native';

import OraLogo from '@/../assets/images/ora-logo.svg';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';

export function AboutOraScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode;
  return (
    <ProfileScreenShell title="Despre ORA Project">
      <View className="mt-[36px] items-center">
        <GlassSurface
          radius={24}
          intensity={20}
          fillColor="rgba(255,255,255,0.05)"
          borderColor="rgba(226,158,62,0.34)"
          shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.20)' }}>
          <View className="h-24 w-24 items-center justify-center"><OraLogo height={70} width={70} /></View>
        </GlassSurface>
        <Text className="mt-6 font-inter-semibold text-2xl text-ora-primary">ORA</Text>
        <GlassSurface className="mt-5 w-full" radius={20} intensity={18} borderColor="rgba(226,158,62,0.28)">
          <View className="px-6 py-6">
            <Text className="text-center font-inter text-base leading-6 text-ora-secondary">
              ORA este aplicația ta pentru sesiuni de gaming, puncte, recompense și experiențe cu prietenii.
            </Text>
          </View>
        </GlassSurface>
        <GlassSurface className="mt-5 w-full" radius={20} intensity={18} borderColor="rgba(226,158,62,0.28)">
          <View className="p-5">
            <View className="flex-row justify-between">
              <Text className="font-inter text-ora-secondary">Versiune aplicație</Text>
              <Text className="font-inter-medium text-ora-primary">{version}</Text>
            </View>
            {build ? (
              <View className="mt-4 flex-row justify-between border-t border-white/10 pt-4">
                <Text className="font-inter text-ora-secondary">Build</Text>
                <Text className="font-inter-medium text-ora-primary">{build}</Text>
              </View>
            ) : null}
          </View>
        </GlassSurface>
      </View>
    </ProfileScreenShell>
  );
}
