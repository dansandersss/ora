import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

type CountdownSource = { startsAt: string; endsAt: string } | null | undefined;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function formatClock(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatDuration(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60_000));
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

/**
 * Derives a drift-free countdown from immutable server timestamps.
 * It recalculates from Date.now() every tick and immediately after foregrounding.
 */
export function useSessionCountdown(source: CountdownSource, onExpired?: () => void) {
  const [now, setNow] = useState(0);
  const expirationHandled = useRef(false);
  const startsAt = source?.startsAt;
  const endsAt = source?.endsAt;
  const startsAtMs = startsAt ? Date.parse(startsAt) : 0;
  const endsAtMs = endsAt ? Date.parse(endsAt) : 0;
  const totalMs = Math.max(0, endsAtMs - startsAtMs);
  // Before the first scheduled clock read, render the server's full duration rather than a bogus epoch-derived value.
  const remainingMs = source ? Math.max(0, now ? endsAtMs - now : totalMs) : 0;
  const isExpired = Boolean(source) && remainingMs === 0;

  useEffect(() => {
    expirationHandled.current = false;
    if (!source) return;
    const initialTick = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearTimeout(initialTick);
      clearInterval(interval);
      subscription.remove();
    };
  }, [endsAt, source, startsAt]);

  useEffect(() => {
    if (!isExpired || expirationHandled.current) return;
    expirationHandled.current = true;
    onExpired?.();
  }, [isExpired, onExpired]);

  return useMemo(() => ({
    isExpired,
    progress: totalMs > 0 ? clamp(remainingMs / totalMs, 0, 1) : 0,
    remainingFormatted: formatClock(remainingMs),
    remainingMs,
    totalFormatted: formatDuration(totalMs),
    totalMs,
  }), [isExpired, remainingMs, totalMs]);
}
