import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const routes = [
  "api/mobile/deals",
  "api/mobile/workspace",
  "api/admin/partner-applications/approve",
  "api/booking-request",
  "api/me/access",
  "api/partner/listings",
  "api/webhooks/stripe",
  "api/ai/support-chat"
];

// Loading an App Router wrapper is insufficient: Next loads userland lazily.
// This check executes no handlers and needs no credentials or external writes.
for (const route of routes) {
  const path = fileURLToPath(new URL(`../apps/website/.next/server/app/${route}/route.js`, import.meta.url));
  const { routeModule } = await require(path);
  await routeModule.ensureUserland();
  assert.ok(typeof routeModule.userland.GET === "function" || typeof routeModule.userland.POST === "function", `${route}: missing handler`);
  console.log(`Runtime load passed: /${route}`);
}
