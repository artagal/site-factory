import { createHash } from "node:crypto";
import { FieldValue, getFirebaseAdminDb } from "../server/firebase-admin";

export type OpenAiFeature =
  | "smart_search"
  | "plan"
  | "partner_copy"
  | "booking_message"
  | "listing_review"
  | "support";

export type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiJsonSchema = {
  name: string;
  schema: Record<string, unknown>;
};

type OpenAiRequest = {
  feature: OpenAiFeature;
  jsonSchema?: OpenAiJsonSchema;
  maxOutputTokens?: number;
  messages: OpenAiMessage[];
  scopeKey?: string;
};

export type OpenAiSetup = {
  configured: boolean;
  dailyLimit: number;
  model: string;
  setupWarning: string | null;
};

export type OpenAiResponseResult =
  | {
      dailyLimit: number;
      inputTokens: number | null;
      model: string;
      ok: true;
      outputTokens: number | null;
      remaining: number | null;
      text: string;
    }
  | {
      code: "not_configured" | "rate_limited" | "provider_error" | "invalid_response";
      dailyLimit: number;
      model: string;
      ok: false;
      remaining: number | null;
      setupWarning: string;
    };

const modelEnvByFeature: Record<OpenAiFeature, string> = {
  booking_message: "OPENAI_BOOKING_MESSAGE_MODEL",
  listing_review: "OPENAI_LISTING_REVIEW_MODEL",
  partner_copy: "OPENAI_PARTNER_COPY_MODEL",
  plan: "OPENAI_PLAN_MODEL",
  smart_search: "OPENAI_SMART_SEARCH_MODEL",
  support: "OPENAI_SUPPORT_MODEL"
};

const limitEnvByFeature: Record<OpenAiFeature, string> = {
  booking_message: "AI_BOOKING_MESSAGE_DAILY_LIMIT",
  listing_review: "AI_LISTING_REVIEW_DAILY_LIMIT",
  partner_copy: "AI_PARTNER_COPY_DAILY_LIMIT",
  plan: "AI_PLAN_DAILY_LIMIT",
  smart_search: "AI_SMART_SEARCH_DAILY_LIMIT",
  support: "AI_SUPPORT_DAILY_LIMIT"
};

const defaultLimitByFeature: Record<OpenAiFeature, number> = {
  booking_message: 30,
  listing_review: 80,
  partner_copy: 50,
  plan: 20,
  smart_search: 40,
  support: 40
};

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("GoFunMotion OpenAI helpers can only run on the server.");
  }
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback;
}

function scopeHash(value: string) {
  return createHash("sha256").update(value || "anonymous").digest("hex").slice(0, 32);
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getOpenAiSetup(feature: OpenAiFeature): OpenAiSetup {
  assertServerOnly();
  const model = process.env[modelEnvByFeature[feature]]?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  const dailyLimit = boundedInteger(process.env[limitEnvByFeature[feature]], defaultLimitByFeature[feature], 1, 10_000);
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());

  return {
    configured,
    dailyLimit,
    model,
    setupWarning: configured ? null : "AI is not connected yet. GoFunMotion is using its safe built-in matching rules."
  };
}

async function reserveDailyUsage(feature: OpenAiFeature, scopeKey: string, dailyLimit: number) {
  const db = getFirebaseAdminDb();
  if (!db) {
    const requirePersistentLimits = process.env.NODE_ENV === "production" && process.env.AI_REQUIRE_PERSISTENT_LIMITS !== "false";
    return {
      allowed: !requirePersistentLimits,
      persisted: false,
      remaining: requirePersistentLimits ? 0 : null
    };
  }

  const hash = scopeHash(scopeKey);
  const reference = db.collection("aiUsage").doc(`${dayKey()}_${feature}_${hash}`);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const current = Number(snapshot.data()?.count ?? 0);
    if (current >= dailyLimit) return { allowed: false, persisted: true, remaining: 0 };

    transaction.set(
      reference,
      {
        count: current + 1,
        day: dayKey(),
        feature,
        scopeHash: hash,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return { allowed: true, persisted: true, remaining: Math.max(0, dailyLimit - current - 1) };
  });
}

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text.trim();
  if (!Array.isArray(record.output)) return "";

  const chunks: string[] = [];
  for (const output of record.output) {
    if (!output || typeof output !== "object") continue;
    const content = (output as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const text = (item as Record<string, unknown>).text;
      if (typeof text === "string") chunks.push(text);
    }
  }
  return chunks.join("\n").trim();
}

function extractTokenUsage(payload: unknown) {
  if (!payload || typeof payload !== "object") return { inputTokens: null, outputTokens: null };
  const usage = (payload as Record<string, unknown>).usage;
  if (!usage || typeof usage !== "object") return { inputTokens: null, outputTokens: null };
  const record = usage as Record<string, unknown>;
  return {
    inputTokens: typeof record.input_tokens === "number" ? record.input_tokens : null,
    outputTokens: typeof record.output_tokens === "number" ? record.output_tokens : null
  };
}

