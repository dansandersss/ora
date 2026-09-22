export type NotificationType =
  | 'session_assigned'
  | 'session_activated'
  | 'session_ending_5m'
  | 'session_ending_1m'
  | 'session_completed'
  | 'extension_approved'
  | 'extension_rejected'
  | 'party_created'
  | 'party_joined'
  | 'party_member_joined'
  | 'system';

export type OraNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
  isRead: boolean;
};
