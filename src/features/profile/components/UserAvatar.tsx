import { Image } from 'expo-image';
import { UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

export function UserAvatar({ avatarUrl, name, size = 104 }: { avatarUrl?: string | null; name?: string | null; size?: number }) {
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <View
      className="items-center justify-center bg-ora-dark"
      style={{ borderColor: colors.brandGradientStart, borderRadius: 200, borderWidth: size <= 70 ? 2 : 5, height: size, width: size }}>
      {avatarUrl ? (
        <Image accessibilityLabel="Fotografie de profil" contentFit="cover" source={{ uri: avatarUrl }} style={{ borderRadius: size, height: size - 18, width: size - 18 }} />
      ) : initial ? (
        <Text className="font-inter-semibold text-ora-primary" style={{ fontSize: Math.round(size * 0.37) }}>{initial}</Text>
      ) : (
        <View className="items-center justify-center rounded-full bg-ora-gold" style={{ height: size - 26, width: size - 26 }}>
          <UserRound color={colors.iconBackground} fill={colors.iconBackground} size={Math.round(size * 0.43)} strokeWidth={1.8} />
        </View>
      )}
    </View>
  );
}
