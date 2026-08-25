import { slugify } from "../../../../lib/slug";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";
import { writeAdminAuditLog } from "../../../../lib/server/admin-audit";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function verifyAdmin(request: Request) {
  const token = await verifyBearerToken(request);
  if (!token) return null;

  const db = getFirebaseAdminDb();
  if (!db) return null;

  const adminSnapshot = await db.collection("admins").doc(token.uid).get();
  return adminSnapshot.exists ? token : null;
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = clean(body?.name, 120);
  const slug = slugify(clean(body?.slug, 120) || name);
  const description = clean(body?.description, 600) || `${name} deals and last-minute activity openings.`;
  const icon = clean(body?.icon, 40) || "Sparkles";
  const accentColor = clean(body?.accentColor, 40) || "#bef264";
  const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body?.sortOrder) : 100;

  if (!name || !slug) return jsonError("Add category name and valid slug.", 400);

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Admin category management is not connected yet.", 503);

  const adminToken = await verifyAdmin(request);
  if (!adminToken) return jsonError("Admin access is required.", 401);

  const categoryId = slug;
  await db.collection("categories").doc(categoryId).set(
    {
      accentColor,
      active: body?.active !== false,
      createdAt: FieldValue.serverTimestamp(),
      description,
      icon,
      lastManagedBy: adminToken.uid,
      name,
      slug,
      sortOrder,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await writeAdminAuditLog({
    action: "category.upsert",
    actorUid: adminToken.uid,
    metadata: { active: body?.active !== false, sortOrder },
    request,
    targetId: categoryId,
    targetType: "category"
  });

  return jsonOk({ categoryId, slug }, 201);
}
