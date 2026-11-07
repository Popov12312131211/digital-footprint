/**
 * Audit engine.
 *
 * Principle: everything shown as a finding is either read directly from the
 * browser or answered by the person themselves. Nothing is simulated, and
 * anything the browser cannot know is reported as "unknown", never guessed.
 */

import { translate, type Locale } from "@/lib/i18n-core";

export type Severity = "critical" | "high" | "medium" | "low";
export type CheckStatus = "pass" | "warn" | "fail" | "info" | "unknown";

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Present only when the check can lower the score */
  severity?: Severity;
  weight: number;
  recommendation?: string;
  source: "browser" | "self-reported";
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  screen: string;
  viewport: string;
  pixelRatio: number;
  language: string;
  languages: string[];
  timezone: string;
  utcOffset: string;
  cores: number | null;
  memoryGb: number | null;
  touchPoints: number;
  prefersDark: boolean;
  prefersReducedMotion: boolean;
}

export interface PrivacyInfo {
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  webrtc: boolean;
  doNotTrack: string | null;
  globalPrivacyControl: boolean | null;
}

export interface NetworkInfo {
  protocol: string;
  host: string;
  https: boolean;
  secureContext: boolean;
  online: boolean;
  /** Network Information API (Chromium only) */
  effectiveType: string | null;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean | null;
  /** From /api/network; null when unavailable (e.g. localhost) */
  publicIp: string | null;
  ipRegion: string | null;
}

export interface Snapshot {
  collectedAt: number;
  device: DeviceInfo;
  privacy: PrivacyInfo;
  network: NetworkInfo;
}

export interface AuditResult {
  id: string;
  timestamp: number;
  score: number;
  /** Share of weighted checks that could be evaluated, 0–1 */
  coverage: number;
  label: ScoreLabel;
  checks: Check[];
  counts: Record<Severity, number>;
  snapshot: Snapshot;
}

export interface AuditSummary {
  id: string;
  timestamp: number;
  score: number;
  coverage: number;
  counts: Record<Severity, number>;
}

export type ScoreLabel = "Strong" | "Good" | "Needs attention" | "At risk";

/* ------------------------------------------------------------------ */
/* Self-reported checklist                                             */
/* ------------------------------------------------------------------ */

export type ChecklistGroup = "two-factor" | "passwords" | "accounts";

export interface ChecklistItem {
  id: string;
  group: ChecklistGroup;
  severity: Severity;
  weight: number;
}

export const CHECKLIST: ChecklistItem[] = [
  { id: "2fa-email", group: "two-factor", severity: "critical", weight: 5 },
  { id: "2fa-other", group: "two-factor", severity: "high", weight: 4 },
  { id: "unique-passwords", group: "passwords", severity: "high", weight: 4 },
  { id: "password-manager", group: "passwords", severity: "medium", weight: 2 },
  { id: "recovery-current", group: "accounts", severity: "low", weight: 1 },
  { id: "app-permissions", group: "accounts", severity: "medium", weight: 2 },
  { id: "auto-updates", group: "accounts", severity: "low", weight: 1 },
];

/* ------------------------------------------------------------------ */
/* Collectors (browser only)                                           */
/* ------------------------------------------------------------------ */

interface NavigatorUAData {
  brands?: { brand: string; version: string }[];
  platform?: string;
}

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

type NavigatorExtra = Navigator & {
  userAgentData?: NavigatorUAData;
  connection?: NetworkInformationLike;
  deviceMemory?: number;
  globalPrivacyControl?: boolean;
};

