import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

function getBearer(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const token = getBearer(req);
  if (!token) return null;
  const { data, error } = await supabase.rpc("get_user_by_session", { p_session_token: token });
  if (error) {
    console.error("get_user_by_session failed", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : null;
  return row?.user_id ?? null;
}

function mapSession(data: any) {
  return {
    id: data.id,
    deviceType: data.device_type,
    deviceName: data.device_name,
    status: data.status,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    activatedAt: data.activated_at,
    pausedAt: data.paused_at,
  };
}

function mapExtensionRequest(data: any) {
  return {
    id: data.id,
    gamingSessionId: data.gaming_session_id,
    requestedMinutes: data.requested_minutes,
    quotedPriceMdl: data.quoted_price_mdl,
    status: data.status,
    requestedAt: data.requested_at,
    processedAt: data.processed_at,
    rejectionReason: data.rejection_reason,
  };
}

async function finalizeExpiredActiveSessions(userId: string) {
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("gaming_sessions")
    .update({ status: "completed", updated_at: nowIso })
    .eq("user_id", userId)
    .eq("status", "active")
    .lte("ends_at", nowIso);
  if (error) {
    console.error("finalize expired sessions failed", error);
    throw new Error("SESSION_UNAVAILABLE");
  }
}

const PARTY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PARTY_CODE_PATTERN = /^[A-Z0-9]{8}$/;
const PARTY_COLUMNS = "id, gaming_session_id, host_user_id, join_code, status, max_members, created_at, started_at, closed_at";

function normalizePartyJoinCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^(?:[A-Z0-9]{8}|[A-Z0-9]{4}-[A-Z0-9]{4})$/.test(candidate)) return null;
  const compact = candidate.replace("-", "");
  if (!PARTY_CODE_PATTERN.test(compact)) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function randomPartyCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => PARTY_ALPHABET[b % PARTY_ALPHABET.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}
async function createUniquePartyCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomPartyCode();
    const { data, error } = await supabase.from("session_parties").select("id").eq("join_code", code).maybeSingle();
    if (error) throw error;
    if (!data) return code;
  }
  throw new Error("PARTY_CODE_GENERATION_FAILED");
}

async function getPartyDetails(party: any) {
  const { data: members, error: membersError } = await supabase
    .from("party_members")
    .select("id, user_id, gaming_session_id, role, status, joined_at, left_at, created_at")
    .eq("party_id", party.id)
    .in("status", ["invited", "joined"])
    .order("created_at", { ascending: true });
  if (membersError) throw membersError;

  const userIds = [...new Set((members ?? []).map((m: any) => m.user_id).filter(Boolean))];
  const sessionIds = [...new Set((members ?? []).map((m: any) => m.gaming_session_id).filter(Boolean))];
  const usersById = new Map<string, any>();
  if (userIds.length) {
    const { data: users, error } = await supabase.from("users").select("id, full_name").in("id", userIds);
    if (error) throw error;
    for (const user of users ?? []) usersById.set(user.id, user);
  }
  const sessionsById = new Map<string, any>();
  if (sessionIds.length) {
    const { data: sessions, error } = await supabase
      .from("gaming_sessions")
      .select("id, device_type, device_name, status, starts_at, ends_at, activated_at, paused_at")
      .in("id", sessionIds);
    if (error) throw error;
    for (const session of sessions ?? []) sessionsById.set(session.id, session);
  }
  return {
    id: party.id,
    gamingSessionId: party.gaming_session_id,
    hostUserId: party.host_user_id,
    hostName: usersById.get(party.host_user_id)?.full_name ?? null,
    joinCode: party.join_code,
    status: party.status,
    maxMembers: party.max_members,
    createdAt: party.created_at,
    startedAt: party.started_at,
    closedAt: party.closed_at,
    members: (members ?? []).map((member: any) => {
      const session = member.gaming_session_id ? sessionsById.get(member.gaming_session_id) : null;
      const sessionStatus = session?.status === "scheduled"
        ? "scheduled"
        : ["completed", "cancelled"].includes(session?.status) ? "finished" : "active";
      return {
        id: member.id,
        userId: member.user_id,
        gamingSessionId: member.gaming_session_id,
        name: usersById.get(member.user_id)?.full_name ?? null,
        role: member.role,
        membershipStatus: member.status,
        sessionStatus,
        joinedAt: member.joined_at,
        leftAt: member.left_at,
        gamingSession: session ? mapSession(session) : null,
      };
    }),
  };
}

