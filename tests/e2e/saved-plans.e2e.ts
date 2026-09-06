/// <reference lib="dom" />

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { expect, test, type Page } from "@playwright/test";
import { buildSuggestedPlan, parsePlanFinderInput } from "../../apps/website/src/lib/planner";
import type { SavedPlanRecord } from "../../apps/website/src/lib/firestore";

const root = resolve(import.meta.dirname, "../..");
const fixtureUrl = "http://saved-plans.test/";
let script: string;
let css: string;

// Mount the real dashboard with isolated account adapters. No live auth, reads, or writes.
test.beforeAll(async () => {
  const mocks: Record<string, string> = {
    "../../lib/auth": `
      export function observeUser(callback) {
        const fixture = window.savedPlanFixture;
        fixture.signIn = (uid) => callback(uid ? { uid, email: uid + '@example.test', getIdToken: async () => 'fixture-token-' + uid } : null);
        queueMicrotask(() => fixture.signIn('first-user'));
        return () => { fixture.signIn = () => {}; };
      }`,
    "../../lib/firebase": `export const isFirebaseConfigured = () => true;`,
    "../../lib/firestore": `
      export const ensureUserProfile = async () => {};
      export const readUserProfile = async () => ({ displayName: 'Saved plan account' });
      export const readSavedListings = async () => [];
      export const readUserBookingRequests = async () => [];
      export const readSavedPlans = async () => structuredClone(window.savedPlanFixture.records);`,
    "../listings/save-listing-button": `export const SaveListingButton = () => null;`,
    "next/link": `export default function Link({ children, prefetch, ...props }) { return <a {...props}>{children}</a>; }`
  };
  const result = await build({
    stdin: {
      contents: `import { createRoot } from 'react-dom/client'; import { ProfileDashboard } from './apps/website/src/components/profile/profile-dashboard'; createRoot(document.getElementById('root')).render(<ProfileDashboard />);`,
      loader: "tsx", resolveDir: root
    },
    bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic",
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [{ name: "isolated-account", setup(builder) {
      builder.onResolve({ filter: /./ }, (args) => args.path in mocks ? { path: args.path, namespace: "account-mock" } : undefined);
      builder.onLoad({ filter: /./, namespace: "account-mock" }, (args) => ({ contents: mocks[args.path], loader: "tsx", resolveDir: root }));
    } }]
  });
  script = result.outputFiles[0].text;
  css = (await postcss([tailwindcss({
    content: ["profile-dashboard.tsx", "saved-plan-card.tsx"].map((file) => ({
      raw: readFileSync(resolve(root, "apps/website/src/components/profile", file), "utf8"), extension: "tsx"
    })),
    corePlugins: { preflight: true }
  })]).process("@tailwind base; @tailwind utilities;", { from: undefined })).css;
});

function savedPlan(planId: string, title: string): SavedPlanRecord {
  const plan = buildSuggestedPlan(parsePlanFinderInput({ cityId: "miami", budget: "free" }), []);
  return {
    planId,
    planSnapshot: {
      ...plan, id: planId, title,
      summary: "A saved neighborhood outing with a library backup.",
      items: [...plan.items, {
        category: "Activity", ctaHref: "/deals/library-walk", ctaLabel: "View Deal",
        description: "Meet at the public entrance.", estimatedPrice: "Free", time: "45 min",
        title: "Saved library walk", whyItFits: "No admission fee.", listingId: "library-walk"
      }]
    }
  };
}

