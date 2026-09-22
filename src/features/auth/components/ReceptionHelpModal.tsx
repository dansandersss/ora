import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumModal } from '@/components/ui/PremiumModal';

type ReceptionHelpModalProps = {
  onClose: () => void;
  visible: boolean;
};

export function ReceptionHelpModal({ onClose, visible }: ReceptionHelpModalProps) {
  return (
    <PremiumModal accessibilityLabel="Ajutor pentru autentificare" onClose={onClose} visible={visible}>
      <GlassSurface radius={30} intensity={32} fillColor="rgba(35,31,27,0.66)" borderColor="rgba(186,135,61,0.45)" shadowStyle={{ boxShadow: '0 18px 48px rgba(0,0,0,0.48), 0 0 28px rgba(225,154,55,0.12)' }}>
      <View className="px-7 pb-10 pt-10">
        <LinearGradient
          colors={['transparent', 'rgba(224,151,55,0.05)', 'rgba(225,154,55,0.18)', 'transparent']}
          locations={[0, 0.48, 0.78, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', pointerEvents: 'none' }}
        />
        <View className="mb-6 h-[72px] w-[72px] items-center justify-center self-center rounded-[23px] bg-[#D99D47]/20">
          <Text className="font-inter-medium text-[48px] leading-[59px] text-[#F2AF39]">!</Text>
        </View>
        <Text className="text-center font-inter-semibold text-[23px] leading-[30px] text-ora-primary">Ai nevoie de ajutor?</Text>
        <Text className="mt-2 text-center font-inter text-[17px] leading-[26px] text-ora-secondary">
          Pentru recuperarea PIN-codului sau crearea unui cont nou, te rugăm să te adresezi recepției ORA.
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
