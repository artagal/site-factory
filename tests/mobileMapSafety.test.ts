import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoBusinesses, demoListings } from "../apps/website/src/lib/demoData";

const mocks = vi.hoisted(() => ({ db: vi.fn(), listings: vi.fn() }));
vi.mock("../apps/website/src/lib/server/firebase-admin", () => ({ getFirebaseAdminDb: mocks.db }));
vi.mock("../apps/website/src/lib/server/public-listings", () => ({ getPublicListingsForServer: mocks.listings }));

import { readPublicWorkspace } from "../apps/website/src/lib/server/mobile-workspace-read";

beforeEach(() => { vi.resetAllMocks(); });

describe("mobile map navigation safety", () => {
  it("keeps demo locations visible without linking to nonexistent live deal documents", async () => {
    mocks.db.mockReturnValue(null);
    mocks.listings.mockResolvedValue(demoListings);
    const result = await readPublicWorkspace("map", "", "", "");
    expect(result.rows.length).toBeGreaterThan(0);
    for (const row of result.rows) {
      expect(row.referenceId).toBe("");
      expect(row.status).toBe("Demo / Not bookable");
      expect(row.mapUrl).toMatch(/^https:\/\//);
      expect(row.detail).toContain("Approximate demo location");
    }
  });

  it("retains live detail links only for approved businesses", async () => {
    const listing = { ...demoListings[0], id: "live-listing", isDemo: false };
    const business = { ...demoBusinesses.find(item => item.id === listing.businessId)!, isDemo: false };
    const getAll = vi.fn().mockResolvedValue([{ id: business.id, data: () => business }]);
    mocks.db.mockReturnValue({ collection: () => ({ doc: (id: string) => ({ id }) }), getAll });
    mocks.listings.mockResolvedValue([listing]);
    const result = await readPublicWorkspace("map", "", "", "");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].referenceId).toBe("live-listing");
    expect(result.rows[0].status).toBe("Reviewed partner");
    getAll.mockResolvedValue([{ id: business.id, data: () => ({ ...business, status: "pending" }) }]);
    expect((await readPublicWorkspace("map", "", "", "")).rows).toHaveLength(0);
  });
});
