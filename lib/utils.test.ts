import { describe, expect, it } from "vitest";
import { addDays, addMonths, addYears, clamp, newId, startOfDay, startOfMonth } from "@/lib/utils";

describe("startOfDay", () => {
  it("uses local calendar parts, not UTC", () => {
    const date = new Date(2026, 0, 5, 23, 30);
    expect(startOfDay(date)).toBe("2026-01-05");
  });

  it("pads month and day", () => {
    expect(startOfDay(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});

describe("startOfMonth", () => {
  it("formats the local year and month", () => {
    expect(startOfMonth(new Date(2026, 0, 31))).toBe("2026-01");
  });

  it("pads the month", () => {
    expect(startOfMonth(new Date(2026, 8, 1))).toBe("2026-09");
  });
});

describe("date math", () => {
  it("adds days across a month boundary", () => {
    const start = new Date(2026, 0, 31).getTime();
    expect(new Date(addDays(start, 1)).getDate()).toBe(1);
  });

  it("adds months", () => {
    const start = new Date(2026, 0, 15).getTime();
    expect(new Date(addMonths(start, 2)).getMonth()).toBe(2);
  });

  it("adds years", () => {
    const start = new Date(2026, 4, 15).getTime();
    expect(new Date(addYears(start, 1)).getFullYear()).toBe(2027);
  });
});

describe("clamp", () => {
  it("clamps to the range", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(42, 0, 100)).toBe(42);
  });
});

describe("newId", () => {
  it("returns non-empty, unique values", () => {
    const a = newId();
    const b = newId();
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
});
