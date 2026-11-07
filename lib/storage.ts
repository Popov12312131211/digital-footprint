/**
 * Central registry for localStorage keys plus small safe helpers.
 *
 * Every key the app writes lives here so resets and migrations stay in sync.
 */

export const STORAGE_KEYS = {
  account: "df-account-v1",
  notifications: "df-notifications-v1",
  activity: "df-activity-v1",
  domains: "df-domains-v1",
  audits: "df-audits-v1",
  checklist: "df-checklist-v1",
  passwordHealth: "df-password-health-v1",
  toolsChecklist: "df-tools-checklist-v1",
  pendingReferral: "df-pending-referral",
  locale: "df-locale",
  theme: "df-theme",
} as const;

/** Keys removed by "reset all data". Preferences (locale, theme) are kept. */
export const DATA_STORAGE_KEYS: readonly string[] = [
  STORAGE_KEYS.account,
  STORAGE_KEYS.notifications,
  STORAGE_KEYS.activity,
  STORAGE_KEYS.domains,
  STORAGE_KEYS.audits,
  STORAGE_KEYS.checklist,
  STORAGE_KEYS.passwordHealth,
  STORAGE_KEYS.toolsChecklist,
  STORAGE_KEYS.pendingReferral,
];

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function readRaw(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): boolean {
  try {
    const target = storage();
    if (!target) return false;
    target.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    /* storage may be blocked */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function clearDataStorage(): void {
  for (const key of DATA_STORAGE_KEYS) removeStored(key);
}
