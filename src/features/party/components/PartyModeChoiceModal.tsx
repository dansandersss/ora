import { ActivityIndicator, Text, View } from 'react-native';
import { Gamepad2, LogIn, UserRoundPlus, type LucideIcon } from 'lucide-react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumModal } from '@/components/ui/PremiumModal';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

type PartyModeChoiceModalProps = {
  creating?: boolean;
  onClose: () => void;
  onCreateHost: () => void;
  onJoin: () => void;
  visible: boolean;
};

function releaseWebFocus() {
  if (typeof document === 'undefined') return;
  const focusedElement = document.activeElement;
  if (focusedElement instanceof HTMLElement) focusedElement.blur();
}

type PartyChoiceCardProps = {
  accessibilityLabel: string;
  accent: string;
  description: string;
  Icon: LucideIcon;
  onPress?: () => void;
  title: string;
};

function PartyChoiceCard({ accessibilityLabel, accent, description, Icon, onPress, title }: PartyChoiceCardProps) {
  return (
    <GlassSurface
      className="flex-1"
      radius={21}
      intensity={18}
      fillColor="rgba(19,17,14,0.42)"
      borderColor="rgba(226,158,62,0.34)"
      shadowStyle={{ boxShadow: '0 10px 24px rgba(0,0,0,0.22)' }}>
      <PremiumPressable accessibilityLabel={accessibilityLabel} onPress={onPress}>
        <View className="h-[166px] items-center justify-center px-3 py-4">
          <View className="h-12 w-12 items-center justify-center rounded-[14px] border border-ora-gold/45 bg-ora-gold/10">
            <Icon color={colors.brandGradientEnd} size={27} strokeWidth={1.9} />
          </View>
          <Text className="mt-3 text-center font-inter-semibold text-xs text-ora-primary" numberOfLines={2}>
            {title} <Text className="text-ora-gold">{accent}</Text>
          </Text>
          <Text className="mt-2 text-center font-inter text-[11px] leading-[14px] text-ora-secondary" numberOfLines={3}>
            {description}
          </Text>
        </View>
      </PremiumPressable>
    </GlassSurface>
  );
}

export function PartyModeChoiceModal({ creating = false, onClose, onCreateHost, onJoin, visible }: PartyModeChoiceModalProps) {
  const close = () => {
    releaseWebFocus();
    onClose();
  };
  const createHost = () => {
    releaseWebFocus();
    onCreateHost();
  };
  const join = () => {
    releaseWebFocus();
    onJoin();
  };

  return (
    <PremiumModal accessibilityLabel="Opțiuni Party" onClose={close} visible={visible}>
      <GlassSurface
        radius={28}
        intensity={20}
        fillColor="rgba(255,255,255,0.055)"
        borderColor="rgba(226,158,62,0.38)"
        shadowStyle={{ boxShadow: '0 20px 52px rgba(226,158,62,0.16)' }}>
        <View className="px-5 pb-5 pt-7">
          <View className="items-center">
            <View className="h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-ora-gold/15">
              <Gamepad2 color={colors.textPrimary} size={34} strokeWidth={1.9} />
            </View>
            <Text className="mt-5 text-center font-inter-semibold text-xl text-ora-primary">Joacă împreună</Text>
            <Text className="mt-1 max-w-[280px] text-center font-inter text-sm leading-5 text-ora-secondary">
              Creează o sesiune pentru prieteni sau alătură-te uneia existente.
            </Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <PartyChoiceCard
              accessibilityLabel="Creează o sesiune Party"
              accent="sesiune"
              description="Primești un cod și un QR pentru prieteni."
              Icon={UserRoundPlus}
              onPress={creating ? undefined : createHost}
              title="Creează o"
            />
            <PartyChoiceCard
              accessibilityLabel="Alătură-te unei sesiuni Party"
              accent="sesiuni"
              description="Scanează QR-ul sau introdu codul."
              Icon={LogIn}
              onPress={creating ? undefined : join}
              title="Alătură-te unei"
            />
          </View>

          {creating ? (
            <View className="mt-5 h-[52px] flex-row items-center justify-center rounded-[14px] border border-ora-gold/55">
              <ActivityIndicator color={colors.brandGradientEnd} size="small" />
              <Text className="ml-2 font-inter-medium text-sm text-ora-primary">Se creează sesiunea...</Text>
            </View>
          ) : (
            <PremiumPressable accessibilityLabel="Anulează" className="mt-5" onPress={close}>
              <View className="h-[52px] items-center justify-center rounded-[14px] border border-ora-gold">
                <Text className="font-inter-medium text-base text-ora-primary">Anulează</Text>
              </View>
            </PremiumPressable>
          )}
        </View>
      </GlassSurface>
    </PremiumModal>
  );
}