async function openDashboard(page: Page, records: SavedPlanRecord[]) {
  await page.route("**/*", (route) => route.request().url() === fixtureUrl
    ? route.fulfill({ contentType: "text/html", body: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main id="root" style="max-width:900px;margin:auto;padding:16px"></main></body></html>' })
    : route.abort());
  await page.goto(fixtureUrl);
  await page.addStyleTag({ content: `${css} body{background:#070816;color:#fff;font-family:Arial,sans-serif;--border-subtle:#ffffff30;--muted-foreground:#c9cbd2;--accent-amber:#facc15}` });
  await page.evaluate((items) => Object.assign(window, { savedPlanFixture: { records: items } }), records);
  await page.addScriptTag({ content: script });
  await expect(page.getByRole("heading", { name: "Saved plan account" })).toBeVisible();
  const totalRows = await page.getByLabel("Account totals").locator(":scope > div").evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(totalRows).size).toBe(1);
}

test("reopens the saved snapshot with prices, timings, backups and working deal links", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openDashboard(page, [savedPlan("original", `Library outing ${"long-title".repeat(12)}`)]);
  await expect(page.getByText("A saved neighborhood outing with a library backup.")).toBeVisible();
  const open = page.getByRole("button", { name: "View saved plan", exact: true });
  await expect(open).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("heading", { name: "4. Saved library walk" })).not.toBeVisible();
  await open.click();
  await expect(page.getByRole("button", { name: "Close saved plan" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("heading", { name: "4. Saved library walk" })).toBeVisible();
  await expect(page.getByText("Activity | 45 min | Free", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup options" })).toBeVisible();
  await expect(page.getByText(/Prices, opening hours, and availability may have changed/)).toBeVisible();
  await expect(page.getByRole("link", { name: "View Deal" })).toHaveAttribute("href", "/deals/library-walk");
  expect(await page.evaluate(() => innerWidth)).toBe(page.viewportSize()?.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("saved-plan-open.png"), fullPage: true });
  await page.getByRole("button", { name: "Close saved plan" }).click();
  await page.getByRole("button", { name: "View saved plan", exact: true }).click();
  await expect(page.getByText("Meet at the public entrance.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("confirms deletion, preserves failed saves, prevents double submission and refreshes the count", async ({ page }) => {
  await openDashboard(page, [savedPlan("first", "First outing"), savedPlan("second", "Second outing")]);
  const first = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "First outing", exact: true }) });
  let requests = 0;
  let fail = true;
  let finish: (() => void) | undefined;
  await page.route("**/api/me/saved-plans", async (route) => {
    requests += 1;
    expect(route.request().method()).toBe("DELETE");
    expect(route.request().headers().authorization).toBe("Bearer fixture-token-first-user");
    expect(route.request().postDataJSON()).toEqual({ planId: "first" });
    await new Promise<void>((resolve) => { finish = resolve; });
    if (!fail) await page.evaluate(() => {
      const fixture = (window as unknown as { savedPlanFixture: { records: SavedPlanRecord[] } }).savedPlanFixture;
      fixture.records = fixture.records.filter((item) => item.planId !== "first");
    });
    await route.fulfill({ status: fail ? 503 : 200, json: { saved: false, planId: "first" } });
  });
  await first.getByRole("button", { name: "Delete saved plan: First outing" }).click();
  await first.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(first.getByRole("button", { name: "Delete saved plan: First outing" })).toBeFocused();
  expect(requests).toBe(0);
  await first.getByRole("button", { name: "Delete saved plan: First outing" }).click();
  await first.getByRole("button", { name: "Delete plan", exact: true }).click();
  await expect(first.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  await expect(first.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
  await expect.poll(() => requests).toBe(1);
  finish!();
  await expect(first.getByRole("alert")).toContainText("Could not delete");
  await expect(first).toBeVisible();
  fail = false;
  await first.getByRole("button", { name: "Delete plan", exact: true }).click();
  await expect.poll(() => requests).toBe(2);
  finish!();
  await expect(first).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Second outing", exact: true })).toBeVisible();
  const metric = page.getByText("Saved plans", { exact: true }).filter({ hasNot: page.locator("*") }).first().locator("..");
  await expect(metric).toContainText("1");
  await page.getByRole("button", { name: "Refresh account" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("tolerates older partial snapshots and never links to untrusted saved URLs", async ({ page }) => {
  const legacy = savedPlan("legacy", "Older saved plan");
  const unsafe = savedPlan("unsafe", "Untrusted link plan");
  // Older native snapshots can omit the web-only itinerary fields.
  const { items, input, backupSuggestions, ...partial } = legacy.planSnapshot;
  legacy.planSnapshot = partial as SavedPlanRecord["planSnapshot"];
  unsafe.planSnapshot.items[0].ctaHref = "https://example.test/not-a-deal";
  await openDashboard(page, [legacy, unsafe]);
  await page.getByRole("button", { name: "View saved plan", exact: true }).first().click();
  await expect(page.getByText("This saved plan has no itinerary details.")).toBeVisible();
  await page.getByRole("button", { name: "View saved plan", exact: true }).click();
  await expect(page.locator('a[href="https://example.test/not-a-deal"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View Deal" })).toHaveCount(1);
});

test("does not apply a stale deletion result to a different signed-in account", async ({ page }) => {
  await openDashboard(page, [savedPlan("shared-id", "First account plan")]);
  let finish: (() => void) | undefined;
  await page.route("**/api/me/saved-plans", async (route) => {
    await new Promise<void>((resolve) => { finish = resolve; });
    await route.fulfill({ status: 200, json: { saved: false } });
  });
  await page.getByRole("button", { name: "Delete saved plan: First account plan" }).click();
  await page.getByRole("button", { name: "Delete plan", exact: true }).click();
  await expect.poll(() => Boolean(finish)).toBe(true);
  await page.evaluate((item) => {
    const fixture = (window as unknown as { savedPlanFixture: { records: SavedPlanRecord[]; signIn: (uid: string) => void } }).savedPlanFixture;
    fixture.records = [item];
    fixture.signIn("second-user");
  }, savedPlan("shared-id", "Second account plan"));
  await expect(page.getByRole("heading", { name: "Second account plan", exact: true })).toBeVisible();
  const response = page.waitForResponse("**/api/me/saved-plans");
  finish!();
  await response;
  await expect(page.getByRole("heading", { name: "Second account plan", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "First account plan", exact: true })).toHaveCount(0);
});
