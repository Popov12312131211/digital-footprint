"use client";

import * as React from "react";
import {
  PLANS,
  hasFeature,
  planOf,
  type FeatureKey,
  type Interval,
  type PlanDefinition,
  type PlanId,
  type PlanLimits,
} from "@/lib/plans";
import { useNotifications } from "@/lib/notifications";
import { useActivity } from "@/lib/activity";
import {
  addDays,
  addMonths,
  addYears,
  newId,
  startOfDay,
  startOfMonth,
} from "@/lib/utils";
import {
  STORAGE_KEYS,
  clearDataStorage,
  readJson,
  readRaw,
  removeStored,
  writeJson,
} from "@/lib/storage";

export interface Profile {
  name: string;
  email: string;
  createdAt: number;
}

export interface Subscription {
  plan: Exclude<PlanId, "free">;
  interval: Interval;
  status: "active" | "canceled";
  startedAt: number;
  renewsAt: number;
}

export interface Invoice {
  id: string;
  plan: PlanId;
  interval: Interval;
  amount: number;
  createdAt: number;
  status: "paid";
}

export interface ReferralState {
  code: string;
  invited: number;
  credits: number;
  referredBy: string | null;
  applied: string[];
}

export interface UsageState {
  day: string;
  month: string;
  breachChecks: number;
  reports: number;
}

interface StoredAccount {
  signedIn: boolean;
  profile: Profile;
  salt: string;
  passwordHash: string;
  subscription: Subscription | null;
  invoices: Invoice[];
  referral: ReferralState;
  usage: UsageState;
}

export type SubscriptionStatus = "active" | "canceled" | "expired" | "none";

interface AuthResult {
  ok: boolean;
  error?:
    | "invalidEmail"
    | "weakPassword"
    | "emailTaken"
    | "accountExists"
    | "invalidCredentials";
}

interface ReferralResult {
  ok: boolean;
  error?: "invalid" | "self" | "already" | "notSignedIn";
  credits?: number;
  days?: number;
}

