import { router } from 'expo-router';
import { BarChart3, Clock3, Gift, Info, LogOut, Pencil, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { PremiumModal } from '@/components/ui/PremiumModal';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { clearSession } from '@/features/auth/session/auth-session';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { TabContentTransition } from '@/features/home/components/TabContentTransition';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { setNotificationReturnRoute } from '@/features/notifications/navigation';
import { ProfileMenuRow } from '@/features/profile/components/ProfileMenuRow';
import { UserAvatar } from '@/features/profile/components/UserAvatar';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/tokens';

export function ProfileScreen() {
  const profileQuery = useProfile();
  const profile = profileQuery.data;
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    // clearSession always removes the local credential, even when server revocation is unreachable.
    await clearSession().catch(() => undefined);
    queryClient.clear();
    router.replace('/login');
  };

  return (
    <TabContentTransition tabName="profile">
      <AppScreen>
        <AmbientGoldGlow />
        <ScrollView contentContainerClassName="pb-10 pt-3" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi acasă"
                onBack={() => router.replace('/home')}
                rightContent={(
                  <NotificationBell
                    onPress={() => {
                      setNotificationReturnRoute('/profile');
                      router.navigate('/notifications');
                    }}
                  />
                )}
                title="Profil"
                titleSize="compact"
              />
            </Entrance>
            {profileQuery.isLoading ? (
              <View className="mt-8 h-[180px] items-center justify-center rounded-[28px] bg-ora-surface"><ActivityIndicator color={colors.gold} /></View>
            ) : profileQuery.isError || !profile ? (
              <View className="mt-8 rounded-[28px] border border-ora-error/40 bg-ora-surface p-6"><Text className="text-center font-inter text-ora-secondary">Profilul nu a putut fi încărcat.</Text><PremiumPressable accessibilityLabel="Reîncearcă încărcarea profilului" className="mt-4" onPress={() => profileQuery.refetch()}><View className="h-11 items-center justify-center rounded-xl border border-ora-gold"><Text className="font-inter-medium text-ora-gold">Reîncearcă</Text></View></PremiumPressable></View>
            ) : (
              <Entrance delay={60} depth>
                <PremiumPressable accessibilityLabel="Editează profilul" className="mt-7" onPress={() => router.navigate('/profile/edit')} tilt>
                  <View className="min-h-[180px] flex-row items-center rounded-[28px] bg-ora-surface px-6 py-7" style={{ boxShadow: '0 12px 24px rgba(0,0,0,0.25)' }}>
                    <UserAvatar avatarUrl={profile.avatarUrl} />
                    <View className="ml-5 min-w-0 flex-1">
                      <Text className="font-inter-semibold text-xl text-ora-primary" numberOfLines={2}>{profile.fullName ?? 'Nume necompletat'}</Text>
                      <Text className="mt-1 font-inter text-base text-ora-secondary">{profile.phone}</Text>
                      <Text className="mt-1 font-inter text-base text-ora-secondary">PIN: ●●●●</Text>
                    </View>
                    <Pencil color={colors.textPrimary} fill={colors.textPrimary} size={28} />
                  </View>
                </PremiumPressable>
              </Entrance>
            )}
            <Entrance delay={120}>
              <View className="mt-6 overflow-hidden rounded-[20px] bg-ora-surface">
                <ProfileMenuRow Icon={BarChart3} label="Statistici" onPress={() => router.navigate('/profile/statistics')} />
                <ProfileMenuRow Icon={Clock3} label="Istoric sesiuni" onPress={() => router.navigate('/sessions/history')} />
                <ProfileMenuRow Icon={Gift} label="Recompensele mele" onPress={() => router.navigate('/profile/rewards')} />
                <ProfileMenuRow Icon={Settings} label="Setări" onPress={() => router.navigate('/profile/settings')} />
                <ProfileMenuRow Icon={Info} label="Despre ORA Project" onPress={() => router.navigate('/profile/about')} showDivider={false} />
              </View>
            </Entrance>
            <Entrance delay={180}>
              <PremiumPressable accessibilityLabel="Deloghează-te" className="mb-3 mt-24" onPress={() => setConfirmingLogout(true)}>
                <View className="h-14 flex-row items-center justify-center rounded-[16px] border border-[#E4574E] bg-ora-dark/60">
                  <LogOut color="#E4574E" size={20} /><Text className="ml-2 font-inter-medium text-base text-[#E4574E]">Deloghează-te</Text>
                </View>
              </PremiumPressable>
            </Entrance>
          </AppContent>
        </ScrollView>
        <PremiumModal accessibilityLabel="Confirmă delogarea" onClose={() => !loggingOut && setConfirmingLogout(false)} visible={confirmingLogout}>
            <View accessibilityViewIsModal className="w-full max-w-sm rounded-[24px] border border-white/10 bg-ora-surface p-6">
              <Text className="text-center font-inter-semibold text-xl text-ora-primary">Sigur vrei să te deloghezi?</Text>
              <View className="mt-6 flex-row gap-3">
                <PremiumPressable accessibilityLabel="Renunță" className="flex-1" onPress={() => setConfirmingLogout(false)}><View className="h-12 items-center justify-center rounded-xl border border-ora-divider"><Text className="font-inter-medium text-ora-primary">Renunță</Text></View></PremiumPressable>
                <PremiumPressable accessibilityLabel="Deloghează-te" className="flex-1" onPress={logout}><View className="h-12 items-center justify-center rounded-xl bg-[#E4574E]">{loggingOut ? <ActivityIndicator color={colors.textPrimary} /> : <Text className="font-inter-semibold text-ora-primary">Deloghează-te</Text>}</View></PremiumPressable>
              </View>
            </View>
        </PremiumModal>
      </AppScreen>
    </TabContentTransition>
  );
}
