import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

const allowedInterests = new Set([
  "AI coach",
  "City quests",
  "Couples mode",
  "Creator packs",
  "Daily streaks",
  "Friend challenges"
]);

function normalizeEmail(email: unknown) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function normalizeInterests(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && allowedInterests.has(item))
    .slice(0, 8);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`waitlist:${ip}`, 8, 60 * 60_000);

  if (!limit.allowed) {
    return jsonError("Too many waitlist requests. Try again later.", 429);
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    interests?: unknown;
    source?: unknown;
  } | null;

  const email = normalizeEmail(body?.email);
  const interests = normalizeInterests(body?.interests);
  const source = typeof body?.source === "string" ? body.source.slice(0, 40) : "website";

  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonOk({
      synced: false
    });
  }

  await db.collection("waitlist").add({
    createdAt: FieldValue.serverTimestamp(),
    email,
    interests,
    source,
    userAgent: request.headers.get("user-agent")?.slice(0, 180) ?? ""
  });
  await incrementServerGlobalStats(["waitlistSubmissions"]);

  return jsonOk({
    synced: true
  });
}
