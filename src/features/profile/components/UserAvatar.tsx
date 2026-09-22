import { Image } from 'expo-image';
import { UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme/tokens';

export function UserAvatar({ avatarUrl, size = 104 }: { avatarUrl?: string | null; size?: number }) {
  return (
    <View className="items-center justify-center rounded-full border-[5px] border-ora-gold bg-ora-dark" style={{ height: size, width: size }}>
      {avatarUrl ? (
        <Image accessibilityLabel="Fotografie de profil" contentFit="cover" source={{ uri: avatarUrl }} style={{ borderRadius: size, height: size - 18, width: size - 18 }} />
      ) : (
        <View className="items-center justify-center rounded-full bg-ora-gold" style={{ height: size - 26, width: size - 26 }}>
          <UserRound color={colors.iconBackground} fill={colors.iconBackground} size={Math.round(size * 0.43)} strokeWidth={1.8} />
        </View>
      )}
    </View>
  );
}
