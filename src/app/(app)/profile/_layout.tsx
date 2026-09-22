import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return <Stack screenOptions={{ animation: 'fade_from_bottom', headerShown: false }} />;
}
