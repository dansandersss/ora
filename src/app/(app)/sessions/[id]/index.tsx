import { useLocalSearchParams } from 'expo-router';

import { ActiveSessionScreen } from '@/screens/ActiveSessionScreen';

export default function ActiveSessionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActiveSessionScreen sessionId={id} />;
}
