import type { PointsTransaction } from '@/features/points/types';

const reasonLabels: Record<string, string> = {
  first_visit: 'Prima vizită',
  hour_played: '1 oră jucată',
  five_visits: '5 vizite',
  ten_hours: '10 ore jucate',
  pc_and_xbox: 'Joacă pe PC și Xbox',
  reward_redemption: 'Recompensă utilizată',
  system_adjustment: 'Ajustare puncte',
};

export function getPointsReasonLabel(reason: string) {
  return reasonLabels[reason] ?? reason;
}

export function formatPointsMonth(value: string) {
  const label = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' }).format(new Date(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function groupPointsTransactions(transactions: PointsTransaction[]) {
  const groups = new Map<string, PointsTransaction[]>();
  [...transactions]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .forEach((transaction) => {
      const month = formatPointsMonth(transaction.createdAt);
      groups.set(month, [...(groups.get(month) ?? []), transaction]);
    });
  return [...groups.entries()].map(([month, items]) => ({ month, items }));
}

export function formatPointsDate(value: string) {
  const label = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
  return label.replace(/(^|\s)(\p{L})/gu, (match) => match.toUpperCase());
}

export function formatPointsTime(value: string) {
  return new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}
