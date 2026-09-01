import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { POST_ONBOARDING_ROUTE } from '@/lib/onboarding';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function IndexScreen() {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    if (POST_ONBOARDING_ROUTE) router.replace(POST_ONBOARDING_ROUTE);
  }, [router]);

  return <OnboardingScreen onComplete={handleComplete} />;
}
