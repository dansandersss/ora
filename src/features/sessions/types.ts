export type GamingSessionStatus = 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export type GamingSession = {
  id: string;
  deviceType: 'pc' | 'xbox';
  deviceName: string;
  status: GamingSessionStatus;
  startsAt: string;
  endsAt: string;
  activatedAt?: string | null;
  pausedAt?: string | null;
};

export type GamingSessionHistoryItem = {
  id: string;
  deviceType: 'pc' | 'xbox';
  deviceName: string;
  status: 'completed' | 'cancelled';
  startsAt: string;
  endsAt: string;
  activatedAt: string | null;
  pausedAt: string | null;
  durationMinutes: number;
  pointsEarned: number | null;
};

export type SessionHistoryFilter = 'all' | 'pc' | 'xbox';

export type SessionExtensionRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type SessionExtensionRequest = {
  id: string;
  gamingSessionId: string;
  requestedMinutes: number;
  quotedPriceMdl: number;
  status: SessionExtensionRequestStatus;
  requestedAt: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
};
