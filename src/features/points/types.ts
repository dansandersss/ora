export type PointsBalance = { balance: number };

export type PointsTransaction = {
  id: string;
  amount: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
};
