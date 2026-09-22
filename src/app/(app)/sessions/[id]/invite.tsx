import { useLocalSearchParams } from 'expo-router';

import { PartyInviteScreen } from '@/screens/PartyInviteScreen';

export default function PartyInviteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PartyInviteScreen sessionId={id} />;
}
