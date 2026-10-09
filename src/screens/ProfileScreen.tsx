import { router } from 'expo-router';
import { BarChart3, Clock3, Gift, Info, Pencil, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { GoldGradientText } from '@/components/ui/GoldGradientText';
import { PremiumModal } from '@/components/ui/PremiumModal';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { PremiumTabLoader } from '@/components/ui/PremiumTabLoader';
import { clearSession } from '@/features/auth/session/auth-session';
import { TabContentTransition } from '@/features/home/components/TabContentTransition';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { setNotificationReturnRoute } from '@/features/notifications/navigation';
import { ProfileMenuRow } from '@/features/profile/components/ProfileMenuRow';
import { UserAvatar } from '@/features/profile/components/UserAvatar';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { setSessionHistoryReturnRoute } from '@/features/sessions/history-navigation';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/tokens';

function ProfileHeader() {
  const date = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const today = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <View className="flex-row items-center justify-between py-2">
      <View>
        <View accessible accessibilityLabel="Profil" className="flex-row items-center">
          <Text accessible={false} className="font-inter-semibold text-xl text-ora-primary">Pro</Text>
          <GoldGradientText accessible={false} className="font-inter-semibold text-xl">fil</GoldGradientText>
        </View>
        <Text className="mt-0.5 font-inter text-xs text-ora-secondary">{today}</Text>
      </View>
      <NotificationBell
        onPress={() => {
          setNotificationReturnRoute('/profile');
          router.navigate('/notifications');
        }}
      />
    </View>
  );
}

export function ProfileScreen() {
  const profileQuery = useProfile();
  const profile = profileQuery.data;
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (profileQuery.isPending) {
    return (
      <TabContentTransition tabName="profile">
        <PremiumTabLoader label="Se încarcă profilul..." />
      </TabContentTransition>
    );
  }

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
        <AppScreen backgroundClassName="bg-transparent">
          <ScrollView contentContainerClassName="pb-[112px] pt-4" showsVerticalScrollIndicator={false}>
            <AppContent>
              <Entrance><ProfileHeader /></Entrance>

              {profileQuery.isError || !profile ? (
                <GlassSurface className="mt-[28px]" radius={22} borderColor="rgba(224,140,125,0.40)">
                  <View className="items-center p-6">
                    <Text className="text-center font-inter text-ora-secondary">Profilul nu a putut fi încărcat.</Text>
                    <PremiumPressable accessibilityLabel="Reîncearcă încărcarea profilului" className="mt-4" onPress={() => profileQuery.refetch()}>
                      <View className="h-11 items-center justify-center rounded-xl border border-ora-gold px-5"><Text className="font-inter-medium text-ora-gold">Reîncearcă</Text></View>
                    </PremiumPressable>
                  </View>
                </GlassSurface>
              ) : (
                <Entrance delay={60} depth>
                  <PremiumPressable accessibilityLabel="Editează profilul" className="mt-[28px]" onPress={() => router.navigate('/profile/edit')} tilt>
                    <GlassSurface
                      radius={22}
                      intensity={20}
                      fillColor="rgba(255,255,255,0.052)"
                      borderColor="rgba(226,158,62,0.34)"
                      shadowStyle={{ boxShadow: '0 12px 28px rgba(0,0,0,0.22)' }}>
                      <View className="h-[104px] flex-row items-center px-5">
                        <UserAvatar avatarUrl={profile.avatarUrl} name={profile.fullName} size={64} />
                        <View className="ml-4 min-w-0 flex-1">
                          <Text className="font-inter-semibold text-xl text-ora-primary" numberOfLines={1}>{profile.fullName ?? 'Nume necompletat'}</Text>
                          <Text className="mt-0.5 font-inter text-sm text-ora-secondary">{profile.phone}</Text>
                          <Text className="mt-0.5 font-inter text-sm text-ora-secondary">PIN: <Text className="text-ora-gold">●●●●</Text></Text>
                        </View>
                        <GlassSurface
                          radius={14}
                          intensity={18}
                          fillColor="rgba(255,255,255,0.035)"
                          borderColor="rgba(226,158,62,0.34)">
                          <View className="h-11 w-11 items-center justify-center">
                            <Pencil color={colors.brandGradientEnd} size={22} strokeWidth={2} />
                          </View>
                        </GlassSurface>
                      </View>
                    </GlassSurface>
                  </PremiumPressable>
                </Entrance>
              )}

              <Entrance delay={120}>
                <View className="mt-[28px] gap-2.5">
                  <ProfileMenuRow Icon={BarChart3} label="Statistici" onPress={() => router.navigate('/profile/statistics')} />
                  <ProfileMenuRow Icon={Clock3} label="Istoric sesiuni" onPress={() => { setSessionHistoryReturnRoute('profile'); router.navigate('/sessions/history'); }} />
                  <ProfileMenuRow Icon={Gift} label="Recompensele mele" onPress={() => router.navigate('/profile/rewards')} />
                  <ProfileMenuRow Icon={Settings} label="Setări" onPress={() => router.navigate('/profile/settings')} />
                  <ProfileMenuRow Icon={Info} label="Despre ORA Project" onPress={() => router.navigate('/profile/about')} showDivider={false} />
                </View>
              </Entrance>

              <Entrance delay={180}>
                <PremiumPressable accessibilityLabel="Deloghează-te" className="mt-[26px]" onPress={() => setConfirmingLogout(true)}>
                  <GlassSurface
                    radius={16}
                    intensity={18}
                    fillColor="rgba(130,25,25,0.18)"
                    borderColor="rgba(228,87,78,0.62)">
                    <View className="h-[50px] items-center justify-center">
                      <Text className="font-inter-semibold text-base text-[#FF5B55]">Deloghează-te</Text>
                    </View>
                  </GlassSurface>
                </PremiumPressable>
              </Entrance>
            </AppContent>
          </ScrollView>

          <PremiumModal accessibilityLabel="Confirmă delogarea" onClose={() => !loggingOut && setConfirmingLogout(false)} visible={confirmingLogout}>
            <GlassSurface radius={24} intensity={20} borderColor="rgba(226,158,62,0.32)">
              <View accessibilityViewIsModal className="w-full p-6">
                <Text className="text-center font-inter-semibold text-xl text-ora-primary">Sigur vrei să te deloghezi?</Text>
                <View className="mt-6 flex-row gap-3">
                  <PremiumPressable accessibilityLabel="Renunță" className="flex-1" onPress={() => setConfirmingLogout(false)}>
                    <View className="h-12 items-center justify-center rounded-xl border border-ora-divider"><Text className="font-inter-medium text-ora-primary">Renunță</Text></View>
                  </PremiumPressable>
                  <PremiumPressable accessibilityLabel="Deloghează-te" className="flex-1" onPress={logout}>
                    <View className="h-12 items-center justify-center rounded-xl bg-[#E4574E]">{loggingOut ? <ActivityIndicator color={colors.textPrimary} /> : <Text className="font-inter-semibold text-ora-primary">Deloghează-te</Text>}</View>
                  </PremiumPressable>
                </View>
              </View>
            </GlassSurface>
          </PremiumModal>
        </AppScreen>
    </TabContentTransition>
  );
}