async function writeAuditEvent({
  feature,
  inputTokens,
  latencyMs,
  model,
  outputTokens,
  scopeKey,
  status
}: {
  feature: OpenAiFeature;
  inputTokens: number | null;
  latencyMs: number;
  model: string;
  outputTokens: number | null;
  scopeKey: string;
  status: string;
}) {
  const db = getFirebaseAdminDb();
  if (!db) return;
  await db.collection("aiAuditEvents").add({
    createdAt: FieldValue.serverTimestamp(),
    feature,
    inputTokens,
    latencyMs,
    model,
    outputTokens,
    scopeHash: scopeHash(scopeKey),
    status
  });
}

export async function createOpenAiResponse({
  feature,
  jsonSchema,
  maxOutputTokens = 700,
  messages,
  scopeKey = "anonymous"
}: OpenAiRequest): Promise<OpenAiResponseResult> {
  assertServerOnly();
  const setup = getOpenAiSetup(feature);
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!setup.configured || !apiKey) {
    return {
      code: "not_configured",
      dailyLimit: setup.dailyLimit,
      model: setup.model,
      ok: false,
      remaining: null,
      setupWarning: setup.setupWarning ?? "AI is not configured."
    };
  }

  const usage = await reserveDailyUsage(feature, scopeKey, setup.dailyLimit).catch(() => ({
    allowed: process.env.NODE_ENV !== "production",
    persisted: false,
    remaining: null
  }));

  if (!usage.allowed) {
    return {
      code: "rate_limited",
      dailyLimit: setup.dailyLimit,
      model: setup.model,
      ok: false,
      remaining: 0,
      setupWarning: usage.persisted
        ? "Daily AI limit reached. GoFunMotion is using safe built-in matching instead."
        : "AI usage protection is not connected. GoFunMotion is using safe built-in matching instead."
    };
  }

  const body: Record<string, unknown> = {
    input: messages.map((message) => ({ content: message.content, role: message.role })),
    max_output_tokens: Math.min(2_000, Math.max(80, maxOutputTokens)),
    model: setup.model,
    store: false
  };

  if (jsonSchema) {
    body.text = {
      format: {
        name: jsonSchema.name,
        schema: jsonSchema.schema,
        strict: true,
        type: "json_schema"
      }
    };
  }

  const controller = new AbortController();
  const timeoutMs = boundedInteger(process.env.OPENAI_TIMEOUT_MS, 12_000, 2_000, 30_000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      signal: controller.signal
    });

    if (!response.ok) {
      void writeAuditEvent({
        feature,
        inputTokens: null,
        latencyMs: Date.now() - startedAt,
        model: setup.model,
        outputTokens: null,
        scopeKey,
        status: `provider_${response.status}`
      }).catch(() => undefined);
      return {
        code: "provider_error",
        dailyLimit: setup.dailyLimit,
        model: setup.model,
        ok: false,
        remaining: usage.remaining,
        setupWarning: "AI could not complete this request. GoFunMotion is using its safe built-in result."
      };
    }

    const payload = (await response.json()) as unknown;
    const text = extractResponseText(payload);
    const tokens = extractTokenUsage(payload);

    if (!text) {
      return {
        code: "invalid_response",
        dailyLimit: setup.dailyLimit,
        model: setup.model,
        ok: false,
        remaining: usage.remaining,
        setupWarning: "AI returned no usable result. GoFunMotion is using its safe built-in result."
      };
    }

    void writeAuditEvent({
      feature,
      inputTokens: tokens.inputTokens,
      latencyMs: Date.now() - startedAt,
      model: setup.model,
      outputTokens: tokens.outputTokens,
      scopeKey,
      status: "ok"
    }).catch(() => undefined);

    return {
      dailyLimit: setup.dailyLimit,
      inputTokens: tokens.inputTokens,
      model: setup.model,
      ok: true,
      outputTokens: tokens.outputTokens,
      remaining: usage.remaining,
      text
    };
  } catch {
    void writeAuditEvent({
      feature,
      inputTokens: null,
      latencyMs: Date.now() - startedAt,
      model: setup.model,
      outputTokens: null,
      scopeKey,
      status: "request_failed"
    }).catch(() => undefined);
    return {
      code: "provider_error",
      dailyLimit: setup.dailyLimit,
      model: setup.model,
      ok: false,
      remaining: usage.remaining,
      setupWarning: "AI could not complete this request. GoFunMotion is using its safe built-in result."
    };
  } finally {
    clearTimeout(timeout);
  }
}
