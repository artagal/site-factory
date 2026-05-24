import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats, type GlobalStatField } from "../../../lib/server/stats";
import type { AnalyticsEventName } from "../../../lib/analytics";

const allowedEvents: AnalyticsEventName[] = [
  "account_deleted",
  "challenge_completed",
  "challenge_generated",
  "challenge_saved",
  "challenge_shared",
  "challenge_started",
  "email_verification_sent",
  "hero_cta_click",
  "login_clicked",
  "waitlist_submitted"
];

const statMap: Partial<Record<AnalyticsEventName, GlobalStatField[]>> = {
  challenge_completed: ["challengesCompleted"],
  challenge_generated: ["challengesGenerated"],
  challenge_saved: ["challengesSaved"],
  challenge_shared: ["challengesShared"],
  login_clicked: ["loginClicks"],
  waitlist_submitted: ["waitlistSubmissions"]
};

function sanitizeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const entries = Object.entries(value as Record<string, unknown>).slice(0, 24);
  return entries.reduce<Record<string, string | number | boolean | null>>((next, [key, item]) => {
    if (!/^[a-zA-Z0-9_.-]{1,48}$/.test(key)) return next;
    if (typeof item === "string") next[key] = item.slice(0, 180);
    if (typeof item === "number" && Number.isFinite(item)) next[key] = item;
    if (typeof item === "boolean" || item === null) next[key] = item;
    return next;
  }, {});
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`events:${ip}`, 90, 60_000);

  if (!limit.allowed) {
    return jsonError("Too many event requests.", 429);
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    name?: string;
    path?: string;
    properties?: unknown;
    referrer?: string;
    timestamp?: string;
  } | null;

  if (!body || !body.name || !allowedEvents.includes(body.name as AnalyticsEventName)) {
    return jsonError("Unknown analytics event.", 400);
  }

  const name = body.name as AnalyticsEventName;
  const stats = statMap[name] ?? [];
  const statsSynced = await incrementServerGlobalStats(stats).catch(() => false);
  const db = getFirebaseAdminDb();
  let eventSynced = false;

  if (db) {
    await db.collection("analyticsEvents").add({
      clientEventId: typeof body.id === "string" ? body.id.slice(0, 80) : "",
      createdAt: FieldValue.serverTimestamp(),
      ipHashSource: ip.slice(0, 80),
      name,
      path: typeof body.path === "string" ? body.path.slice(0, 180) : "",
      properties: sanitizeProperties(body.properties),
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 180) : "",
      timestamp: typeof body.timestamp === "string" ? body.timestamp : ""
    });
    eventSynced = true;
  }

  return jsonOk({
    eventSynced,
    statsSynced
  });
}
