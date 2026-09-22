import { Text, View } from 'react-native';

export function PointsRuleRow({ label, points }: { label: string; points: number }) {
  return (
    <View className="min-h-12 flex-row items-center justify-between rounded-lg border border-ora-divider/70 bg-ora-surface/20 px-4 py-2.5">
      <Text className="font-inter text-sm text-ora-secondary">{label}</Text>
      <Text className="font-inter-medium text-sm text-ora-gold">+{points} P</Text>
    </View>
  );
}
