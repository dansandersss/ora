import { LinearGradient } from 'expo-linear-gradient';
import { Gamepad2, Monitor } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Entrance } from '@/components/ui/Entrance';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { useGamingSessionHistory } from '@/features/sessions/hooks/use-gaming-session-history';
import type { GamingSessionHistoryItem, SessionHistoryFilter } from '@/features/sessions/types';
import { colors } from '@/theme/tokens';

type SessionHistoryProps = {
  grouped?: boolean;
  showTitle?: boolean;
};

function formatDate(value: string) {
  const label = new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
  return label.replace(/(^|\s)(\p{L})/gu, (match) => match.toUpperCase());
}

function formatMonth(value: string) {
  const label = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' }).format(new Date(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatSessionDuration(item: GamingSessionHistoryItem) {
  const durationFromDates = (Date.parse(item.endsAt) - Date.parse(item.startsAt)) / 1000;
  const seconds = Math.max(0, Math.round(Number.isFinite(item.durationMinutes) ? item.durationMinutes * 60 : durationFromDates));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0')).join(':');
}

function HistoryDeviceIcon({ type }: { type: GamingSessionHistoryItem['deviceType'] }) {
  const Icon = type === 'pc' ? Monitor : Gamepad2;
  return (
    <View className="h-11 w-11 items-center justify-center rounded-[13px] bg-white/[0.07]">
      <Icon color={colors.textPrimary} size={23} strokeWidth={1.8} />
    </View>
  );
}

function HistoryRow({ index, session }: { index: number; session: GamingSessionHistoryItem }) {
  return (
    <Entrance delay={Math.min(index * 55, 275)}>
      <GlassSurface
        radius={18}
        intensity={18}
        fillColor="rgba(255,255,255,0.045)"
        borderColor="rgba(226,158,62,0.30)">
        <View className="min-h-[72px] flex-row items-center px-4 py-3">
          <HistoryDeviceIcon type={session.deviceType} />
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-inter-semibold text-base text-ora-primary" numberOfLines={1}>{session.deviceName}</Text>
            <Text className="mt-1 font-inter text-xs text-ora-secondary" numberOfLines={1}>
              {formatDate(session.startsAt)} • {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
            </Text>
          </View>
          <View className="ml-3 items-end">
            <Text className="font-inter-semibold text-lg text-ora-gold">
              {session.pointsEarned == null ? '—' : `+${session.pointsEarned} P`}
            </Text>
            <Text className="mt-1 font-inter text-xs text-ora-secondary">{formatSessionDuration(session)}</Text>
          </View>
        </View>
      </GlassSurface>
    </Entrance>
  );
}

export function SessionHistory({ grouped = false, showTitle = true }: SessionHistoryProps) {
  const [filter, setFilter] = useState<SessionHistoryFilter>('all');
  const historyQuery = useGamingSessionHistory(filter);
  const filteredSessions = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const groups = useMemo(() => {
    if (!grouped) return [{ label: '', sessions: filteredSessions }];
    const byMonth = new Map<string, GamingSessionHistoryItem[]>();
    filteredSessions.forEach((session) => {
      const label = formatMonth(session.startsAt);
      byMonth.set(label, [...(byMonth.get(label) ?? []), session]);
    });
    return [...byMonth].map(([label, values]) => ({ label, sessions: values }));
  }, [filteredSessions, grouped]);
  const filters: { label: string; value: SessionHistoryFilter }[] = [
    { label: 'Toate', value: 'all' },
    { label: 'PC', value: 'pc' },
    { label: 'Xbox', value: 'xbox' },
  ];

  return (
    <View className={showTitle ? 'mt-8' : ''}>
      {showTitle ? <Text className="font-inter-medium text-[26px] leading-8 text-ora-primary">Istoric sesiuni</Text> : null}
      <View className="mt-4 flex-row gap-2">
        {filters.map((item) => {
          const selected = filter === item.value;
          return (
            <PremiumPressable
              accessibilityLabel={`Filtru ${item.label}`}
              className="self-start"
              key={item.value}
              onPress={() => setFilter(item.value)}>
              <GlassSurface
                radius={999}
                intensity={16}
                fillColor={selected ? 'rgba(217,150,57,0.96)' : 'rgba(255,255,255,0.04)'}
                borderColor={selected ? 'rgba(240,181,82,0.95)' : 'rgba(226,158,62,0.28)'}>
                <View className="h-10 items-center justify-center overflow-hidden rounded-full px-[18px]">
                  {selected ? (
                    <LinearGradient
                      colors={['#F0B552', '#D99639']}
                      end={{ x: 1, y: 1 }}
                      start={{ x: 0, y: 0 }}
                      style={{ position: 'absolute', inset: 0 }}
                    />
                  ) : null}
                  <Text className={`font-inter-medium text-sm ${selected ? 'text-ora-dark' : 'text-ora-primary'}`}>
                    {item.label}
                  </Text>
                </View>
              </GlassSurface>
            </PremiumPressable>
          );
        })}
      </View>

      {historyQuery.isLoading ? <Text className="py-6 text-center font-inter text-sm text-ora-secondary">Se încarcă istoricul...</Text> : null}
      {historyQuery.isError ? <Text className="py-6 text-center font-inter text-sm text-ora-error">Istoricul nu a putut fi încărcat.</Text> : null}
      {historyQuery.isSuccess ? (
        <View className="mt-4 gap-3">
          {filteredSessions.length ? groups.map((group) => (
            <View className="gap-3" key={group.label || 'all'}>
              {group.label ? <Text className="font-inter-medium text-base text-ora-secondary">{group.label}</Text> : null}
              {group.sessions.map((session, index) => <HistoryRow index={index} key={session.id} session={session} />)}
            </View>
          )) : <Text className="py-4 text-center font-inter text-sm text-ora-secondary">Nu există sesiuni în istoric.</Text>}
        </View>
      ) : null}
    </View>
  );
}
