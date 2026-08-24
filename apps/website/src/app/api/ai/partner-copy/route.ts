import { improvePartnerCopy, isPartnerCopyField } from "../../../../lib/ai/partner-copy-agent";
import { verifyAiBusinessUser } from "../../../../lib/server/ai-authorization";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";

function clean(value: unknown, max = 1_600) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessId = clean(body?.businessId, 140);
  const field = body?.field;
  if (!isPartnerCopyField(field)) return jsonError("Choose title, short description, or description.", 400);

  const verified = await verifyAiBusinessUser(request, businessId);
  if ("error" in verified) return verified.error;

  const result = await improvePartnerCopy({
    businessName: String(verified.business.name ?? ""),
    category: clean(body?.category, 80),
    city: String(verified.business.cityName ?? verified.business.city ?? ""),
    field,
    scopeKey: verified.token.uid,
    text: clean(body?.text, field === "title" ? 120 : field === "short_description" ? 180 : 1_600)
  });

  return jsonOk(result);
}

