import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlaceholderTabScreenProps = { subtitle: string; title: string };

export function PlaceholderTabScreen({ subtitle, title }: PlaceholderTabScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-ora-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-inter-medium text-3xl text-ora-primary">{title}</Text>
        <Text className="mt-2 font-inter text-base text-ora-secondary">{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}
