import { ActivityIndicator, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { useProfileStatistics } from '@/features/profile/hooks/use-profile';
import { colors } from '@/theme/tokens';

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest ? `${rest}m` : ''}`.trim() : `${rest}m`;
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';
}

export function ProfileStatisticsScreen() {
  const statisticsQuery = useProfileStatistics();
  if (statisticsQuery.isLoading) return <ProfileScreenShell title="Statistici"><ActivityIndicator className="mt-16" color={colors.gold} /></ProfileScreenShell>;
  if (statisticsQuery.isError || !statisticsQuery.data) return <ProfileScreenShell title="Statistici"><Text className="mt-12 text-center font-inter text-ora-secondary">Statisticile nu au putut fi încărcate.</Text></ProfileScreenShell>;
  const data = statisticsQuery.data;
  const metrics = [
    ['Total timp jucat', duration(data.totalPlayedMinutes)],
    ['Total sesiuni', String(data.completedSessions)],
    ['Vizite', String(data.visitDays)],
    ['Sesiuni PC', String(data.pcSessions)],
    ['Sesiuni Xbox', String(data.xboxSessions)],
    ['Puncte câștigate', `${data.pointsEarned} P`],
    ['Cea mai lungă sesiune', duration(data.longestSessionMinutes)],
    ['Prima vizită', formatDate(data.firstVisitAt)],
  ];
  return (
    <ProfileScreenShell title="Statistici">
      <View className="mt-[30px] flex-row flex-wrap justify-between gap-y-3">
        {metrics.map(([label, value]) => (
          <View className="w-[48.5%]" key={label}>
            <GlassSurface
              radius={18}
              intensity={18}
              fillColor="rgba(255,255,255,0.045)"
              borderColor="rgba(226,158,62,0.30)"
              shadowStyle={{ boxShadow: '0 8px 20px rgba(0,0,0,0.16)' }}>
              <View className="min-h-[112px] justify-between p-4">
                <Text className="font-inter text-sm leading-5 text-ora-secondary">{label}</Text>
                <Text adjustsFontSizeToFit className="mt-3 font-inter-semibold text-xl text-ora-gold" numberOfLines={1}>{value}</Text>
              </View>
            </GlassSurface>
          </View>
        ))}
      </View>
    </ProfileScreenShell>
  );
}
