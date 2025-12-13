import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("brands.list", () => {
  it("returns an array of brands", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.brands.list({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("filters brands by pasteurization type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.brands.list({
      pasteurizationType: ["LTLT"],
    });

    expect(Array.isArray(result)).toBe(true);
    // All returned brands should have LTLT pasteurization type
    result.forEach((brand) => {
      expect(brand.pasteurizationType).toBe("LTLT");
    });
  });

  it("filters brands by search term", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.brands.list({
      search: "鮮乳",
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("brands.getFilterOptions", () => {
  it("returns filter options with channels arrays", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.brands.getFilterOptions();

    expect(result).toHaveProperty("physicalChannels");
    expect(result).toHaveProperty("onlineChannels");
    expect(Array.isArray(result.physicalChannels)).toBe(true);
    expect(Array.isArray(result.onlineChannels)).toBe(true);
  });
});

describe("stats.get", () => {
  it("returns statistics object", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stats.get();

    expect(result).toHaveProperty("totalBrands");
    expect(result).toHaveProperty("pendingSubmissions");
    expect(result).toHaveProperty("totalUsers");
    expect(typeof result.totalBrands).toBe("number");
    expect(typeof result.pendingSubmissions).toBe("number");
    expect(typeof result.totalUsers).toBe("number");
  });
});

describe("announcements.getActive", () => {
  it("returns an array of active announcements", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.getActive();

    expect(Array.isArray(result)).toBe(true);
    // All returned announcements should be active
    result.forEach((announcement) => {
      expect(announcement.isActive).toBe(true);
    });
  });
});
