import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plus, UserRound } from 'lucide-react-native';
import { Platform, Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import type { SessionParty } from '@/features/party/types';
import { colors } from '@/theme/tokens';

type PartySectionProps = {
  currentUserId?: string;
  party: SessionParty;
  sessionId: string;
};

function PartyAvatar({ finished, index, name, role }: { finished: boolean; index: number; name?: string | null; role: 'host' | 'member' }) {
  return (
    <Entrance delay={index * 55}>
      <View className="items-center">
        <View className={`h-14 w-14 items-center justify-center rounded-full border-[3px] ${finished ? 'border-ora-divider bg-ora-surface opacity-55' : 'border-ora-divider bg-ora-surface'}`}>
          <View className={`h-10 w-10 items-center justify-center rounded-full ${finished ? 'bg-ora-divider' : 'bg-ora-gold'}`}>
            <UserRound color={finished ? colors.textSecondary : colors.iconBackground} fill={finished ? colors.textSecondary : colors.iconBackground} size={23} />
          </View>
        </View>
        {name ? <Text className="mt-1 max-w-14 font-inter-medium text-[10px] text-ora-primary" numberOfLines={1}>{name}</Text> : null}
        {role === 'host' ? <Text className="font-inter-medium text-[9px] text-ora-gold">Host</Text> : null}
      </View>
    </Entrance>
  );
}

export function PartySection({ currentUserId, party, sessionId }: PartySectionProps) {
  const members = [...party.members].sort((a, b) => Number(b.role === 'host') - Number(a.role === 'host'));
  const isHost = currentUserId === party.hostUserId;

  return (
    <View className="mt-5">
      <Text className="mb-3 font-inter-medium text-sm tracking-wide text-ora-primary">PARTY</Text>
      <View className="flex-row items-start gap-3">
        {members.map((member, index) => (
          <PartyAvatar finished={member.sessionStatus === 'finished'} index={index} key={member.id} name={member.name} role={member.role} />
        ))}
        {isHost && members.length < party.maxMembers ? (
          <Entrance delay={members.length * 55}>
            <PremiumPressable
              accessibilityLabel="Invita prieteni"
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
                router.push(`/sessions/${sessionId}/invite`);
              }}>
              <View className="h-14 w-14 items-center justify-center rounded-full border-[3px] border-ora-divider bg-ora-background/60">
                <Plus color={colors.textPrimary} size={25} strokeWidth={1.8} />
              </View>
            </PremiumPressable>
          </Entrance>
        ) : null}
      </View>
    </View>
  );
}
