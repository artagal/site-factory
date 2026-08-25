import { createHash } from "node:crypto";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, verifyBearerToken } from "../../../../lib/server/firebase-admin";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to load saved plans.", 401);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved plans are not connected yet.", 503);
  const snapshot = await db.collection("users").doc(token.uid).collection("savedPlans").orderBy("savedAt", "desc").get();
  return jsonOk({
    savedPlans: snapshot.docs.map((savedDoc) => {
      const data = savedDoc.data();
      const plan = data.planSnapshot && typeof data.planSnapshot === "object"
        ? data.planSnapshot as Record<string, unknown>
        : {};
      const input = plan.input && typeof plan.input === "object"
        ? plan.input as Record<string, unknown>
        : {};
      return {
        city: clean(input.city || plan.city, 120),
        id: savedDoc.id,
        persona: clean(input.who || plan.persona, 80) || "Saved plan",
        planId: clean(data.planId, 180) || savedDoc.id,
        planSnapshot: plan,
        savedAt: data.savedAt ?? null,
        summary: clean(plan.summary || plan.generatedSummary, 500),
        title: clean(plan.title || plan.generatedTitle, 180) || "Saved plan"
      };
    })
  });
}

export async function POST(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to save plans.", 401);
  const body = (await request.json().catch(() => null)) as { plan?: Record<string, unknown> } | null;
  const plan = body?.plan;
  const encoded = plan ? JSON.stringify(plan) : "";
  if (!plan || encoded.length < 20 || encoded.length > 80_000 || !clean(plan.title, 180)) {
    return jsonError("Add a valid generated plan.", 400);
  }

  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved plans are not connected yet.", 503);
  const requestedId = clean(plan.id, 180).replace(/[^a-zA-Z0-9_-]/g, "-");
  const planId = requestedId || `plan-${createHash("sha256").update(encoded).digest("hex").slice(0, 24)}`;
  await db.collection("users").doc(token.uid).collection("savedPlans").doc(planId).set({
    planId,
    planSnapshot: plan,
    savedAt: FieldValue.serverTimestamp()
  });
  return jsonOk({ planId, saved: true }, 201);
}

export async function DELETE(request: Request): Promise<Response> {
  const token = await verifyBearerToken(request);
  if (!token) return jsonError("Sign in to remove saved plans.", 401);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const planId = clean(body?.planId, 180).replace(/[^a-zA-Z0-9_-]/g, "-");
  if (!planId) return jsonError("Add planId.", 400);
  const db = getFirebaseAdminDb();
  if (!db) return jsonError("Saved plans are not connected yet.", 503);
  await db.collection("users").doc(token.uid).collection("savedPlans").doc(planId).delete();
  return jsonOk({ planId, saved: false });
}