function parseBrowser(nav: NavigatorExtra): { name: string; version: string } {
  const ua = nav.userAgent;
  const rules: [string, RegExp][] = [
    ["Edge", /Edg\/([\d.]+)/],
    ["Opera", /OPR\/([\d.]+)/],
    ["Firefox", /Firefox\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ];
  for (const [name, re] of rules) {
    const m = ua.match(re);
    if (m) return { name, version: m[1].split(".").slice(0, 2).join(".") };
  }
  return { name: "Unknown browser", version: "" };
}

function parseOS(nav: NavigatorExtra): string {
  const ua = nav.userAgent;
  if (/Windows NT 10/.test(ua)) return "Windows";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return nav.userAgentData?.platform || "Unknown";
}

function utcOffset(): string {
  const m = -new Date().getTimezoneOffset();
  const sign = m >= 0 ? "+" : "−";
  const h = Math.floor(Math.abs(m) / 60);
  const min = Math.abs(m) % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function storageWorks(kind: "localStorage" | "sessionStorage"): boolean {
  try {
    const s = window[kind];
    const k = "__df_probe__";
    s.setItem(k, "1");
    s.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

async function fetchServerNetwork(): Promise<{ ip: string | null; region: string | null }> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("/api/network", { cache: "no-store", signal: ctrl.signal });
    window.clearTimeout(timer);
    if (!res.ok) return { ip: null, region: null };
    const data = (await res.json()) as { ip?: string | null; region?: string | null };
    return { ip: data.ip ?? null, region: data.region ?? null };
  } catch {
    return { ip: null, region: null };
  }
}

export async function collectSnapshot(): Promise<Snapshot> {
  const nav = navigator as NavigatorExtra;
  const { name, version } = parseBrowser(nav);
  const conn = nav.connection;
  const server = await fetchServerNetwork();

  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

  return {
    collectedAt: Date.now(),
    device: {
      browser: name,
      browserVersion: version,
      os: parseOS(nav),
      screen: `${screen.width} × ${screen.height}`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      language: nav.language,
      languages: [...(nav.languages ?? [nav.language])],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
      utcOffset: utcOffset(),
      cores: nav.hardwareConcurrency || null,
      memoryGb: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
      touchPoints: nav.maxTouchPoints || 0,
      prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    },
    privacy: {
      cookiesEnabled: nav.cookieEnabled,
      localStorage: storageWorks("localStorage"),
      sessionStorage: storageWorks("sessionStorage"),
      webrtc: typeof window.RTCPeerConnection === "function",
      doNotTrack: nav.doNotTrack ?? null,
      globalPrivacyControl:
        typeof nav.globalPrivacyControl === "boolean" ? nav.globalPrivacyControl : null,
    },
    network: {
      protocol: location.protocol.replace(":", ""),
      host: location.host,
      https: location.protocol === "https:" || isLocal,
      secureContext: window.isSecureContext,
      online: nav.onLine,
      effectiveType: conn?.effectiveType ?? null,
      downlinkMbps: typeof conn?.downlink === "number" ? conn.downlink : null,
      rttMs: typeof conn?.rtt === "number" ? conn.rtt : null,
      saveData: typeof conn?.saveData === "boolean" ? conn.saveData : null,
      publicIp: server.ip,
      ipRegion: server.region,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

export type ChecklistAnswers = Record<string, boolean>;

export function evaluate(
  snapshot: Snapshot,
  answers: ChecklistAnswers,
  locale: Locale = "ru",
): AuditResult {
  const { network, privacy } = snapshot;
  const isLocal = network.host.startsWith("localhost") || network.host.startsWith("127.");
  const checks: Check[] = [];
  const t = (key: string) => translate(locale, key);

  // --- Read directly from the browser ---------------------------------
  checks.push({
    id: "https",
    label: t("check.https.label"),
    status: network.https ? "pass" : "fail",
    severity: network.https ? undefined : "high",
    weight: 4,
    source: "browser",
    detail: network.https
      ? isLocal
        ? t("check.https.detailLocal")
        : t("check.https.detailSecure")
      : t("check.https.detailInsecure"),
    recommendation: network.https ? undefined : t("check.https.rec"),
  });

  checks.push({
    id: "webrtc",
    label: t("check.webrtc.label"),
    status: privacy.webrtc ? "warn" : "pass",
    severity: privacy.webrtc ? "low" : undefined,
    weight: 1,
    source: "browser",
    detail: privacy.webrtc ? t("check.webrtc.detailAvailable") : t("check.webrtc.detailUnavailable"),
    recommendation: privacy.webrtc ? t("check.webrtc.rec") : undefined,
  });

  const gpc = privacy.globalPrivacyControl;
  checks.push({
    id: "gpc",
    label: t("check.gpc.label"),
    status: gpc === true ? "pass" : "warn",
    severity: gpc === true ? undefined : "low",
    weight: 1,
    source: "browser",
    detail: gpc === true ? t("check.gpc.detailOn") : t("check.gpc.detailOff"),
    recommendation: gpc === true ? undefined : t("check.gpc.rec"),
  });

  checks.push({
    id: "cookies",
    label: t("check.cookies.label"),
    status: "info",
    weight: 0,
    source: "browser",
    detail: privacy.cookiesEnabled ? t("check.cookies.detailOn") : t("check.cookies.detailOff"),
  });

  checks.push({
    id: "storage",
    label: t("check.storage.label"),
    status: "info",
    weight: 0,
    source: "browser",
    detail: privacy.localStorage ? t("check.storage.detailOn") : t("check.storage.detailOff"),
  });

  checks.push({
    id: "dnt",
    label: t("check.dnt.label"),
    status: "info",
    weight: 0,
    source: "browser",
    detail: privacy.doNotTrack === "1" ? t("check.dnt.detailOn") : t("check.dnt.detailOff"),
  });

  // --- Answered by the person ----------------------------------------
  for (const item of CHECKLIST) {
    const a = answers[item.id];
    checks.push({
      id: item.id,
      label: t(`checklistItem.${item.id}.label`),
      status: a === true ? "pass" : a === false ? "fail" : "unknown",
      severity: a === false ? item.severity : undefined,
      weight: item.weight,
      source: "self-reported",
      detail: a === undefined ? t("check.unanswered") : t(`checklistItem.${item.id}.hint`),
      recommendation: a === false ? t(`checklistItem.${item.id}.rec`) : undefined,
    });
  }

  // --- Score: weighted, over evaluated checks only ---------------------
  const credit = { pass: 1, warn: 0.5, fail: 0 } as const;
  let earned = 0;
  let possible = 0;
  let totalWeight = 0;
  for (const c of checks) {
    if (c.weight <= 0) continue;
    totalWeight += c.weight;
    if (c.status === "pass" || c.status === "warn" || c.status === "fail") {
      possible += c.weight;
      earned += c.weight * credit[c.status];
    }
  }
  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const coverage = totalWeight === 0 ? 0 : possible / totalWeight;

  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const c of checks) {
    if ((c.status === "fail" || c.status === "warn") && c.severity) counts[c.severity] += 1;
  }

  return {
    id: newId(),
    timestamp: Date.now(),
    score,
    coverage,
    label: labelFor(score),
    checks,
    counts,
    snapshot,
  };
}

/** crypto.randomUUID exists only in secure contexts, so fall back on plain HTTP. */
function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function labelFor(score: number): ScoreLabel {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs attention";
  return "At risk";
}

export function summarize(r: AuditResult): AuditSummary {
  return {
    id: r.id,
    timestamp: r.timestamp,
    score: r.score,
    coverage: r.coverage,
    counts: r.counts,
  };
}

export function totalIssues(counts: Record<Severity, number>) {
  return SEVERITIES.reduce((n, s) => n + counts[s], 0);
}

export function recommendations(result: AuditResult): Check[] {
  const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return result.checks
    .filter((c) => c.recommendation && c.severity)
    .sort((a, b) => rank[a.severity!] - rank[b.severity!]);
}
