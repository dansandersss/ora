import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plus, UserRound } from 'lucide-react-native';
import { Platform, Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import type { SessionParty } from '@/features/party/types';
import { colors } from '@/theme/tokens';

type PartySectionProps = {
  party: SessionParty;
  sessionId: string;
};

function PartyAvatar({ finished, index, name, role }: { finished: boolean; index: number; name?: string | null; role: 'host' | 'member' }) {
  const isHost = role === 'host';
  const avatarSize = isHost ? 70 : 50;
  const innerSize = isHost ? 54 : 36;
  const iconSize = isHost ? 28 : 21;
  const columnWidth = isHost ? 78 : 60;

  return (
    <Entrance delay={index * 55}>
      <View className="items-center" style={{ width: columnWidth }}>
        <View
          className={`items-center justify-center border-[3px] ${finished ? 'border-ora-divider bg-black/25 opacity-55' : 'border-white/10 bg-black/25'}`}
          style={{ borderRadius: 200, height: avatarSize, width: avatarSize }}>
          <View
            className={`items-center justify-center ${finished ? 'bg-ora-divider' : 'bg-ora-gold'}`}
            style={{ borderRadius: 200, height: innerSize, width: innerSize }}>
            <UserRound color={finished ? colors.textSecondary : colors.iconBackground} fill={finished ? colors.textSecondary : colors.iconBackground} size={iconSize} />
          </View>
        </View>
        {name ? <Text className="mt-2 text-center font-inter-medium text-[9px] leading-[11px] text-ora-primary" numberOfLines={1} style={{ maxWidth: columnWidth }}>{name}</Text> : null}
        {role === 'host' ? <Text className="mt-0.5 font-inter text-[8px] leading-[10px] text-ora-secondary">Host</Text> : null}
      </View>
    </Entrance>
  );
}

export function PartySection({ party, sessionId }: PartySectionProps) {
  const members = [...party.members].sort((a, b) => Number(b.role === 'host') - Number(a.role === 'host'));
  const isHost = party.gamingSessionId === sessionId;

  return (
    <GlassSurface
      className="mt-[26px]"
      radius={18}
      intensity={20}
      fillColor="rgba(255,255,255,0.05)"
      borderColor="rgba(226,158,62,0.30)"
      shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.22)' }}>
      <View className="min-h-[128px] flex-row items-center justify-around px-4 py-[22px]">
        {members.map((member, index) => (
          <PartyAvatar finished={member.sessionStatus === 'finished'} index={index} key={member.id} name={member.name} role={member.role} />
        ))}
        {isHost && members.length < party.maxMembers ? (
          <Entrance delay={members.length * 55}>
            <PremiumPressable
              accessibilityLabel="Invită prieteni"
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
                router.push(`/sessions/${sessionId}/invite`);
              }}>
              <View className="w-[50px] items-center">
                <View
                  className="items-center justify-center border-[3px] border-white/10 bg-black/25"
                  style={{ borderRadius: 200, height: 40, width: 40 }}>
                  <Plus color={colors.textPrimary} size={22} strokeWidth={1.8} />
                </View>
              </View>
            </PremiumPressable>
          </Entrance>
        ) : null}
      </View>
    </GlassSurface>
  );
}
