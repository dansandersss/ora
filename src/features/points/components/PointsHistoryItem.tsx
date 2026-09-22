import { Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import type { PointsTransaction } from '@/features/points/types';
import { formatPointsDate, formatPointsTime, getPointsReasonLabel } from '@/features/points/utils';

export function PointsHistoryItem({ index, transaction }: { index: number; transaction: PointsTransaction }) {
  const positive = transaction.amount >= 0;
  return (
    <Entrance delay={Math.min(index, 5) * 35}>
      <View accessible accessibilityLabel={`${getPointsReasonLabel(transaction.reason)}, ${transaction.amount} puncte`} className="mb-3 flex-row items-center rounded-2xl border-2 border-black/70 bg-ora-surface px-5 py-4">
        <Text className="min-w-0 flex-1 font-inter-medium text-base text-ora-primary">{getPointsReasonLabel(transaction.reason)}</Text>
        <Text className={`mx-4 font-inter-semibold text-xl ${positive ? 'text-ora-gold' : 'text-ora-error'}`}>{positive ? '+' : ''}{transaction.amount} P</Text>
        <View className="items-end">
          <Text className="font-inter text-xs text-ora-secondary">{formatPointsDate(transaction.createdAt)}</Text>
          <Text className="mt-1 font-inter text-xs text-ora-secondary">{formatPointsTime(transaction.createdAt)}</Text>
        </View>
      </View>
    </Entrance>
  );
}
