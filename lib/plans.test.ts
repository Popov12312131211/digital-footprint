import { describe, expect, it } from "vitest";
import { FEATURE_ORDER, PLAN_ORDER, PLANS, formatRub, hasFeature, planOf } from "@/lib/plans";

describe("planOf", () => {
  it("returns the known plan", () => {
    expect(planOf("premium").id).toBe("premium");
    expect(planOf("premium-plus").id).toBe("premium-plus");
  });

  it("falls back to free for unknown values", () => {
    expect(planOf(null).id).toBe("free");
    expect(planOf("enterprise").id).toBe("free");
    expect(planOf(undefined).id).toBe("free");
  });
});

describe("hasFeature", () => {
  it("keeps free features free", () => {
    expect(hasFeature("free", "securityScore")).toBe(true);
    expect(hasFeature("free", "passwordChecker")).toBe(true);
    expect(hasFeature("free", "domainMonitoring")).toBe(false);
  });

  it("unlocks features only on the right tier", () => {
    expect(hasFeature("premium", "breachCheck")).toBe(true);
    expect(hasFeature("premium", "extendedReports")).toBe(false);
    expect(hasFeature("premium-plus", "extendedReports")).toBe(true);
  });

  it("treats premium-plus as a superset of premium and free", () => {
    for (const feature of PLANS.premium.features) {
      expect(hasFeature("premium-plus", feature)).toBe(true);
    }
    for (const feature of PLANS.free.features) {
      expect(hasFeature("premium", feature)).toBe(true);
    }
  });
});

describe("plan metadata", () => {
  it("covers every plan and feature in the ordered lists", () => {
    expect(PLAN_ORDER).toEqual(["free", "premium", "premium-plus"]);
    for (const id of PLAN_ORDER) {
      expect(PLANS[id].id).toBe(id);
    }
    expect(new Set(FEATURE_ORDER).size).toBe(FEATURE_ORDER.length);
  });

  it("prices grow with the tier", () => {
    expect(PLANS.free.price.monthly).toBe(0);
    expect(PLANS.premium.price.monthly).toBeGreaterThan(PLANS.free.price.monthly);
    expect(PLANS["premium-plus"].price.monthly).toBeGreaterThan(PLANS.premium.price.monthly);
  });
});

describe("formatRub", () => {
  it("formats rubles without decimals", () => {
    expect(formatRub(490, "ru")).toContain("490");
    expect(formatRub(490, "ru")).not.toContain(",");
    expect(formatRub(0, "en")).toContain("0");
  });
});
