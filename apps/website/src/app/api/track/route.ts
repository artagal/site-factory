import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats, type GlobalStatField } from "../../../lib/server/stats";
import type { AnalyticsEventName } from "../../../types/deals";

const allowedEvents: AnalyticsEventName[] = [
  "hero_cta_click",
  "plan_generated",
  "listing_viewed",
  "listing_saved",
  "plan_saved",
  "booking_request_started",
  "booking_request_submitted",
  "partner_application_submitted",
  "waitlist_submitted",
  "login_clicked"
];

const statMap: Partial<Record<AnalyticsEventName, GlobalStatField[]>> = {
  booking_request_submitted: ["bookingRequests"],
  listing_viewed: ["listingsViewed"],
  login_clicked: ["loginClicks"],
  partner_application_submitted: ["partnerApplications"],
  plan_generated: ["plansGenerated"],
  waitlist_submitted: ["waitlistSubmissions"]
};

function sanitizeAnalyticsMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value as Record<string, unknown>)
    .slice(0, 24)
    .reduce<Record<string, string | number | boolean | null>>((next, [key, item]) => {
      if (!/^[a-zA-Z0-9_.-]{1,48}$/.test(key)) return next;
      if (typeof item === "string") next[key] = item.slice(0, 180);
      if (typeof item === "number" && Number.isFinite(item)) next[key] = item;
      if (typeof item === "boolean" || item === null) next[key] = item;
      return next;
    }, {});
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`track:${ip}`, 120, 60_000);
  if (!limit.allowed) return jsonError("Too many analytics requests.", 429);

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    metadata?: unknown;
    name?: string;
    path?: string;
    properties?: unknown;
    referrer?: string;
    sessionId?: string;
    timestamp?: string;
    type?: string;
  } | null;

  const type = body?.type ?? body?.name;
  if (!type || !allowedEvents.includes(type as AnalyticsEventName)) {
    return jsonError("Unknown analytics event.", 400);
  }

  const eventType = type as AnalyticsEventName;
  const statsSynced = await incrementServerGlobalStats(statMap[eventType] ?? []).catch(() => false);
  const db = getFirebaseAdminDb();
  let eventSynced = false;

  if (db) {
    await db.collection("analyticsEvents").add({
      clientEventId: typeof body?.id === "string" ? body.id.slice(0, 80) : "",
      createdAt: FieldValue.serverTimestamp(),
      ipHashSource: ip.slice(0, 80),
      metadata: sanitizeAnalyticsMetadata(body?.metadata ?? body?.properties),
      path: typeof body?.path === "string" ? body.path.slice(0, 180) : "",
      referrer: typeof body?.referrer === "string" ? body.referrer.slice(0, 180) : "",
      sessionId: typeof body?.sessionId === "string" ? body.sessionId.slice(0, 120) : "",
      timestamp: typeof body?.timestamp === "string" ? body.timestamp : "",
      type: eventType,
      userId: null
    });
    eventSynced = true;
  }

  return jsonOk({ eventSynced, statsSynced });
}
