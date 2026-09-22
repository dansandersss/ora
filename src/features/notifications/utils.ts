import { router } from 'expo-router';

import type { OraNotification } from '@/features/notifications/types';

export type DisplayNotification = OraNotification & { sourceIds: string[] };

function dataString(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === 'string' && value ? value : null;
}

function notificationEventKey(notification: OraNotification) {
  const extensionRequestId = dataString(notification.data, 'extensionRequestId');
  if (extensionRequestId) return `${notification.type}:extension:${extensionRequestId}`;
  const partyId = dataString(notification.data, 'partyId');
  const memberId = dataString(notification.data, 'memberUserId') ?? dataString(notification.data, 'userId');
  if (partyId) return `${notification.type}:party:${partyId}:${memberId ?? ''}`;
  const gamingSessionId = dataString(notification.data, 'gamingSessionId');
  if (gamingSessionId) return `${notification.type}:session:${gamingSessionId}`;
  return `notification:${notification.id}`;
}

/** Normalizes read state and collapses duplicate deliveries of the same backend event. */
export function normalizeNotifications(notifications: OraNotification[]) {
  const unique = new Map<string, DisplayNotification>();
  [...notifications]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .forEach((notification) => {
      const normalized: DisplayNotification = { ...notification, isRead: notification.isRead === true || Boolean(notification.readAt), sourceIds: [notification.id] };
      const key = notificationEventKey(normalized);
      const existing = unique.get(key);
      if (!existing) {
        unique.set(key, normalized);
        return;
      }
      // If any duplicate delivery is unread, keep the one visible event unread.
      unique.set(key, {
        ...existing,
        isRead: existing.isRead && normalized.isRead,
        readAt: existing.readAt && normalized.readAt ? existing.readAt : null,
        sourceIds: [...existing.sourceIds, notification.id],
      });
    });
  return [...unique.values()];
}

/** Routes a notification to its safest useful destination, falling back to the parent feature screen. */
export function openNotificationDestination(notification: OraNotification) {
  const sessionId = dataString(notification.data, 'gamingSessionId');

  switch (notification.type) {
    case 'session_activated':
    case 'session_ending_5m':
    case 'session_ending_1m':
    case 'party_created':
    case 'party_joined':
    case 'party_member_joined':
      router.replace(sessionId ? `/sessions/${sessionId}` : '/sessions');
      break;
    case 'extension_approved':
    case 'extension_rejected':
      router.replace(sessionId ? `/sessions/${sessionId}` : '/sessions');
      break;
    case 'session_completed':
      router.replace('/sessions/history');
      break;
    case 'session_assigned':
      router.replace('/sessions');
      break;
    default:
      router.replace('/home');
  }
}

/** Produces compact Romanian-friendly notification timestamps without external date dependencies. */
export function formatNotificationTime(value: string, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '';
  const elapsedMinutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (elapsedMinutes < 1) return 'acum';
  if (elapsedMinutes < 60) return `acum ${elapsedMinutes} min`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `acum ${elapsedHours} ${elapsedHours === 1 ? 'oră' : 'ore'}`;
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}
