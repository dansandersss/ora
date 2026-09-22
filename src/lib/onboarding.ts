import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from 'expo-router';

const ONBOARDING_KEY = 'ora.onboardingCompleted';
export const POST_ONBOARDING_ROUTE: Href = '/login';
export async function hasCompletedOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
}
export function completeOnboarding() {
  return AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
