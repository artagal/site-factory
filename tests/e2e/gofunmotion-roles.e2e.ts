/// <reference lib="dom" />

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const roleQaPassword = process.env.ROLE_QA_PASSWORD;
const screenshotDir = process.env.ROLE_QA_SCREENSHOT_DIR;

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true);
}

async function signIn(page: Page, email: string, nextPath: string) {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(roleQaPassword ?? "");
  await page.getByRole("button", { exact: true, name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${nextPath.replaceAll("/", "\\/")}$`));
}

async function captureRole(page: Page, role: string, testInfo: TestInfo) {
  if (!screenshotDir) return;
  mkdirSync(screenshotDir, { recursive: true });
  const viewport = testInfo.project.name.startsWith("mobile") ? "mobile" : "desktop";
  await page.screenshot({ fullPage: true, path: resolve(screenshotDir, `${role}-${viewport}.png`) });
}

test.describe("authenticated marketplace roles", () => {
  test.skip(!roleQaPassword, "Set ROLE_QA_PASSWORD and connect local Firebase emulators to run role QA.");

  test("customer sees saved inventory and confirmed booking status", async ({ page }, testInfo) => {
    await signIn(page, process.env.ROLE_QA_CUSTOMER_EMAIL ?? "customer.qa@gofunmotion.test", "/profile");

    await expect(page.getByRole("heading", { name: /Your deals, plans, and requests/i })).toBeVisible();
    await expect(page.getByText("Pottery Night - Two Seats Left", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("confirmed", { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await captureRole(page, "customer-profile", testInfo);
  });

  test("business owner sees the deal editor and customer request", async ({ page }, testInfo) => {
    await signIn(page, process.env.ROLE_QA_OWNER_EMAIL ?? "owner.qa@gofunmotion.test", "/partner/dashboard");

    await expect(page.getByRole("heading", { name: /Manage open-slot deals and booking requests/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create an open-slot offer" })).toBeVisible();
    const listingTitle = page.getByText("Pottery Night - Two Seats Left", { exact: true });
    const confirmedButton = page.getByRole("button", { name: "Confirmed" });
    const mobile = testInfo.project.name.startsWith("mobile");
    await expect(mobile ? listingTitle.last() : listingTitle.first()).toBeVisible();
    await expect(mobile ? confirmedButton.last() : confirmedButton.first()).toBeDisabled();
    await expectNoHorizontalOverflow(page);
    await captureRole(page, "partner-dashboard", testInfo);
  });

  test("admin sees live moderation, supply, and booking data", async ({ page }, testInfo) => {
    await signIn(page, process.env.ROLE_QA_ADMIN_EMAIL ?? "admin.qa@gofunmotion.test", "/admin");

    await expect(page.getByRole("heading", { name: /Review supply before it goes public/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live listing approvals" })).toBeVisible();
    await expect(page.getByText("QA Creative Lab - Austin", { exact: true })).toBeVisible();
    await expect(page.getByText("QA Customer - customer.qa@gofunmotion.test - party of 2", { exact: true })).toBeVisible();
    await expect(page.getByText(/Demo listing review state/i)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await captureRole(page, "admin-dashboard", testInfo);
  });
});
