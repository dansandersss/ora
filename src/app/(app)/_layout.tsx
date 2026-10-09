import { Redirect, Tabs, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    View,
} from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import {
    authQueryKeys,
    restoreSession,
} from '@/features/auth/session/auth-session';
import type { AuthUser } from '@/features/auth/types';
import { AnimatedTabBar } from '@/features/home/components/AnimatedTabBar';
import { ActiveTabProvider } from '@/features/home/components/TabContentTransition';
import { NotificationController } from '@/features/notifications/components/NotificationController';
import { pointsQueryKeys } from '@/features/points/hooks/use-points';
import { profileQueryKeys } from '@/features/profile/hooks/use-profile';
import { gamingSessionQueryKeys } from '@/features/sessions/hooks/use-current-gaming-session';
import { getCurrentGamingSession, getPointsBalance, getProfile } from '@/lib/backend';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/tokens';

export default function AuthenticatedTabsLayout() {
    const [user, setUser] = useState<AuthUser | null>(() =>
        queryClient.getQueryData<AuthUser>(
            authQueryKeys.currentUser,
        ) ?? null,
    );

    const [checkingSession, setCheckingSession] =
        useState(!user);

    const pathname = usePathname();
    const activeTab = pathname.split('/')[1] || 'home';

    useEffect(() => {
        if (user) return;

        let active = true;

        restoreSession()
            .then((restoredUser) => {
                if (!active) return;

                setUser(restoredUser);
                setCheckingSession(false);
            })
            .catch(() => {
                if (active) {
                    setCheckingSession(false);
                }
            });

        return () => {
            active = false;
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            queryClient.prefetchQuery({ queryFn: getCurrentGamingSession, queryKey: gamingSessionQueryKeys.current }),
            queryClient.prefetchQuery({ queryFn: getPointsBalance, queryKey: pointsQueryKeys.balance }),
            queryClient.prefetchQuery({ queryFn: getProfile, queryKey: profileQueryKeys.detail }),
        ]).catch(() => undefined);
    }, [user]);

    if (checkingSession) {
        return (
            <View className="flex-1 items-center justify-center bg-[#000]">
                <ActivityIndicator color={colors.gold} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return (
        <View className="relative flex-1 bg-[#000]">
            <StatusBar style="light" />
            <GlassBlurProvider>
              <PremiumAnimatedBackground />
              <NotificationController>
                <ActiveTabProvider value={activeTab}>
                    <Tabs
                        backBehavior="none"
                        initialRouteName="home"
                        tabBar={(props) => <AnimatedTabBar {...props} />}
                        screenOptions={{
                            freezeOnBlur: true,
                            headerShown: false,
                            lazy: false,

                            // CRITICAL:
                            // the global background belongs to this layout.
                            sceneStyle: {
                                backgroundColor: '#080808',
                            },

                            tabBarHideOnKeyboard: true,
                        }}
                    >
                        <Tabs.Screen
                            name="home"
                            options={{
                                tabBarAccessibilityLabel: 'Acasa',
                                title: 'Acasa',
                            }}
                        />

                        <Tabs.Screen
                            name="sessions"
                            options={{
                                tabBarAccessibilityLabel: 'Sesiuni',
                                title: 'Sesiuni',
                            }}
                        />

                        <Tabs.Screen
                            name="points"
                            options={{
                                tabBarAccessibilityLabel: 'Puncte',
                                title: 'Puncte',
                            }}
                        />

                        <Tabs.Screen
                            name="profile"
                            options={{
                                tabBarAccessibilityLabel: 'Profil',
                                title: 'Profil',
                            }}
                        />

                        <Tabs.Screen
                            name="notifications"
                            options={{
                                href: null,
                            }}
                        />
                    </Tabs>
                </ActiveTabProvider>
              </NotificationController>
            </GlassBlurProvider>
        </View>
    );
}
