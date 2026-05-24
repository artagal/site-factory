import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`partner-application:${ip}`, 5, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many partner applications. Try again later.", 429);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessName = clean(body?.businessName, 120);
  const ownerName = clean(body?.ownerName, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const city = clean(body?.city, 120);
  const category = clean(body?.category, 80);
  const description = clean(body?.description, 800);

  if (!businessName || !ownerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !city || !category || description.length < 20) {
    return jsonError("Add business name, owner name, valid email, city, category, and description.", 400);
  }

  const application = {
    averagePrice: clean(body?.averagePrice, 80),
    businessName,
    category,
    city,
    createdAt: FieldValue.serverTimestamp(),
    description,
    email,
    instagram: clean(body?.instagram, 160) || null,
    message: clean(body?.message, 800),
    offersLastMinuteDeals: Boolean(body?.offersLastMinuteDeals),
    ownerName,
    phone: clean(body?.phone, 60) || null,
    status: "new",
    updatedAt: FieldValue.serverTimestamp(),
    website: clean(body?.website, 160) || null
  };

  const db = getFirebaseAdminDb();
  if (!db) return jsonOk({ applicationId: `local-${Date.now()}`, synced: false }, 201);

  const docRef = await db.collection("partnerApplications").add(application);
  void incrementServerGlobalStats(["partnerApplications"]).catch(() => false);
  return jsonOk({ applicationId: docRef.id, synced: true }, 201);
}
