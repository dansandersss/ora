import { ActivityIndicator, Text, View } from 'react-native';

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
  return <ProfileScreenShell title="Statistici"><View className="mt-8 flex-row flex-wrap justify-between gap-y-3">{metrics.map(([label, value]) => <View className="w-[48.5%] rounded-[20px] border border-white/10 bg-ora-surface p-5" key={label}><Text className="font-inter text-sm text-ora-secondary">{label}</Text><Text className="mt-3 font-inter-semibold text-xl text-ora-gold">{value}</Text></View>)}</View></ProfileScreenShell>;
}
