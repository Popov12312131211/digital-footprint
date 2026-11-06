import { clamp } from "@/lib/utils";

export type StrengthLabel = "weak" | "fair" | "good" | "strong" | "excellent";

export interface PasswordCheck {
  id: "length" | "classes" | "pattern" | "common";
  passed: boolean;
}

export interface PasswordAnalysis {
  score: number;
  label: StrengthLabel;
  entropy: number;
  crackSeconds: number;
  length: number;
  classes: number;
  suggestions: string[];
  checks: PasswordCheck[];
  common: boolean;
}

export interface CrackTime {
  key: string;
  count?: number;
}

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345678",
  "password",
  "qwerty",
  "12345",
  "123123",
  "111111",
  "abc123",
  "1234567",
  "iloveyou",
  "000000",
  "qwerty123",
  "1q2w3e4r",
  "aa123456",
  "password1",
  "qwertyuiop",
  "123321",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "letmein",
  "sunshine",
  "princess",
  "football",
  "charlie",
  "azerty",
  "trustno1",
  "passw0rd",
  "master",
  "hello",
  "freedom",
  "whatever",
  "zaq12wsx",
  "superman",
  "baseball",
  "shadow",
  "michael",
  "ninja",
  "mustang",
  "121212",
  "654321",
  "123qwe",
  "1qaz2wsx",
  "qazwsx",
  "password123",
  "qwerty1",
  "987654321",
  "11111111",
  "88888888",
  "66666666",
  "1234567890",
  "q1w2e3r4",
  "1q2w3e",
  "qwerty12",
  "football1",
  "p@ssw0rd",
  "letmein1",
  "admin123",
  "root",
  "toor",
  "test",
  "guest",
  "changeme",
  "secret",
  "loveme",
  "iloveyou1",
  "batman",
  "spiderman",
  "starwars",
  "samsung",
  "google",
  "instagram",
  "facebook",
  "linkedin",
  "telegram",
  "yandex",
  "vkontakte",
  "privet",
  "parol",
  "qwerty12345",
  "123456a",
  "q1w2e3r4t5",
  "1q2w3e4r5t",
  "zxcvbnm",
  "asdfghjkl",
  "qazwsxedc",
  "0987654321",
  "12341234",
  "11223344",
  "qwertyqwerty",
  "passwordpassword",
  "aaaaaaaa",
  "aaaaaaaaaa",
  "12345678910",
  "123456789a",
  "a123456789",
  "P@ssw0rd!",
]);

