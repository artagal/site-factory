import { answerSupport, type SupportMessage } from "../../../../lib/ai/support-agent";
import { getOptionalAiRole } from "../../../../lib/server/ai-authorization";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { getClientIp, checkRateLimit } from "../../../../lib/server/rate-limit";

function clean(value: unknown, max = 1_200) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`ai:support:${ip}`, 25, 60 * 60_000);
  if (!rateLimit.allowed) return jsonError("Too many support questions. Try again later or email support.", 429);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const messages: SupportMessage[] = rawMessages.slice(-8).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const content = clean(value.content);
    const role = value.role === "assistant" ? "assistant" as const : "user" as const;
    return content ? [{ content, role }] : [];
  });
  if (!messages.some((message) => message.role === "user")) return jsonError("Ask a GoFunMotion support question first.", 400);

  const identity = await getOptionalAiRole(request);
  const result = await answerSupport({
    messages,
    role: identity.role,
    scopeKey: identity.scopeKey ?? `ip:${ip}`
  });
  return jsonOk(result);
}