interface AccountContextValue {
  ready: boolean;
  profile: Profile | null;
  isAuthenticated: boolean;
  plan: PlanId;
  planDef: PlanDefinition;
  limits: PlanLimits;
  subscription: Subscription | null;
  subscriptionStatus: SubscriptionStatus;
  invoices: Invoice[];
  referral: ReferralState | null;
  usage: UsageState | null;
  signUp: (email: string, name: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (name: string) => void;
  subscribe: (plan: Exclude<PlanId, "free">, interval: Interval) => void;
  cancelSubscription: () => void;
  resumeSubscription: () => void;
  canUse: (feature: FeatureKey) => boolean;
  recordBreachCheck: () => void;
  recordReport: () => boolean;
  applyReferralCode: (code: string) => ReferralResult;
  resetAll: () => void;
}

const STORAGE_KEY = STORAGE_KEYS.account;
const DAY_MS = 24 * 60 * 60 * 1000;

const AccountContext = React.createContext<AccountContextValue | null>(null);

function emptyUsage(): UsageState {
  return {
    day: startOfDay(),
    month: startOfMonth(),
    breachChecks: 0,
    reports: 0,
  };
}

function readStored(): StoredAccount | null {
  const parsed = readJson<StoredAccount | null>(STORAGE_KEY, null);
  if (!parsed?.profile?.email || !parsed.passwordHash) return null;
  return parsed;
}

function writeStored(value: StoredAccount | null) {
  if (value) writeJson(STORAGE_KEY, value);
  else removeStored(STORAGE_KEY);
}

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `DF-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function derivePassword(password: string, salt: string): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const enc = new TextEncoder();
      const material = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: enc.encode(salt),
          iterations: 120_000,
          hash: "SHA-256",
        },
        material,
        256,
      );
      return `pbkdf2:${toHex(bits)}`;
    }
  } catch {
    /* fall through to the non-crypto fallback */
  }
  let h = 2166136261;
  const value = `${salt}:${password}`;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fallback:${(h >>> 0).toString(16)}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function addInterval(ts: number, interval: Interval): number {
  return interval === "monthly" ? addMonths(ts, 1) : addYears(ts, 1);
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { push } = useNotifications();
  const { add: addActivity } = useActivity();
  const [state, setState] = React.useState<StoredAccount | null>(null);
  const [ready, setReady] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    setState(readStored());
    setReady(true);
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const commit = React.useCallback((next: StoredAccount | null) => {
    setState(next);
    setNow(Date.now());
    writeStored(next);
  }, []);

  const isAuthenticated = Boolean(state?.signedIn && state.profile);

  const subscription = isAuthenticated ? state?.subscription ?? null : null;
  const subscriptionStatus: SubscriptionStatus = !subscription
    ? "none"
    : subscription.renewsAt <= now
      ? "expired"
      : subscription.status;
  const plan: PlanId =
    subscription && subscription.renewsAt > now ? subscription.plan : "free";
  const planDef = planOf(plan);

  const normalizedUsage = React.useMemo<UsageState | null>(() => {
    if (!state) return null;
    const today = startOfDay();
    const month = startOfMonth();
    if (state.usage.day === today && state.usage.month === month) return state.usage;
    return {
      ...state.usage,
      day: today,
      month,
      breachChecks: state.usage.day === today ? state.usage.breachChecks : 0,
      reports: state.usage.month === month ? state.usage.reports : 0,
    };
  }, [state]);

  const signUp = React.useCallback(
    async (email: string, name: string, password: string): Promise<AuthResult> => {
      const cleanEmail = normalizeEmail(email);
      if (!validEmail(cleanEmail)) return { ok: false, error: "invalidEmail" };
      if (password.length < 8) return { ok: false, error: "weakPassword" };
      if (state?.profile) {
        return {
          ok: false,
          error: state.profile.email === cleanEmail ? "emailTaken" : "accountExists",
        };
      }
      const salt = randomSalt();
      const passwordHash = await derivePassword(password, salt);
      const next: StoredAccount = {
        signedIn: true,
        profile: {
          name: name.trim() || cleanEmail.split("@")[0],
          email: cleanEmail,
          createdAt: Date.now(),
        },
        salt,
        passwordHash,
        subscription: null,
        invoices: [],
        referral: {
          code: randomCode(),
          invited: 0,
          credits: 0,
          referredBy: null,
          applied: [],
        },
        usage: emptyUsage(),
      };
      commit(next);
      push({
        kind: "system",
        titleKey: "notification.welcome.title",
        descKey: "notification.welcome.desc",
        href: "/audit",
      });
      addActivity({
        kind: "account",
        titleKey: "notification.welcome.title",
        descKey: "notification.welcome.desc",
        href: "/audit",
      });
      return { ok: true };
    },
    [state, commit, push, addActivity],
  );

  const signIn = React.useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const cleanEmail = normalizeEmail(email);
      if (!state || state.profile.email !== cleanEmail) {
        return { ok: false, error: "invalidCredentials" };
      }
      const hash = await derivePassword(password, state.salt);
      if (hash !== state.passwordHash) return { ok: false, error: "invalidCredentials" };
      commit({ ...state, signedIn: true });
      return { ok: true };
    },
    [state, commit],
  );

  const signOut = React.useCallback(() => {
    if (!state) return;
    commit({ ...state, signedIn: false });
  }, [state, commit]);

  const updateProfile = React.useCallback(
    (name: string) => {
      if (!state) return;
      const next: StoredAccount = {
        ...state,
        profile: { ...state.profile, name: name.trim() || state.profile.name },
      };
      commit(next);
      addActivity({
        kind: "account",
        titleKey: "account.saved",
        descKey: "account.savedDesc",
      });
    },
    [state, commit, addActivity],
  );

  const subscribe = React.useCallback(
    (target: Exclude<PlanId, "free">, interval: Interval) => {
      if (!state) return;
      const startedAt = Date.now();
      const renewsAt = addInterval(startedAt, interval);
      const amount = PLANS[target].price[interval];
      const next: StoredAccount = {
        ...state,
        subscription: {
          plan: target,
          interval,
          status: "active",
          startedAt,
          renewsAt,
        },
        invoices: [
          {
            id: newId(),
            plan: target,
            interval,
            amount,
            createdAt: startedAt,
            status: "paid" as const,
          },
          ...state.invoices,
        ].slice(0, 50),
      };
      commit(next);
      const planName = target === "premium" ? "Premium" : "Premium Plus";
      push({
        kind: "billing",
        titleKey: "notification.billing.title",
        descKey: "notification.billing.desc",
        params: { plan: planName },
        href: "/account",
      });
      addActivity({
        kind: "billing",
        titleKey: "notification.billing.title",
        descKey: "notification.billing.desc",
        params: { plan: planName },
        href: "/account",
      });
    },
    [state, commit, push, addActivity],
  );

  const cancelSubscription = React.useCallback(() => {
    if (!state?.subscription) return;
    const next: StoredAccount = {
      ...state,
      subscription: { ...state.subscription, status: "canceled" },
    };
    commit(next);
    push({
      kind: "billing",
      titleKey: "notification.canceled.title",
      descKey: "notification.canceled.desc",
      params: { date: new Date(state.subscription.renewsAt).toLocaleDateString() },
      href: "/account",
    });
    addActivity({
      kind: "billing",
      titleKey: "notification.canceled.title",
      descKey: "notification.canceled.desc",
      params: { date: new Date(state.subscription.renewsAt).toLocaleDateString() },
      href: "/account",
    });
  }, [state, commit, push, addActivity]);

  const resumeSubscription = React.useCallback(() => {
    if (!state?.subscription) return;
    commit({
      ...state,
      subscription: { ...state.subscription, status: "active" },
    });
    addActivity({ kind: "billing", titleKey: "toast.planResumed", href: "/account" });
  }, [state, commit, addActivity]);

  const canUse = React.useCallback(
    (feature: FeatureKey) => (isAuthenticated ? hasFeature(plan, feature) : false),
    [isAuthenticated, plan],
  );

  const recordBreachCheck = React.useCallback(() => {
    if (!state) return;
    const usage = normalizedUsage ?? emptyUsage();
    commit({
      ...state,
      usage: { ...usage, breachChecks: usage.breachChecks + 1 },
    });
  }, [state, normalizedUsage, commit]);

  const recordReport = React.useCallback((): boolean => {
    if (!state) return true;
    const usage = normalizedUsage ?? emptyUsage();
    const limit = planDef.limits.savedReports;
    if (limit !== null && usage.reports >= limit) return false;
    commit({
      ...state,
      usage: { ...usage, reports: usage.reports + 1 },
    });
    return true;
  }, [state, normalizedUsage, planDef, commit]);

  const applyReferralCode = React.useCallback(
    (raw: string): ReferralResult => {
      if (!state) return { ok: false, error: "notSignedIn" };
      const code = raw.trim().toUpperCase();
      if (!/^DF-[A-Z0-9]{4,10}$/.test(code)) return { ok: false, error: "invalid" };
      if (code === state.referral.code) return { ok: false, error: "self" };
      if (state.referral.applied.includes(code)) return { ok: false, error: "already" };

      const credits = 500;
      const days = 14;
      const startedAt = Date.now();
      const base =
        state.subscription && state.subscription.renewsAt > startedAt
          ? state.subscription.renewsAt
          : startedAt;
      const subscription: Subscription = state.subscription
        ? {
            ...state.subscription,
            plan: state.subscription.plan,
            status: "active",
            renewsAt: addDays(base, days),
          }
        : {
            plan: "premium",
            interval: "monthly",
            status: "active",
            startedAt,
            renewsAt: addDays(startedAt, days),
          };

      const next: StoredAccount = {
        ...state,
        subscription,
        referral: {
          ...state.referral,
          credits: state.referral.credits + credits,
          referredBy: code,
          applied: [...state.referral.applied, code],
        },
      };
      commit(next);
      push({
        kind: "referral",
        titleKey: "notification.referral.title",
        descKey: "notification.referral.desc",
        params: { credits },
        href: "/referral",
      });
      addActivity({
        kind: "referral",
        titleKey: "notification.referral.title",
        descKey: "notification.referral.desc",
        params: { credits },
        href: "/referral",
      });
      return { ok: true, credits, days };
    },
    [state, commit, push, addActivity],
  );

  React.useEffect(() => {
    if (!state?.signedIn) return;
    const pending = readRaw(STORAGE_KEYS.pendingReferral);
    if (!pending) return;
    removeStored(STORAGE_KEYS.pendingReferral);
    applyReferralCode(pending);
  }, [state?.signedIn, applyReferralCode]);

  const resetAll = React.useCallback(() => {
    clearDataStorage();
    commit(null);
    if (typeof window !== "undefined") window.location.assign("/");
  }, [commit]);

  const value = React.useMemo<AccountContextValue>(
    () => ({
      ready,
      profile: state?.profile ?? null,
      isAuthenticated,
      plan,
      planDef,
      limits: planDef.limits,
      subscription,
      subscriptionStatus,
      invoices: state?.invoices ?? [],
      referral: isAuthenticated ? state?.referral ?? null : null,
      usage: normalizedUsage,
      signUp,
      signIn,
      signOut,
      updateProfile,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      canUse,
      recordBreachCheck,
      recordReport,
      applyReferralCode,
      resetAll,
    }),
    [
      ready,
      state,
      isAuthenticated,
      plan,
      planDef,
      subscription,
      subscriptionStatus,
      normalizedUsage,
      signUp,
      signIn,
      signOut,
      updateProfile,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      canUse,
      recordBreachCheck,
      recordReport,
      applyReferralCode,
      resetAll,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = React.useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  return ctx;
}

export function daysUntil(ts: number): number {
  return Math.max(0, Math.ceil((ts - Date.now()) / DAY_MS));
}
