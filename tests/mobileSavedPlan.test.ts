import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), write: vi.fn(), paths: [] as string[] }));
vi.mock("../apps/website/src/lib/server/firebase-admin", () => ({
  FieldValue: { serverTimestamp: () => "server-time" },
  verifyBearerToken: mocks.verify,
  getFirebaseAdminDb: () => ({
    collection: (collection: string) => ({ doc: (uid: string) => ({
      collection: (subcollection: string) => ({ doc: (id: string) => ({
        set: async (data: unknown) => {
          mocks.paths.push(`${collection}/${uid}/${subcollection}/${id}`);
          return mocks.write(data);
        }
      }) })
    }) })
  })
}));

import { POST } from "../apps/website/src/app/api/me/saved-plans/route";

const request = (body: unknown) => new Request("https://test/api/me/saved-plans", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.paths.length = 0;
  mocks.verify.mockResolvedValue({ uid: "signed-in-user" });
});

describe("native saved plan snapshots", () => {
  it("saves the exact quoted and multiline plan only under the signed-in user", async () => {
    const plan = { id: "plan-qa", title: 'A "creative" evening', summary: "First stop\nSecond stop", listingIds: ["approved-id"] };
    const response = await POST(request({ planJson: JSON.stringify(plan), userId: "someone-else" }));
    expect(response.status).toBe(201);
    expect(mocks.paths).toEqual(["users/signed-in-user/savedPlans/plan-qa"]);
    expect(mocks.write).toHaveBeenCalledWith({ planId: "plan-qa", planSnapshot: plan, savedAt: "server-time" });
  });

  it("keeps the existing structured web payload working", async () => {
    expect((await POST(request({ plan: { id: "web-plan", title: "A web plan", items: [] } }))).status).toBe(201);
  });

  it.each(["not json", "null", "[]", '"a string"', "x".repeat(80_001)])("rejects invalid native snapshots", async (planJson) => {
    expect((await POST(request({ planJson }))).status).toBe(400);
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it("requires a valid sign-in before saving", async () => {
    mocks.verify.mockResolvedValue(null);
    expect((await POST(request({ plan: { title: "Not authorized", items: [] } }))).status).toBe(401);
    expect(mocks.write).not.toHaveBeenCalled();
  });
});
