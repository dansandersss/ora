const PARTY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function compactPartyCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
}

/** Formats at most eight allowed code characters as XXXX-XXXX for interactive input. */
export function normalizePartyCode(value: string) {
  const raw = [...compactPartyCode(value)]
    .filter((character) => PARTY_ALPHABET.includes(character))
    .slice(0, 8)
    .join('');
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
}

export function isValidPartyCode(value: string) {
  const candidate = value.trim().toUpperCase().replace(/\s+/g, '');
  const allowed = `[${PARTY_ALPHABET}]`;
  return new RegExp(`^(?:${allowed}{8}|${allowed}{4}-${allowed}{4})$`).test(candidate);
}

export function partyDeepLink(joinCode: string) {
  return `ora://party/join?code=${encodeURIComponent(normalizePartyCode(joinCode))}`;
}

/** Extracts the canonical join code from the exact ORA deep link, JSON, or plain-code payload. */
export function parsePartyJoinPayload(value: string) {
  const payload = value.trim();
  let candidate: unknown = payload;

  try {
    const parsed = JSON.parse(payload) as { code?: unknown; joinCode?: unknown };
    candidate = parsed.joinCode ?? parsed.code ?? payload;
  } catch {
    const encodedCode = payload.match(/[?&]code=([^&#]+)/i)?.[1];
    if (encodedCode) {
      try {
        candidate = decodeURIComponent(encodedCode);
      } catch {
        return null;
      }
    }
  }

  if (typeof candidate !== 'string' || !isValidPartyCode(candidate)) return null;
  return normalizePartyCode(candidate);
}
