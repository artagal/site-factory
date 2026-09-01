import { afterEach, describe, expect, it } from "vitest";
import { isDemoDataEnabled } from "../apps/website/src/lib/demo-mode";

const originalDemoFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA;

afterEach(() => {
  if (originalDemoFlag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA;
  else process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA = originalDemoFlag;
});

describe("demo catalog policy", () => {
  it("keeps the clearly labeled fallback visible when no override is configured", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA;
    expect(isDemoDataEnabled()).toBe(true);
  });

  it("supports an explicit production off switch", () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA = "false";
    expect(isDemoDataEnabled()).toBe(false);
  });
});
