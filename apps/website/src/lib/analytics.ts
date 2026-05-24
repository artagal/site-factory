export type AnalyticsEventName =
  | "account_deleted"
  | "hero_cta_click"
  | "challenge_generated"
  | "challenge_started"
  | "challenge_completed"
  | "challenge_saved"
  | "challenge_shared"
  | "email_verification_sent"
  | "login_clicked"
  | "waitlist_submitted";

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  path: string;
  properties: Record<string, unknown>;
  referrer: string;
  timestamp: string;
};

const analyticsStorageKey = "gofunmotion:analytics-events";
const analyticsDebugKey = "gofunmotion:analytics-debug";
const maxStoredEvents = 200;

type BrowserStorage = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

type BrowserRuntime = {
  CustomEvent?: new (name: string, init?: { detail?: unknown }) => unknown;
  dispatchEvent?: (event: unknown) => boolean;
  document?: {
    referrer?: string;
  };
  localStorage?: BrowserStorage;
  location?: {
    hash?: string;
    hostname?: string;
    pathname?: string;
  };
};

function getBrowserRuntime() {
  return globalThis as typeof globalThis & BrowserRuntime;
}

function canUseBrowserStorage() {
  const runtime = getBrowserRuntime();
  return Boolean(runtime.location && runtime.localStorage);
}

function safeReadEvents() {
  if (!canUseBrowserStorage()) return [];

  try {
    const raw = getBrowserRuntime().localStorage?.getItem(analyticsStorageKey);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function safeWriteEvents(events: AnalyticsEvent[]) {
  if (!canUseBrowserStorage()) return;

  try {
    getBrowserRuntime().localStorage?.setItem(analyticsStorageKey, JSON.stringify(events.slice(-maxStoredEvents)));
  } catch {
    // Analytics should never break the product loop.
  }
}

function shouldDebugEvents() {
  if (!canUseBrowserStorage()) return false;
  const runtime = getBrowserRuntime();

  return (
    runtime.location?.hostname === "localhost" ||
    runtime.location?.hostname === "127.0.0.1" ||
    runtime.localStorage?.getItem(analyticsDebugKey) === "1"
  );
}

export function trackEvent(name: AnalyticsEventName, properties: Record<string, unknown> = {}) {
  const runtime = getBrowserRuntime();
  if (!runtime.location) return null;

  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name,
    path: `${runtime.location.pathname ?? ""}${runtime.location.hash ?? ""}`,
    properties,
    referrer: runtime.document?.referrer ?? "",
    timestamp: new Date().toISOString()
  };

  safeWriteEvents([...safeReadEvents(), event]);

  if (shouldDebugEvents()) {
    console.info("[GoFunMotion analytics]", event);
  }

  if (runtime.dispatchEvent && runtime.CustomEvent) {
    runtime.dispatchEvent(new runtime.CustomEvent("gofunmotion:analytics", { detail: event }));
  }

  void fetch("/api/events", {
    body: JSON.stringify(event),
    headers: {
      "Content-Type": "application/json"
    },
    keepalive: true,
    method: "POST"
  }).catch(() => undefined);

  return event;
}

export function getStoredAnalyticsEvents() {
  return safeReadEvents();
}

export function clearStoredAnalyticsEvents() {
  safeWriteEvents([]);
}

export function setAnalyticsDebug(enabled: boolean) {
  if (!canUseBrowserStorage()) return;
  const runtime = getBrowserRuntime();

  if (enabled) {
    runtime.localStorage?.setItem(analyticsDebugKey, "1");
    return;
  }

  runtime.localStorage?.removeItem(analyticsDebugKey);
}
