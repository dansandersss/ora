export type OraProfile = {
  id: string;
  phone: string;
  fullName: string | null;
  avatarUrl: string | null;
  avatarUpdatedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  pinConfigured: boolean;
};

export type ProfileStatistics = {
  totalPlayedMinutes: number;
  completedSessions: number;
  visitDays: number;
  pcSessions: number;
  xboxSessions: number;
  pointsEarned: number;
  longestSessionMinutes: number;
  firstVisitAt: string | null;
};

export type ProfileUpdateInput = { fullName?: string; phone?: string };
export type ChangePinInput = { currentPin: string; newPin: string };
export type AvatarUpload = { file?: File; mimeType: string; name: string; uri: string };
