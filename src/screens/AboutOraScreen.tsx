import Constants from 'expo-constants';
import { Text, View } from 'react-native';

import OraLogo from '@/../assets/images/ora-logo.svg';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';

export function AboutOraScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode;
  return <ProfileScreenShell title="Despre ORA Project"><View className="mt-12 items-center"><View className="h-24 w-24 items-center justify-center rounded-[28px] border border-ora-gold/40 bg-ora-surface"><OraLogo height={70} width={70} /></View><Text className="mt-6 font-inter-semibold text-2xl text-ora-primary">ORA</Text><Text className="mt-4 max-w-sm text-center font-inter text-base leading-6 text-ora-secondary">ORA este aplicația ta pentru sesiuni de gaming, puncte, recompense și experiențe cu prietenii.</Text><View className="mt-10 w-full rounded-[20px] bg-ora-surface p-5"><View className="flex-row justify-between"><Text className="font-inter text-ora-secondary">Versiune aplicație</Text><Text className="font-inter-medium text-ora-primary">{version}</Text></View>{build ? <View className="mt-4 flex-row justify-between"><Text className="font-inter text-ora-secondary">Build</Text><Text className="font-inter-medium text-ora-primary">{build}</Text></View> : null}</View></View></ProfileScreenShell>;
}
