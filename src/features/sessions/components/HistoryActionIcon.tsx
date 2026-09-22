import HistoryIcon from '@/../assets/images/Active Session/history-icon.svg';

/** Shared history glyph used by ORA feature headers. */
export function HistoryActionIcon({ size = 30 }: { size?: number }) {
  return <HistoryIcon height={size} width={size} />;
}
