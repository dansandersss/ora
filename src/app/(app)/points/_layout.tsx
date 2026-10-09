import { Stack } from 'expo-router';

export default function PointsLayout() {
  return <Stack screenOptions={{ animation: 'fade_from_bottom', contentStyle: { backgroundColor: '#080808' }, headerShown: false }} />;
}
