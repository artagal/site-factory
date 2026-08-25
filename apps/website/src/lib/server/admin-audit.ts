import { createHash } from "node:crypto";
import { FieldValue, getFirebaseAdminDb } from "./firebase-admin";
import { getClientIp } from "./rate-limit";

type AdminAuditInput = {
  action: string;
  actorUid: string;
  metadata?: Record<string, boolean | number | string | null>;
  request?: Request;
  targetId: string;
  targetType: "bookingRequest" | "business" | "category" | "city" | "listing" | "partnerApplication" | "user";
};

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

export async function writeAdminAuditLog(input: AdminAuditInput) {
  const db = getFirebaseAdminDb();
  if (!db) return null;

  const ip = input.request ? getClientIp(input.request) : "";
  const salt = clean(process.env.ADMIN_AUDIT_SALT ?? "", 200);
  const ipHash = ip && ip !== "unknown" && salt
    ? createHash("sha256").update(`${salt}:${ip}`).digest("hex")
    : null;
  const metadata = Object.fromEntries(
    Object.entries(input.metadata ?? {}).slice(0, 20).map(([key, value]) => [clean(key, 80), typeof value === "string" ? clean(value, 300) : value])
  );

  const eventRef = await db.collection("adminAuditLogs").add({
    action: clean(input.action, 100),
    actorUid: clean(input.actorUid, 160),
    createdAt: FieldValue.serverTimestamp(),
    ipHash,
    metadata,
    targetId: clean(input.targetId, 180),
    targetType: input.targetType,
    userAgent: clean(input.request?.headers.get("user-agent") ?? "", 300) || null
  });

  return eventRef.id;
}