const EXTENSION_PRICES: Record<number, number> = { 30: 20, 60: 45, 120: 85, 180: 150 };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const userId = await getAuthenticatedUserId(req);
  if (!userId) return json({ error: "UNAUTHORIZED" }, 401);

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "current-session";

  try {
    await finalizeExpiredActiveSessions(userId);

    if (action === "points-balance") {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const { error: reconcileError } = await supabase.rpc("reconcile_user_points", { p_user_id: userId });
      if (reconcileError) console.error("points reconcile failed", reconcileError);
      const { data, error } = await supabase.from("points_transactions").select("amount").eq("user_id", userId);
      if (error) {
        console.error("points balance query failed", error);
        return json({ error: "POINTS_UNAVAILABLE" }, 503);
      }
      const balance = (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
      return json({ balance });
    }

    if (action === "points-history") {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const { error: reconcileError } = await supabase.rpc("reconcile_user_points", { p_user_id: userId });
      if (reconcileError) console.error("points reconcile failed", reconcileError);
      const { data, error } = await supabase
        .from("points_transactions")
        .select("id, amount, reason, reference_type, reference_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("points history query failed", error);
        return json({ error: "POINTS_HISTORY_UNAVAILABLE" }, 503);
      }
      return json({
        transactions: (data ?? []).map((row: any) => ({
          id: row.id,
          amount: row.amount,
          reason: row.reason,
          referenceType: row.reference_type,
          referenceId: row.reference_id,
          createdAt: row.created_at,
        })),
      });
    }

    if (action === "current-session") {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const { data, error } = await supabase
        .from("gaming_sessions")
        .select("id, device_type, device_name, status, starts_at, ends_at, activated_at, paused_at")
        .eq("user_id", userId)
        .in("status", ["scheduled", "active", "paused"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return json({ error: "SESSION_UNAVAILABLE" }, 503);
      return json({ session: data ? mapSession(data) : null });
    }

    if (action === "activate-session") {
      if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const body = await req.json().catch(() => null);
      const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
      if (!sessionId) return json({ error: "INVALID_SESSION_ID" }, 400);
      const { data: session, error } = await supabase
        .from("gaming_sessions")
        .select("id, user_id, status, starts_at, ends_at")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) return json({ error: "SESSION_UNAVAILABLE" }, 503);
      if (!session) return json({ error: "SESSION_NOT_FOUND" }, 404);
      if (session.status !== "scheduled") return json({ error: "SESSION_NOT_ACTIVATABLE" }, 409);
      const durationMs = Math.max(60_000, new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime());
      const activatedAt = new Date();
      const endsAt = new Date(activatedAt.getTime() + durationMs);
      const { data: updated, error: updateError } = await supabase
        .from("gaming_sessions")
        .update({
          status: "active",
          starts_at: activatedAt.toISOString(),
          ends_at: endsAt.toISOString(),
          activated_at: activatedAt.toISOString(),
          paused_at: null,
          updated_at: activatedAt.toISOString(),
        })
        .eq("id", sessionId)
        .eq("user_id", userId)
        .eq("status", "scheduled")
        .select("id, device_type, device_name, status, starts_at, ends_at, activated_at, paused_at")
        .maybeSingle();
      if (updateError) return json({ error: "SESSION_UNAVAILABLE" }, 503);
      if (!updated) return json({ error: "SESSION_NOT_ACTIVATABLE" }, 409);
      return json({ session: mapSession(updated) });
    }

    if (action === "session-history") {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const filter = url.searchParams.get("filter") ?? "all";
      if (!["all", "pc", "xbox"].includes(filter)) return json({ error: "INVALID_FILTER" }, 400);
      let query = supabase
        .from("gaming_sessions")
        .select("id, device_type, device_name, status, starts_at, ends_at, activated_at, paused_at")
        .eq("user_id", userId)
        .in("status", ["completed", "cancelled"])
        .order("starts_at", { ascending: false });
      if (filter !== "all") query = query.eq("device_type", filter);
      const { data, error } = await query;
      if (error) return json({ error: "SESSION_HISTORY_UNAVAILABLE" }, 503);
      return json({ sessions: (data ?? []).map((row: any) => ({
        ...mapSession(row),
        durationMinutes: Math.max(0, Math.round((new Date(row.ends_at).getTime() - new Date(row.starts_at).getTime()) / 60000)),
        pointsEarned: null,
      })) });
    }

    if (["extension-request", "session-extension-request", "latest-extension-request", "latest-session-extension-request"].includes(action)) {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const gamingSessionId = url.searchParams.get("gamingSessionId")?.trim() ?? url.searchParams.get("sessionId")?.trim() ?? "";
      if (!gamingSessionId) return json({ error: "INVALID_SESSION_ID" }, 400);
      const { data: ownedSession, error: sessionError } = await supabase.from("gaming_sessions").select("id").eq("id", gamingSessionId).eq("user_id", userId).maybeSingle();
      if (sessionError) return json({ error: "EXTENSION_UNAVAILABLE" }, 503);
      if (!ownedSession) return json({ error: "SESSION_NOT_FOUND" }, 404);
      const { data, error } = await supabase
        .from("session_extension_requests")
        .select("id, gaming_session_id, requested_minutes, quoted_price_mdl, status, requested_at, processed_at, rejection_reason")
        .eq("gaming_session_id", gamingSessionId)
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return json({ error: "EXTENSION_UNAVAILABLE" }, 503);
      return json({ request: data ? mapExtensionRequest(data) : null });
    }

    if (["request-extension", "request-session-extension", "create-extension-request"].includes(action)) {
      if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const body = await req.json().catch(() => null);
      const gamingSessionId = typeof body?.gamingSessionId === "string"
        ? body.gamingSessionId.trim()
        : typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
      const requestedMinutes = Number(body?.requestedMinutes);
      if (!gamingSessionId) return json({ error: "INVALID_SESSION_ID" }, 400);
      if (!Number.isInteger(requestedMinutes) || !(requestedMinutes in EXTENSION_PRICES)) return json({ error: "INVALID_EXTENSION_DURATION" }, 400);
      const { data: session, error: sessionError } = await supabase.from("gaming_sessions").select("id, status, ends_at").eq("id", gamingSessionId).eq("user_id", userId).maybeSingle();
      if (sessionError) return json({ error: "EXTENSION_UNAVAILABLE" }, 503);
      if (!session) return json({ error: "SESSION_NOT_FOUND" }, 404);
      if (!["active", "paused"].includes(session.status)) return json({ error: "SESSION_NOT_EXTENDABLE" }, 409);
      const { data: pending, error: pendingError } = await supabase
        .from("session_extension_requests")
        .select("id, gaming_session_id, requested_minutes, quoted_price_mdl, status, requested_at, processed_at, rejection_reason")
        .eq("gaming_session_id", gamingSessionId)
        .eq("user_id", userId)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();
      if (pendingError) return json({ error: "EXTENSION_UNAVAILABLE" }, 503);
      if (pending) return json({ error: "EXTENSION_REQUEST_ALREADY_PENDING", request: mapExtensionRequest(pending) }, 409);
      const { data: created, error: createError } = await supabase
        .from("session_extension_requests")
        .insert({ gaming_session_id: gamingSessionId, user_id: userId, requested_minutes: requestedMinutes, quoted_price_mdl: EXTENSION_PRICES[requestedMinutes], status: "pending" })
        .select("id, gaming_session_id, requested_minutes, quoted_price_mdl, status, requested_at, processed_at, rejection_reason")
        .single();
      if (createError) {
        if (createError.code === "23505") return json({ error: "EXTENSION_REQUEST_ALREADY_PENDING" }, 409);
        return json({ error: "EXTENSION_UNAVAILABLE" }, 503);
      }
      return json({ request: mapExtensionRequest(created) }, 201);
    }

    if (action === "party-for-session") {
      if (req.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const gamingSessionId = url.searchParams.get("gamingSessionId")?.trim() ?? "";
      if (!gamingSessionId) return json({ error: "INVALID_SESSION_ID" }, 400);
      const { data: ownedSession, error: sessionError } = await supabase.from("gaming_sessions").select("id").eq("id", gamingSessionId).eq("user_id", userId).maybeSingle();
      if (sessionError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
      if (!ownedSession) return json({ error: "SESSION_NOT_FOUND" }, 404);
      let { data: party, error: partyError } = await supabase
        .from("session_parties")
        .select(PARTY_COLUMNS)
        .eq("gaming_session_id", gamingSessionId)
        .in("status", ["forming", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (partyError) return json({ error: "PARTY_UNAVAILABLE" }, 503);

      if (!party) {
        const { data: membership, error: membershipError } = await supabase
          .from("party_members")
          .select("party_id")
          .eq("user_id", userId)
          .eq("gaming_session_id", gamingSessionId)
          .in("status", ["invited", "joined"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (membershipError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
        if (membership) {
          const result = await supabase
            .from("session_parties")
            .select(PARTY_COLUMNS)
            .eq("id", membership.party_id)
            .in("status", ["forming", "active"])
            .maybeSingle();
          if (result.error) return json({ error: "PARTY_UNAVAILABLE" }, 503);
          party = result.data;
        }
      }
      return json({ party: party ? await getPartyDetails(party) : null });
    }

    if (action === "create-party") {
      if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const body = await req.json().catch(() => null);
      const gamingSessionId = typeof body?.gamingSessionId === "string" ? body.gamingSessionId.trim() : "";
      if (!gamingSessionId) return json({ error: "INVALID_SESSION_ID" }, 400);
      const { data: session, error: sessionError } = await supabase.from("gaming_sessions").select("id, status").eq("id", gamingSessionId).eq("user_id", userId).maybeSingle();
      if (sessionError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
      if (!session) return json({ error: "SESSION_NOT_FOUND" }, 404);
      if (!["active", "paused"].includes(session.status)) return json({ error: "SESSION_NOT_PARTY_ELIGIBLE" }, 409);
      const { data: existingParty } = await supabase
        .from("session_parties")
        .select(PARTY_COLUMNS)
        .eq("gaming_session_id", gamingSessionId)
        .in("status", ["forming", "active"])
        .limit(1)
        .maybeSingle();
      if (existingParty) return json({ party: await getPartyDetails(existingParty) });
      const nowIso = new Date().toISOString();
      const { data: party, error: createError } = await supabase
        .from("session_parties")
        .insert({ gaming_session_id: gamingSessionId, host_user_id: userId, join_code: await createUniquePartyCode(), status: "forming", max_members: 4, started_at: nowIso, updated_at: nowIso })
        .select(PARTY_COLUMNS)
        .single();
      if (createError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
      const { error: memberError } = await supabase.from("party_members").insert({ party_id: party.id, user_id: userId, gaming_session_id: gamingSessionId, role: "host", status: "joined", joined_at: nowIso, updated_at: nowIso });
      if (memberError) {
        await supabase.from("session_parties").delete().eq("id", party.id);
        return json({ error: "PARTY_UNAVAILABLE" }, 503);
      }
      return json({ party: await getPartyDetails(party) }, 201);
    }

    if (action === "join-party") {
      if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
      const body = await req.json().catch(() => null);
      const joinCode = normalizePartyJoinCode(body?.joinCode ?? body?.code);
      if (!joinCode) return json({ error: "INVALID_PARTY_CODE" }, 400);

      const { data: party, error: partyError } = await supabase
        .from("session_parties")
        .select(PARTY_COLUMNS)
        .eq("join_code", joinCode)
        .maybeSingle();
      if (partyError) {
        console.error("join-party lookup failed", { code: partyError.code });
        return json({ error: "PARTY_UNAVAILABLE" }, 503);
      }
      if (!party) return json({ error: "PARTY_NOT_FOUND" }, 404);
      if (!["forming", "active"].includes(party.status)) return json({ error: "PARTY_CLOSED" }, 409);

      if (party.host_user_id === userId) return json({ party: await getPartyDetails(party) });

      const { data: existingMember, error: existingMemberError } = await supabase
        .from("party_members")
        .select("id, status")
        .eq("party_id", party.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (existingMemberError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
      if (existingMember && ["invited", "joined"].includes(existingMember.status)) {
        return json({ party: await getPartyDetails(party) });
      }

      const { count: activeMemberCount, error: countError } = await supabase
        .from("party_members")
        .select("id", { count: "exact", head: true })
        .eq("party_id", party.id)
        .in("status", ["invited", "joined"]);
      if (countError) return json({ error: "PARTY_UNAVAILABLE" }, 503);
      if ((activeMemberCount ?? 0) >= party.max_members) return json({ error: "PARTY_FULL" }, 409);

      const { data: participantSession, error: sessionError } = await supabase
        .from("gaming_sessions")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["active", "paused"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sessionError) return json({ error: "SESSION_UNAVAILABLE" }, 503);
      if (!participantSession) return json({ error: "PARTICIPANT_SESSION_REQUIRED" }, 409);

      const nowIso = new Date().toISOString();
      const memberPayload = {
        gaming_session_id: participantSession.id,
        role: "member",
        status: "joined",
        joined_at: nowIso,
        left_at: null,
        updated_at: nowIso,
      };

      const membershipResult = existingMember
        ? await supabase.from("party_members").update(memberPayload).eq("id", existingMember.id)
        : await supabase.from("party_members").insert({
          party_id: party.id,
          user_id: userId,
          ...memberPayload,
        });

      if (membershipResult.error) {
        if (membershipResult.error.code === "23505") {
          const { data: concurrentMember } = await supabase
            .from("party_members")
            .select("id, status")
            .eq("party_id", party.id)
            .eq("user_id", userId)
            .in("status", ["invited", "joined"])
            .maybeSingle();
          if (concurrentMember) return json({ party: await getPartyDetails(party) });
        }
        console.error("join-party membership write failed", { code: membershipResult.error.code });
        return json({ error: "PARTY_UNAVAILABLE" }, 503);
      }

      return json({ party: await getPartyDetails(party) });
    }

    return json({ error: "NOT_FOUND" }, 404);
  } catch (error) {
    console.error("ora-api unexpected error", error);
    return json({ error: "INTERNAL_ERROR" }, 500);
  }
});
