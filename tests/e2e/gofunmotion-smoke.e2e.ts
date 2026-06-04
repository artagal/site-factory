/// <reference lib="dom" />

import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const layout = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));

  expect(layout, `expected no horizontal overflow: ${JSON.stringify(layout)}`).toMatchObject({
    horizontalOverflow: false
  });
}

test.describe("GoFunMotion Deals smoke", () => {
  test("find plan route submits the rule-based plan form", async ({ page }) => {
    await page.goto("/find");

    await expect(page.getByRole("heading", { name: /Tell us what sounds fun/i })).toBeVisible();
    await expect(page.getByText("Suggested deal plan")).toBeVisible();

    const form = page.locator("main form").first();
    await expect(form.getByLabel("City")).toHaveValue("austin");
    await form.getByLabel("When").selectOption("tonight");
    await form.getByLabel("Who's going").selectOption("friends");
    await form.getByLabel("Budget").selectOption("under25");
    await form.getByLabel("Vibe").selectOption("social");
    await form.getByLabel("Time available").selectOption("1hour");
    await form.getByLabel("Indoor/outdoor").selectOption("indoor");

    await form.getByRole("button", { name: "Find My Plan" }).click();

    await expect(page).toHaveURL(/\/find\?/);
    expect(page.url()).toContain("cityId=austin");
    expect(page.url()).toContain("when=tonight");
    expect(page.url()).toContain("who=friends");
    await expect(page.getByRole("heading", { name: /Austin/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("deals route filters listings from the sticky browse form", async ({ page }) => {
    await page.goto("/deals");

    await expect(page.getByRole("heading", { name: /Last-minute fun, for less/i })).toBeVisible();
    await expect(page.getByText(/Reviewed partners/i)).toBeVisible();

    const browseForm = page.locator("main form").first();
    await expect(browseForm.getByLabel("City")).toHaveValue("austin");
    await browseForm.getByLabel("When").selectOption("weekend");
    await browseForm.getByRole("button", { name: /Show/i }).click();

    await expect(page).toHaveURL(/\/deals\?/);
    expect(page.url()).toContain("cityId=austin");
    expect(page.url()).toContain("when=weekend");
    await expect(page.getByRole("heading", { name: /Was \/ Now \/ Time \/ Spots/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("login route exposes Google, Apple, email, and guest entry points", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /Save plans and deals/i })).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Apple" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Signup" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();

    await page.getByPlaceholder("Email").fill("smoke@example.com");
    await page.getByPlaceholder("Password").fill("password123");
    await expect(page.getByPlaceholder("Email")).toHaveValue("smoke@example.com");
    await expectNoHorizontalOverflow(page);
  });

  test("partner application form submits through the UI without writing live data", async ({ page }) => {
    let submittedPayload: Record<string, unknown> | null = null;

    await page.route("**/api/partner-application", async (route) => {
      submittedPayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
      await route.fulfill({
        body: JSON.stringify({ ok: true, synced: false }),
        contentType: "application/json",
        status: 201
      });
    });

    await page.goto("/partner/apply");

    await expect(page.getByRole("heading", { name: /Bring your local experience/i })).toBeVisible();
    await page.getByPlaceholder("Business name").fill("E2E Smoke Studio");
    await page.getByPlaceholder("Owner name").fill("Smoke Owner");
    await page.getByPlaceholder("Email").fill("smoke-partner@example.com");
    await page.getByPlaceholder("Phone").fill("555-0100");
    await expect(page.getByLabel("Business city")).toHaveValue("austin");
    await expect(page.getByLabel("Business category")).toHaveValue("date-night");
    await page.getByLabel("Business city").selectOption("miami");
    await expect(page.getByLabel("Business city")).toHaveValue("miami");
    await page.getByPlaceholder("Website").fill("https://example.com");
    await page.getByPlaceholder("Average price").fill("$25");
    await page.getByPlaceholder(/pottery seats tonight/i).fill("A test open-slot workshop for deterministic E2E coverage.");
    await page.getByPlaceholder("Anything else we should know?").fill("Submitted by Playwright smoke coverage.");
    await page.getByLabel(/last-minute deals/i).check();

    await page.getByRole("button", { name: "Apply to List Your Business" }).click();

    await expect(page.getByText(/Application received/i)).toBeVisible();
    expect(submittedPayload).toMatchObject({
      businessName: "E2E Smoke Studio",
      categoryId: "date-night",
      cityId: "miami",
      email: "smoke-partner@example.com",
      offersLastMinuteDeals: true
    });
    await expectNoHorizontalOverflow(page);
  });

  test("pricing route keeps checkout disabled and routes partners to apply", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: /Partner pricing for open-slot deals/i })).toBeVisible();
    await expect(page.getByText(/Payment checkout is intentionally not active yet/i)).toBeVisible();
    await expect(page.getByText(/No consumer checkout or paid partner checkout is enabled/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Apply for free" })).toHaveAttribute("href", "/partner/apply?plan=starter");
    await expectNoHorizontalOverflow(page);
  });

  test("protected surfaces route unauthenticated users to safe sign-in states", async ({ page }) => {
    await page.goto("/profile/settings");
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: /Your deals, plans, and requests/i })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Sign In" }).first()).toBeVisible();

    await page.goto("/partner/dashboard");
    await expect(page.getByRole("heading", { name: /Manage open-slot deals and booking requests/i })).toBeVisible();
    await expect(page.locator('main a[href="/login?next=/partner/dashboard"]').first()).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Review supply before it goes public/i })).toBeVisible();
    await expect(page.locator('main a[href="/login?next=/admin"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
