import { Image } from 'expo-image';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import CheckIcon from '@/../assets/images/check.svg';
import type { OnboardingSlideData } from '@/components/onboarding/onboarding-data';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function OnboardingSlide({ slide }: { slide: OnboardingSlideData }) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(width, 430) - 44;
  const Icon = slide.Icon;
  const hero = slide.variant === 'hero';
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex-1 items-center px-[22px] pb-[16px]" style={{ paddingTop: hero ? 8 : Math.max(38, Math.min(height * 0.14, 136)) }}>
        {hero ? (
          <View className="w-full overflow-hidden rounded-[2px] bg-ora-dark" style={{ height: Math.min(contentWidth * 0.9, height * 0.37) }}>
            <Image accessibilityLabel="Cameră de gaming ORA" contentFit="cover" source={require('@/../assets/images/onboarding.png')} style={{ width: '100%', height: '100%' }} />
          </View>
        ) : (
          <GlassSurface className="h-[200px] w-[200px]" radius={102} fillColor="rgba(184,130,40,0.07)" borderColor="rgba(184,130,40,0.40)">
            <View className="h-[204px] w-[204px] items-center justify-center">
              {Icon && <Icon accessibilityLabel={slide.title} width={slide.id === 'rewards' ? 100 : 88} height={slide.id === 'rewards' ? 100 : 88} />}
            </View>
          </GlassSurface>
        )}
        <View className={`w-full ${hero ? 'mt-[24px]' : 'mt-[48px] items-center'}`}>
          <Text className={`font-inter text-[30px] leading-[38px] text-ora-primary ${hero ? '' : 'text-center'}`}>{slide.title}</Text>
          {hero && <Text className="font-inter-semibold text-[44px] leading-[52px] text-[#D9A441]">ORA Project</Text>}
          {slide.description && <GlassSurface className="mt-[12px] w-full" radius={16} fillColor="rgba(164,123,53,0.07)" borderColor="rgba(184,130,40,0.25)"><View className="px-[12px] py-[12px]"><Text className="text-center font-inter text-[16px] leading-[21px] text-ora-secondary">{slide.description}</Text></View></GlassSurface>}
        </View>
        {slide.benefits && <View className="mt-[20px] w-full gap-[10px]">
          {slide.benefits.map((benefit) => <GlassSurface key={benefit} radius={16} fillColor="rgba(255,255,255,0.045)" borderColor="rgba(255,255,255,0.10)">
            <View className="min-h-[52px] flex-row items-center gap-[12px] px-[16px] py-[10px]"><CheckIcon height={12} width={12} /><Text className="flex-1 font-inter text-[14px] leading-[20px] text-ora-primary">{benefit}</Text></View>
          </GlassSurface>)}
        </View>}
      </View>
    </ScrollView>
  );
}
