import '@/global.css';

import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';

import { AppProviders } from '@/components/providers/app-providers';
import { StartupProvider } from '@/lib/startup-context';
import { OraSplashScreen } from '@/screens/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const appIsReady = fontsLoaded || Boolean(fontError);
  const handleSplashComplete = useCallback(() => setSplashComplete(true), []);

  const handleSplashLayout = useCallback(() => {
    if (appIsReady) SplashScreen.hide();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <AppProviders>
      <StartupProvider value={splashComplete}>
        <Slot />
        {!splashComplete && (
          <OraSplashScreen onComplete={handleSplashComplete} onReady={handleSplashLayout} />
        )}
      </StartupProvider>
    </AppProviders>
  );
}
