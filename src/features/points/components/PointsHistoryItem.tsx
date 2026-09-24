import { Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { PointsTransaction } from '@/features/points/types';
import { formatPointsDate, formatPointsTime, getPointsReasonLabel } from '@/features/points/utils';

export function PointsHistoryItem({ index, transaction }: { index: number; transaction: PointsTransaction }) {
  const positive = transaction.amount >= 0;
  return (
    <Entrance delay={Math.min(index, 5) * 35}>
      <GlassSurface
        className="mb-3"
        radius={18}
        intensity={18}
        fillColor="rgba(255,255,255,0.045)"
        borderColor="rgba(226,158,62,0.30)"
        shadowStyle={{ boxShadow: '0 8px 20px rgba(0,0,0,0.16)' }}>
        <View
          accessible
          accessibilityLabel={`${getPointsReasonLabel(transaction.reason)}, ${transaction.amount} puncte`}
          className="min-h-[72px] flex-row items-center px-4 py-3">
          <View className="min-w-0 flex-1">
            <Text className="font-inter-semibold text-base text-ora-primary" numberOfLines={1}>{getPointsReasonLabel(transaction.reason)}</Text>
            <Text className="mt-1 font-inter text-xs text-ora-secondary" numberOfLines={1}>
              {formatPointsDate(transaction.createdAt)} • {formatPointsTime(transaction.createdAt)}
            </Text>
          </View>
          <Text className={`ml-4 font-inter-semibold text-[22px] ${positive ? 'text-ora-gold' : 'text-ora-error'}`}>
            {positive ? '+' : ''}{transaction.amount} P
          </Text>
        </View>
      </GlassSurface>
    </Entrance>
  );
}
