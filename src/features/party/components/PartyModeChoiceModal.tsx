import { Text, View } from 'react-native';

import { PremiumModal } from '@/components/ui/PremiumModal';
import { PremiumPressable } from '@/components/ui/PremiumPressable';

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
        <View className="w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-ora-surface p-6">
          <View className="absolute inset-x-8 top-0 h-px bg-ora-gold/50" />
          <Text className="font-inter-semibold text-2xl text-ora-primary">Sesiune cu prietenii</Text>
          <Text className="mt-2 font-inter text-sm leading-5 text-ora-secondary">Creeaza un Party ca host sau alatura-te folosind codul unui prieten.</Text>
          <View className="mt-6 gap-3">
            <PremiumPressable accessibilityLabel="Devino host Party" onPress={creating ? undefined : createHost}>
              <View className="items-center rounded-xl bg-ora-gold px-5 py-4"><Text className="font-inter-semibold text-base text-ora-dark">{creating ? 'Se creeaza Party...' : 'Devino host'}</Text></View>
            </PremiumPressable>
            <PremiumPressable accessibilityLabel="Alatura-te unui Party" onPress={join}>
              <View className="items-center rounded-xl border-2 border-ora-gold bg-ora-gold/10 px-5 py-4"><Text className="font-inter-semibold text-base text-ora-primary">Alatura-te unui Party</Text></View>
            </PremiumPressable>
            <PremiumPressable accessibilityLabel="Anuleaza" onPress={close}><Text className="py-2 text-center font-inter-medium text-sm text-ora-secondary">Anuleaza</Text></PremiumPressable>
          </View>
        </View>
    </PremiumModal>
  );
}
