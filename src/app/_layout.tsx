import '@/global.css';

import {
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

import { AppProviders } from '@/components/providers/app-providers';
import { restoreSession } from '@/features/auth/session/auth-session';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { StartupProvider, StartupRoutingProvider, type StartupRoutingState } from '@/lib/startup-context';
import { OraSplashScreen } from '@/screens/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [startupRouting, setStartupRouting] = useState<StartupRoutingState>({ status: 'loading' });
  const [startupAttempt, setStartupAttempt] = useState(0);
    const [fontsLoaded, fontError] = useFonts({
        Inter_300Light,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });
  const appIsReady = fontsLoaded || Boolean(fontError);
  const handleSplashComplete = useCallback(() => setSplashComplete(true), []);
  const retryStartup = useCallback(() => {
    setStartupRouting({ status: 'loading' });
    setStartupAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([restoreSession(), hasCompletedOnboarding()])
      .then(([user, completed]) => {
        if (active) setStartupRouting({ status: 'ready', route: user ? 'authenticated' : completed ? 'login' : 'onboarding' });
      })
      .catch(() => {
        if (active) setStartupRouting({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [startupAttempt]);

  const handleSplashLayout = useCallback(() => {
    if (appIsReady) SplashScreen.hide();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <AppProviders>
      <StartupRoutingProvider value={{ state: startupRouting, retry: retryStartup }}>
      <StartupProvider value={splashComplete}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080808' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="party/join" />
          <Stack.Screen name="(app)" />
        </Stack>
        {!splashComplete && (
          <OraSplashScreen
            autoDismiss={startupRouting.status === 'ready' && startupRouting.route === 'authenticated'}
            allowDismiss={startupRouting.status !== 'loading'}
            onComplete={handleSplashComplete}
            onReady={handleSplashLayout}
          />
        )}
      </StartupProvider>
      </StartupRoutingProvider>
    </AppProviders>
  );
}
