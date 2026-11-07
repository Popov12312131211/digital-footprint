import { describe, expect, it } from "vitest";
import {
  CHECKLIST,
  evaluate,
  labelFor,
  recommendations,
  summarize,
  totalIssues,
  type ChecklistAnswers,
  type Snapshot,
} from "@/lib/audit";

function snapshot(overrides: Partial<Snapshot["network"]> = {}): Snapshot {
  return {
    collectedAt: 1,
    device: {
      browser: "Test",
      browserVersion: "1.0",
      os: "TestOS",
      screen: "1920 × 1080",
      viewport: "1200 × 800",
      pixelRatio: 1,
      language: "en",
      languages: ["en"],
      timezone: "UTC",
      utcOffset: "UTC+00:00",
      cores: 4,
      memoryGb: 8,
      touchPoints: 0,
      prefersDark: false,
      prefersReducedMotion: false,
    },
    privacy: {
      cookiesEnabled: true,
      localStorage: true,
      sessionStorage: true,
      webrtc: false,
      doNotTrack: null,
      globalPrivacyControl: true,
    },
    network: {
      protocol: "https",
      host: "example.com",
      https: true,
      secureContext: true,
      online: true,
      effectiveType: "4g",
      downlinkMbps: 10,
      rttMs: 50,
      saveData: false,
      publicIp: null,
      ipRegion: null,
      ...overrides,
    },
  };
}

function allAnswers(value: boolean): ChecklistAnswers {
  return Object.fromEntries(CHECKLIST.map((item) => [item.id, value]));
}

describe("evaluate", () => {
  it("gives a perfect score when every check passes", () => {
    const result = evaluate(snapshot(), allAnswers(true));
    expect(result.score).toBe(100);
    expect(result.coverage).toBe(1);
    expect(result.label).toBe("Strong");
    expect(totalIssues(result.counts)).toBe(0);
  });

  it("scores at the floor when no weighted check passes", () => {
    const result = evaluate(
      { ...snapshot({ https: false }), privacy: { ...snapshot().privacy, webrtc: true, globalPrivacyControl: false } },
      allAnswers(false),
    );
    expect(result.score).toBe(4);
    expect(result.coverage).toBe(1);
    expect(result.label).toBe("At risk");
    expect(result.checks.every((c) => c.weight === 0 || c.status !== "pass")).toBe(true);
    expect(result.counts.critical).toBe(1);
  });

  it("treats unanswered checklist items as unknown and lowers coverage", () => {
    const result = evaluate(snapshot(), {});
    expect(result.coverage).toBeLessThan(1);
    const unknown = result.checks.filter((c) => c.status === "unknown");
    expect(unknown).toHaveLength(CHECKLIST.length);
    expect(unknown.every((c) => c.severity === undefined)).toBe(true);
  });

  it("fails the https check on an insecure remote host", () => {
    const result = evaluate(snapshot({ https: false }), allAnswers(true));
    const https = result.checks.find((c) => c.id === "https");
    expect(https?.status).toBe("fail");
    expect(https?.recommendation).toBeTruthy();
    expect(result.score).toBeLessThan(100);
  });

  it("treats localhost as secure", () => {
    const result = evaluate(snapshot({ host: "localhost:3000", https: true }), allAnswers(true));
    expect(result.checks.find((c) => c.id === "https")?.status).toBe("pass");
  });
});

describe("labelFor", () => {
  it("maps scores to labels at the boundaries", () => {
    expect(labelFor(100)).toBe("Strong");
    expect(labelFor(85)).toBe("Strong");
    expect(labelFor(84)).toBe("Good");
    expect(labelFor(70)).toBe("Good");
    expect(labelFor(69)).toBe("Needs attention");
    expect(labelFor(50)).toBe("Needs attention");
    expect(labelFor(49)).toBe("At risk");
  });
});

describe("summarize", () => {
  it("keeps the fields used by the history list", () => {
    const result = evaluate(snapshot(), allAnswers(true));
    const summary = summarize(result);
    expect(summary).toEqual({
      id: result.id,
      timestamp: result.timestamp,
      score: result.score,
      coverage: result.coverage,
      counts: result.counts,
    });
  });
});

describe("recommendations", () => {
  it("sorts by severity, most urgent first", () => {
    const result = evaluate(snapshot({ https: false }), allAnswers(false));
    const recs = recommendations(result);
    expect(recs.length).toBeGreaterThan(1);
    expect(recs[0].severity).toBe("critical");
  });
});
