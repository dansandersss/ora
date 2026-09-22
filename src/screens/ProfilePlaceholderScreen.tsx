import { Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { colors } from '@/theme/tokens';

export function ProfilePlaceholderScreen({ message, title }: { message: string; title: string }) {
  return <ProfileScreenShell title={title}><View className="mt-10 items-center rounded-[28px] border border-white/10 bg-ora-surface px-7 py-12"><View className="h-16 w-16 items-center justify-center rounded-full bg-ora-gold/15"><Sparkles color={colors.gold} size={30} /></View><Text className="mt-6 text-center font-inter-medium text-lg leading-7 text-ora-primary">{message}</Text></View></ProfileScreenShell>;
}
