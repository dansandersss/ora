import { Redirect, Tabs, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
} from 'react-native';

import {
    authQueryKeys,
    restoreSession,
} from '@/features/auth/session/auth-session';
import type { AuthUser } from '@/features/auth/types';
import { AnimatedTabBar } from '@/features/home/components/AnimatedTabBar';
import { ActiveTabProvider } from '@/features/home/components/TabContentTransition';
import { NotificationController } from '@/features/notifications/components/NotificationController';
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
            {/* =====================================================
          GLOBAL APP BACKGROUND
      ===================================================== */}

            <View
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
            >
                {/* Main global background */}
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: '#1E1E21',
                        },
                    ]}
                />

                {/* Global repeating noise */}
                <Image
                    source={require('../../../assets/images/noise.png')}
                    resizeMode="repeat"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            opacity: 0.12,
                        },
                    ]}
                />
            </View>

            {/* =====================================================
          APP CONTENT
      ===================================================== */}

            <NotificationController>
                <ActiveTabProvider value={activeTab}>
                    <Tabs
                        backBehavior="none"
                        initialRouteName="home"
                        tabBar={(props) => <AnimatedTabBar {...props} />}
                        screenOptions={{
                            headerShown: false,

                            // CRITICAL:
                            // the global background belongs to this layout.
                            sceneStyle: {
                                backgroundColor: 'transparent',
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
        </View>
    );
}
