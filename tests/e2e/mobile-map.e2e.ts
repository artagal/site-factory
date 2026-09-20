import { expect, test } from "@playwright/test";

test("example map renders markers, safe previews and fits mobile", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/maps/deals.html?catalog=examples&cityId=miami");
  await expect(page.locator(".price-pin")).toHaveCount(2);
  await expect(page.locator(".price-pin", { hasText: "2 offers" })).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("example offers. Not bookable.");
  await page.locator(".leaflet-marker-icon").first().click();
  await expect(page.locator(".leaflet-popup-content")).toContainText("Example / not bookable");
  await expect(page.locator(".leaflet-popup-content")).toContainText("Was");
  await expect(page.locator(".leaflet-popup-content")).toContainText("Example:");
  await expect(page.locator(".offer-action")).toHaveCount(0);
  await expect(page.locator(".leaflet-popup")).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("miami-example-map.png") });
  expect(errors).toEqual([]);
});

test("map preview fits the app's 300px canvas", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 358, height: 300 });
  await page.goto("/maps/deals.html?catalog=examples&cityId=miami");
  await page.locator(".leaflet-marker-icon").first().click();
  await expect(page.locator(".leaflet-popup")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("status")).toBeHidden();
  await expect.poll(async () => {
    const bounds = await page.locator(".leaflet-popup").boundingBox();
    return bounds !== null && bounds.y >= 0 && bounds.y + bounds.height <= 300;
  }).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("embedded-map.png") });
  await page.getByRole("button", { name: "Close popup" }).click();
  await expect(page.getByRole("status")).toBeVisible();
});

test("map keeps live and examples separate and shows a usable empty state", async ({ page }) => {
  await page.route("**/api/mobile/discovery?**", (route) => route.fulfill({ json: { cards: [] } }));
  await page.goto("/maps/deals.html?catalog=live");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("No live locations yet");
  await expect(page.locator(".price-pin")).toHaveCount(0);
});

test("map failure offers retry instead of silently disappearing", async ({ page }) => {
  let failed = true;
  await page.route("**/api/mobile/discovery?**", (route) => failed
    ? route.fulfill({ status: 503, json: { error: "Unavailable" } })
    : route.fulfill({ json: { cards: [] } }));
  await page.goto("/maps/deals.html");
  await expect(page.getByRole("button", { name: "Retry map" })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Retry map" }).click();
  await expect(page.getByRole("status")).toContainText("No live locations yet");
  await expect(page.getByRole("button", { name: "Retry map" })).toBeHidden();
});
