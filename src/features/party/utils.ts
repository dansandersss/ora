export function normalizePartyCode(value: string) {
  const raw = value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 8);
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
}

export function partyDeepLink(joinCode: string) {
  return `ora://party/join?code=${encodeURIComponent(joinCode)}`;
}
