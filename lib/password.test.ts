import { describe, expect, it } from "vitest";
import { analyzePassword, generatePassword, labelForScore } from "@/lib/password";

describe("labelForScore", () => {
  it("maps scores to strength labels", () => {
    expect(labelForScore(0)).toBe("weak");
    expect(labelForScore(24)).toBe("weak");
    expect(labelForScore(25)).toBe("fair");
    expect(labelForScore(44)).toBe("fair");
    expect(labelForScore(45)).toBe("good");
    expect(labelForScore(65)).toBe("strong");
    expect(labelForScore(85)).toBe("excellent");
  });
});

describe("analyzePassword", () => {
  it("reports an empty password as a zero score", () => {
    const result = analyzePassword("");
    expect(result.score).toBe(0);
    expect(result.length).toBe(0);
    expect(result.crackSeconds).toBe(0);
  });

  it("penalises common passwords", () => {
    const result = analyzePassword("password");
    expect(result.score).toBeLessThanOrEqual(8);
    expect(result.label).toBe("weak");
    expect(result.common).toBe(true);
  });

  it("rewards long, mixed passwords", () => {
    const result = analyzePassword("Correct-Horse-Battery-9!");
    expect(result.score).toBeGreaterThan(70);
    expect(result.checks.find((c) => c.id === "length")?.passed).toBe(true);
  });

  it("flags repeated and sequential characters", () => {
    expect(analyzePassword("aaaaaaaaaaaa1!").suggestions).toContain("passwords.suggestion.repeat");
    expect(analyzePassword("abcdefghijkl1!").suggestions).toContain("passwords.suggestion.sequence");
  });
});

describe("generatePassword", () => {
  const options = {
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  };

  it("respects the requested length", () => {
    expect(generatePassword(options)).toHaveLength(20);
  });

  it("uses every enabled character class", () => {
    const password = generatePassword(options);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
  });

  it("only uses digits when that is the only class", () => {
    const password = generatePassword({
      ...options,
      uppercase: false,
      lowercase: false,
      symbols: false,
    });
    expect(/^[0-9]+$/.test(password)).toBe(true);
  });
});
