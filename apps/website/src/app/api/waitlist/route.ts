import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { isDemoDataEnabled } from "../../../lib/demo-mode";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`waitlist:${ip}`, 8, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many waitlist requests. Try again later.", 429);

  const body = (await request.json().catch(() => null)) as {
    city?: unknown;
    email?: unknown;
    interestType?: unknown;
    source?: unknown;
  } | null;

  const email = normalizeEmail(body?.email);
  const city = clean(body?.city) || null;
  const interestType = body?.interestType === "business" ? "business" : "user";
  const source = clean(body?.source, 60) || "website";

  if (!isValidEmail(email)) return jsonError("Enter a valid email address.", 400);

  const db = getFirebaseAdminDb();
  if (!db) {
    if (isDemoDataEnabled()) return jsonOk({ demo: true, synced: false }, 201);
    return jsonError("The city waitlist is temporarily unavailable.", 503);
  }

  await db.collection("waitlist").add({
    city,
    createdAt: FieldValue.serverTimestamp(),
    email,
    interestType,
    source,
    userAgent: request.headers.get("user-agent")?.slice(0, 180) ?? ""
  });
  void incrementServerGlobalStats(["waitlistSubmissions"]).catch(() => false);

  return jsonOk({ synced: true }, 201);
}
