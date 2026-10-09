import { Text, View } from 'react-native';

import GiftIcon from '@/../assets/images/gift.svg';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function ProfilePlaceholderScreen({ message, title }: { message: string; title: string }) {
  return (
    <ProfileScreenShell title={title}>
      <GlassSurface
        className="mt-[34px]"
        radius={24}
        intensity={20}
        fillColor="rgba(255,255,255,0.05)"
        borderColor="rgba(226,158,62,0.32)"
        shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.20)' }}>
        <View className="items-center px-7 py-12">
          <View className="h-16 w-16 items-center justify-center rounded-[18px] border border-ora-gold/35 bg-ora-gold/15">
            <GiftIcon height={34} width={34} />
          </View>
          <Text className="mt-6 text-center font-inter-medium text-lg leading-7 text-ora-primary">{message}</Text>
        </View>
      </GlassSurface>
    </ProfileScreenShell>
  );
}