const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|", "`", "'", '"', ";", ":"]);

function classCount(password: string): number {
  let classes = 0;
  if (/[a-z]/.test(password)) classes += 1;
  if (/[A-Z]/.test(password)) classes += 1;
  if (/[0-9]/.test(password)) classes += 1;
  if (/[^A-Za-z0-9]/.test(password)) classes += 1;
  return classes;
}

function poolSize(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += SYMBOLS.length + 10;
  return pool;
}

function hasRepeat(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

function hasSequence(password: string): boolean {
  const normalized = password.toLowerCase();
  const sequences = [
    "012",
    "123",
    "234",
    "345",
    "456",
    "567",
    "678",
    "789",
    "890",
    "abc",
    "bcd",
    "cde",
    "def",
    "efg",
    "fgh",
    "ghi",
    "hij",
    "ijk",
    "jkl",
    "klm",
    "lmn",
    "mno",
    "nop",
    "opq",
    "pqr",
    "qrs",
    "rst",
    "stu",
    "tuv",
    "uvw",
    "vwx",
    "wxy",
    "xyz",
    "qwe",
    "wer",
    "ert",
    "rty",
    "tyu",
    "yui",
    "uio",
    "iop",
    "asd",
    "sdf",
    "dfg",
    "fgh",
    "ghj",
    "hjk",
    "jkl",
    "zxc",
    "xcv",
    "cvb",
    "vbn",
    "bnm",
  ];
  return sequences.some((sequence) => normalized.includes(sequence));
}

function isCommon(password: string): boolean {
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return true;
  for (const common of COMMON_PASSWORDS) {
    if (common.length >= 4 && lower.includes(common)) return true;
  }
  return false;
}

export function labelForScore(score: number): StrengthLabel {
  if (score < 25) return "weak";
  if (score < 45) return "fair";
  if (score < 65) return "good";
  if (score < 85) return "strong";
  return "excellent";
}

export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;
  const classes = classCount(password);
  const pool = poolSize(password);
  const common = length > 0 && isCommon(password);
  const repeat = hasRepeat(password);
  const sequence = hasSequence(password);
  const onlyDigits = /^[0-9]+$/.test(password);

  let entropy = length > 0 && pool > 0 ? length * Math.log2(pool) : 0;
  if (common) entropy = Math.min(entropy, 14);

  const suggestions: string[] = [];
  if (length === 0) {
    suggestions.push("passwords.suggestion.length");
  } else {
    if (length < 12) suggestions.push("passwords.suggestion.length");
    if (!/[a-z]/.test(password)) suggestions.push("passwords.suggestion.lower");
    if (!/[A-Z]/.test(password)) suggestions.push("passwords.suggestion.upper");
    if (!/[0-9]/.test(password)) suggestions.push("passwords.suggestion.number");
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("passwords.suggestion.symbol");
    if (common) suggestions.push("passwords.suggestion.common");
    if (repeat) suggestions.push("passwords.suggestion.repeat");
    if (sequence) suggestions.push("passwords.suggestion.sequence");
    if (suggestions.length === 0 && length < 16) suggestions.push("passwords.suggestion.passphrase");
  }

  let penalty = 0;
  if (common) penalty += 65;
  if (repeat) penalty += 15;
  if (sequence) penalty += 15;
  if (onlyDigits) penalty += 20;
  if (length > 0 && length < 8) penalty += 20;

  let score = clamp(Math.round((entropy / 80) * 100) - penalty, 0, 100);
  if (common) score = Math.min(score, 8);
  if (length === 0) score = 0;
  if (length > 0 && length < 6) score = Math.min(score, 20);

  const checks: PasswordCheck[] = [
    { id: "length", passed: length >= 12 },
    { id: "classes", passed: classes >= 3 },
    { id: "pattern", passed: !repeat && !sequence },
    { id: "common", passed: !common },
  ];

  return {
    score,
    label: labelForScore(score),
    entropy: Math.round(entropy),
    crackSeconds: entropy > 0 ? Math.pow(2, entropy) / 1e10 : 0,
    length,
    classes,
    suggestions: suggestions.slice(0, 4),
    checks,
    common,
  };
}

export function crackTime(seconds: number): CrackTime {
  if (!Number.isFinite(seconds) || seconds < 1) return { key: "passwords.crack.instant" };
  if (seconds < 60) return { key: "passwords.crack.seconds", count: Math.round(seconds) };
  if (seconds < 3600) return { key: "passwords.crack.minutes", count: Math.round(seconds / 60) };
  if (seconds < 86400) return { key: "passwords.crack.hours", count: Math.round(seconds / 3600) };
  if (seconds < 2_592_000) return { key: "passwords.crack.days", count: Math.round(seconds / 86400) };
  if (seconds < 31_536_000) {
    return { key: "passwords.crack.months", count: Math.round(seconds / 2_592_000) };
  }
  if (seconds < 3_153_600_000) {
    return { key: "passwords.crack.years", count: Math.round(seconds / 31_536_000) };
  }
  return { key: "passwords.crack.centuries" };
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha1Hex(value: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("crypto-unavailable");
  }
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return toHex(digest).toUpperCase();
}

export function hashPrefix(value: string): string {
  return value.slice(0, 5);
}

export interface BreachResult {
  breached: boolean;
  count: number;
}

export async function checkPasswordBreach(password: string): Promise<BreachResult> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const response = await fetch(`/api/leaks?prefix=${prefix}`, { cache: "no-store" });
  if (!response.ok) throw new Error("breach-service-unavailable");
  const text = await response.text();
  let count = 0;
  for (const line of text.split("\n")) {
    const [candidate, value] = line.trim().split(":");
    if (candidate && candidate.toUpperCase() === suffix) {
      count = Number(value) || 0;
      break;
    }
  }
  return { breached: count > 0, count };
}

function randomInt(max: number): number {
  if (max <= 0) return 0;
  const values = new Uint32Array(1);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const limit = Math.floor(0xffffffff / max) * max;
    let value = 0;
    do {
      crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generatePassword(options: GeneratorOptions): string {
  const pools: string[] = [];
  if (options.lowercase) pools.push("abcdefghijklmnopqrstuvwxyz");
  if (options.uppercase) pools.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.numbers) pools.push("0123456789");
  if (options.symbols) pools.push(SYMBOLS);
  if (pools.length === 0) pools.push("abcdefghijklmnopqrstuvwxyz");

  const clean = (pool: string) =>
    options.excludeAmbiguous
      ? Array.from(pool)
          .filter((char) => !AMBIGUOUS.has(char))
          .join("")
      : pool;

  const usable = pools.map(clean).filter(Boolean);
  const length = clamp(Math.round(options.length), 8, 64);
  const chars: string[] = [];

  for (const pool of usable) {
    if (chars.length < length) chars.push(pool[randomInt(pool.length)]);
  }

  const all = usable.join("");
  while (chars.length < length) chars.push(all[randomInt(all.length)]);

  return shuffle(chars).join("");
}
