import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { POST_LOGIN_ROUTE } from '@/features/auth/session/auth-session';
import { completeOnboarding, POST_ONBOARDING_ROUTE } from '@/lib/onboarding';
import { useHasSplashCompleted, useStartupRouting } from '@/lib/startup-context';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function IndexScreen() {
  const { onboarding, partyCode } = useLocalSearchParams<{ onboarding?: string; partyCode?: string }>();
  const splashComplete = useHasSplashCompleted();
  const { state, retry } = useStartupRouting();
  const [error, setError] = useState('');
  useEffect(() => {
    if (!splashComplete || state.status !== 'ready' || onboarding === '1') return;
    if (state.route === 'authenticated') {
      router.replace(partyCode ? { pathname: '/party/join', params: { code: partyCode } } : POST_LOGIN_ROUTE);
    } else if (state.route === 'login') {
      router.replace(partyCode ? { pathname: '/login', params: { partyCode } } : POST_ONBOARDING_ROUTE);
    }
  }, [splashComplete, state, onboarding, partyCode]);
  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding();
      router.replace(partyCode ? { pathname: '/login', params: { partyCode } } : POST_ONBOARDING_ROUTE);
    } catch { setError('Progresul nu a putut fi salvat. Încearcă din nou.'); }
  }, [partyCode]);
  if (!splashComplete || state.status !== 'ready' || (onboarding !== '1' && state.route !== 'onboarding')) return <View className="flex-1 items-center justify-center bg-[#080808] px-[24px]">
    {state.status === 'error' && splashComplete ? <><Text accessibilityRole="alert" className="text-center font-inter text-ora-secondary">Nu am putut verifica sesiunea. Verifică conexiunea și încearcă din nou.</Text><Pressable accessibilityRole="button" className="min-h-[44px] justify-center" onPress={retry}><Text className="font-inter text-ora-gold">Reîncearcă</Text></Pressable></> : <ActivityIndicator color="#C9A24B" />}
  </View>;
  return <View className="flex-1"><OnboardingScreen onComplete={handleComplete} />{error ? <Text accessibilityRole="alert" className="bg-ora-dark px-[24px] py-[12px] font-inter text-ora-error">{error}</Text> : null}</View>;
}
