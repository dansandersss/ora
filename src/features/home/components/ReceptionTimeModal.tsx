import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import ExclamationIcon from '@/../assets/images/exclamation.svg';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumModal } from '@/components/ui/PremiumModal';

type ReceptionTimeModalProps = { onClose: () => void; visible: boolean };

export function ReceptionTimeModal({ onClose, visible }: ReceptionTimeModalProps) {
  return (
    <PremiumModal accessibilityLabel="Rezervarea unei stații" onClose={onClose} visible={visible}>
      <GlassSurface
        borderColor="rgba(186,135,61,0.45)"
        fillColor="rgba(35,31,27,0.66)"
        intensity={20}
        radius={30}
        shadowStyle={{ boxShadow: '0 18px 48px rgba(0,0,0,0.48), 0 0 28px rgba(225,154,55,0.12)' }}>
        <View className="px-7 pb-10 pt-10">
          <LinearGradient
            colors={['transparent', 'rgba(224,151,55,0.05)', 'rgba(225,154,55,0.18)', 'transparent']}
            locations={[0, 0.48, 0.78, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', pointerEvents: 'none' }}
          />
          <View className="mb-3 h-[48px] w-[48px] items-center justify-center self-center rounded-[14px] bg-[#D99D47]/20">
            <ExclamationIcon height={48} width={48} />
          </View>
          <Text className="text-center font-inter-semibold text-[15px] leading-[30px] text-ora-primary">Rezervarea unei stații</Text>
          <Text className="mt-2 text-center font-inter text-[13px]  text-ora-secondary">
            Se face la recepție. Adresează-te unui membru al echipei ORA, iar noi te vom ajuta cu rezervarea.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-8 h-[48px] w-full max-w-[258px] items-center justify-center self-center overflow-hidden rounded-[9px] active:opacity-90"
            onPress={onClose}>
            <LinearGradient colors={['#F0B54E', '#DA963C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
              <Text className="font-inter-medium text-[19px] text-[#201A12]">Am înțeles</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </GlassSurface>
    </PremiumModal>
  );
}
