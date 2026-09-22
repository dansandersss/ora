import { Bell, Check, Clock3, Gamepad2, Play, TriangleAlert, UserPlus, Users } from 'lucide-react-native';
import type { ComponentType } from 'react';

import type { NotificationType } from '@/features/notifications/types';
import { colors } from '@/theme/tokens';

const icons: Record<NotificationType, ComponentType<{ color?: string; size?: number }>> = {
  session_assigned: Gamepad2,
  session_activated: Play,
  session_ending_5m: Clock3,
  session_ending_1m: TriangleAlert,
  session_completed: Bell,
  extension_approved: Check,
  extension_rejected: TriangleAlert,
  party_created: Users,
  party_joined: Users,
  party_member_joined: UserPlus,
  system: Bell,
};

export function NotificationSemanticIcon({ size = 21, type }: { size?: number; type: NotificationType }) {
  const Icon = icons[type] ?? Bell;
  return <Icon color={type === 'extension_rejected' ? colors.error : colors.gold} size={size} />;
}
