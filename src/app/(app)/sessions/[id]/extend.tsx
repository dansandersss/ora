import { useLocalSearchParams } from 'expo-router';

import { SessionExtensionScreen } from '@/screens/SessionExtensionScreen';

export default function SessionExtensionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionExtensionScreen sessionId={id} />;
}
