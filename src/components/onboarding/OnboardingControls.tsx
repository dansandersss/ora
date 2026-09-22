import { Pressable, Text, View } from 'react-native';

type Props = { activeIndex: number; onNext: () => void; onSelectPage: (index: number) => void };
export function OnboardingControls({ activeIndex, onNext, onSelectPage }: Props) {
  return <View className="h-[64px] flex-row items-center justify-between">
    <Pressable accessibilityRole="button" accessibilityLabel="Pagina precedentă" disabled={activeIndex === 0} onPress={() => onSelectPage(activeIndex - 1)} className="h-[44px] w-[72px] justify-center">
      {activeIndex > 0 && <Text className="font-inter text-xs text-ora-secondary">Înapoi</Text>}
    </Pressable>
    <View className="flex-row" accessibilityLabel={`Pagina ${activeIndex + 1} din 3`}>
      {[0, 1, 2].map(index => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Mergi la pagina ${index + 1}`} accessibilityState={{ selected: activeIndex === index }} onPress={() => onSelectPage(index)} className="h-[44px] w-[28px] items-center justify-center">
        <View className={`h-[9px] w-[9px] rounded-full border border-ora-gold ${activeIndex === index ? 'bg-ora-gold' : 'bg-transparent'}`} />
      </Pressable>)}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={activeIndex === 2 ? 'Începe' : 'Continuă'} onPress={onNext} className="h-[44px] w-[72px] items-end justify-center">
      <Text className="font-inter text-xs text-ora-gold">{activeIndex === 2 ? 'Începe' : 'Continuă'}</Text>
    </Pressable>
  </View>;
}
