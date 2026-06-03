import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3102);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const channelUse = browserChannel ? { channel: browserChannel } : {};

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `${npmCommand} --workspace @site-factory/website run dev -- -p ${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        url: baseURL
      },
  projects: [
    {
      name: browserChannel ? `desktop-${browserChannel}` : "desktop-chromium",
      use: {
        ...channelUse,
        browserName: "chromium",
        viewport: { height: 900, width: 1440 }
      }
    },
    {
      name: browserChannel ? `mobile-${browserChannel}` : "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        ...channelUse,
        browserName: "chromium"
      }
    }
  ]
});
