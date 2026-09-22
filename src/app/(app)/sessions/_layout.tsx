import { Stack } from 'expo-router';

export default function SessionsLayout() {
  return <Stack screenOptions={{ animation: 'fade_from_bottom', headerShown: false }} />;
}
