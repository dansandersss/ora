import type { GamingSession } from '@/features/sessions/types';

export type PartyStatus = 'forming' | 'active' | 'closed' | 'cancelled';
export type PartyMemberSessionStatus = 'scheduled' | 'active' | 'finished';
export type PartyMembershipStatus = 'invited' | 'joined' | 'left' | 'removed';

export type PartyMember = {
  id: string;
  userId: string;
  gamingSessionId: string;
  name?: string | null;
  role: 'host' | 'member';
  membershipStatus: PartyMembershipStatus;
  sessionStatus: PartyMemberSessionStatus;
  gamingSession?: GamingSession | null;
};

export type SessionParty = {
  id: string;
  gamingSessionId: string;
  hostUserId: string;
  hostName?: string | null;
  joinCode: string;
  status: PartyStatus;
  maxMembers: number;
  members: PartyMember[];
};

export type PartyPreview = {
  party: SessionParty;
  currentUserSession: GamingSession | null;
};
