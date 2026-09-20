import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium, expect } from "@playwright/test";

const root = resolve("gofunmotion-ffai/generated_code/build/web");
const output = resolve("output/qa/native-discovery");
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".wasm": "application/wasm", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = resolve(root, `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`);
  if (path !== root && !path.startsWith(`${root}${sep}`)) { res.writeHead(403).end(); return; }
  try {
    const file = extname(path) ? path : resolve(root, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await mkdir(output, { recursive: true });
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.stack || error.message));
try {
  await page.goto(`${base}/example-activities`);
  await page.locator("flt-semantics-placeholder").waitFor({ state: "attached", timeout: 60_000 });
  await page.locator("flt-semantics-placeholder").evaluate((element) => element.click());
  await expect(page.getByRole("img", { name: /Pottery Date Night - Tonight/ })).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: resolve(output, "examples-390.png") });
  await page.getByRole("button", { name: "View example" }).first().click();
  await expect(page.getByRole("heading", { name: "Example activity", exact: true })).toBeVisible();
  await expect.poll(() => page.locator("body").ariaSnapshot()).toContain("Pottery Date Night - Tonight");
  await page.screenshot({ path: resolve(output, "detail-390.png") });
  await page.goto(`${base}/deals-map`);
  await page.locator("flt-semantics-placeholder").waitFor({ state: "attached", timeout: 60_000 });
  await page.locator("flt-semantics-placeholder").evaluate((element) => element.click());
  await expect(page.getByRole("button", { name: "Examples", exact: true })).toBeEnabled({ timeout: 60_000 });
  await page.getByRole("button", { name: "Examples", exact: true }).click({ timeout: 60_000 });
  await expect.poll(() => page.locator("body").ariaSnapshot(), { timeout: 60_000 }).toContain("Pottery Date Night - Tonight");
  await expect(page.frameLocator('iframe[src*="/maps/deals.html"]').locator(".price-pin").first()).toBeVisible();
  await expect.poll(() => page.frameLocator('iframe[src*="/maps/deals.html"]').locator(".leaflet-marker-icon").evaluateAll((nodes) => nodes.length === 10 && nodes.every((node) => {
    const box = node.getBoundingClientRect();
    return box.left >= 0 && box.right <= window.innerWidth && box.top >= 0 && box.bottom <= window.innerHeight;
  })), { timeout: 15_000 }).toBe(true);
  await page.screenshot({ path: resolve(output, "map-390.png") });
  await page.getByRole("button", { name: "All cities", exact: true }).click();
  await page.getByRole("button", { name: "Austin", exact: true }).click();
  await expect.poll(() => page.locator("body").ariaSnapshot(), { timeout: 60_000 }).toContain("Escape Room - 8:00 PM Slot");
  await expect(page.frameLocator('iframe[src*="cityId=austin"]').locator(".price-pin")).toHaveCount(2);
  await page.screenshot({ path: resolve(output, "map-austin-390.png") });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${base}/example-activities`);
  await page.locator("flt-semantics-placeholder").waitFor({ state: "attached", timeout: 60_000 });
  await page.locator("flt-semantics-placeholder").evaluate((element) => element.click());
  await expect(page.getByRole("img", { name: /Pottery Date Night - Tonight/ })).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: resolve(output, "examples-dark-390.png") });
  console.log(JSON.stringify({ visualChecksPassed: true, screenshots: output, pageErrors: errors }));
  if (errors.length) process.exitCode = 1;
} catch (error) {
  await page.screenshot({ path: resolve(output, "failure.png") });
  console.error(await page.locator("body").ariaSnapshot());
  console.error(JSON.stringify({ passed: false, error: String(error), pageErrors: errors }));
  process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
