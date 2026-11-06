export type PlanId = "free" | "premium" | "premium-plus";
export type Interval = "monthly" | "yearly";

export type FeatureKey =
  | "securityScore"
  | "browserAudit"
  | "privacyChecklist"
  | "passwordChecker"
  | "breachCheck"
  | "domainMonitoring"
  | "notifications"
  | "changeHistory"
  | "advancedReports"
  | "extendedReports"
  | "referral"
  | "priorityMonitoring"
  | "newTools";

export interface PlanLimits {
  /** null means unlimited */
  monitoredDomains: number | null;
  /** null means unlimited */
  historyDays: number | null;
  /** null means unlimited */
  savedReports: number | null;
  /** How often an active domain is re-checked, in hours. */
  monitorIntervalHours: number;
}

export interface PlanDefinition {
  id: PlanId;
  nameKey: string;
  taglineKey: string;
  price: Record<Interval, number>;
  /** cost of the yearly plan compared with 12 monthly payments, 0–1 */
  yearlyDiscount: number;
  highlight?: boolean;
  limits: PlanLimits;
  features: FeatureKey[];
}

const FREE_FEATURES: FeatureKey[] = [
  "securityScore",
  "browserAudit",
  "privacyChecklist",
  "passwordChecker",
  "notifications",
  "changeHistory",
];

const PREMIUM_FEATURES: FeatureKey[] = [
  ...FREE_FEATURES,
  "breachCheck",
  "domainMonitoring",
  "advancedReports",
  "referral",
];

const PLUS_FEATURES: FeatureKey[] = [
  ...PREMIUM_FEATURES,
  "extendedReports",
  "priorityMonitoring",
  "newTools",
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    nameKey: "plan.free",
    taglineKey: "plan.freeTagline",
    price: { monthly: 0, yearly: 0 },
    yearlyDiscount: 0,
    limits: {
      monitoredDomains: 0,
      historyDays: 30,
      savedReports: 3,
      monitorIntervalHours: 0,
    },
    features: FREE_FEATURES,
  },
  premium: {
    id: "premium",
    nameKey: "plan.premium",
    taglineKey: "plan.premiumTagline",
    price: { monthly: 499, yearly: 3990 },
    yearlyDiscount: 0.33,
    highlight: true,
    limits: {
      monitoredDomains: 5,
      historyDays: 365,
      savedReports: null,
      monitorIntervalHours: 24,
    },
    features: PREMIUM_FEATURES,
  },
  "premium-plus": {
    id: "premium-plus",
    nameKey: "plan.premiumPlus",
    taglineKey: "plan.premiumPlusTagline",
    price: { monthly: 999, yearly: 7990 },
    yearlyDiscount: 0.33,
    limits: {
      monitoredDomains: 25,
      historyDays: null,
      savedReports: null,
      monitorIntervalHours: 6,
    },
    features: PLUS_FEATURES,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "premium", "premium-plus"];

export const FEATURE_ORDER: FeatureKey[] = [
  "securityScore",
  "browserAudit",
  "privacyChecklist",
  "passwordChecker",
  "breachCheck",
  "domainMonitoring",
  "notifications",
  "changeHistory",
  "advancedReports",
  "extendedReports",
  "referral",
  "priorityMonitoring",
  "newTools",
];

export function planOf(id: PlanId | string | null | undefined): PlanDefinition {
  if (id === "premium" || id === "premium-plus") return PLANS[id];
  return PLANS.free;
}

export function hasFeature(plan: PlanId, feature: FeatureKey): boolean {
  return planOf(plan).features.includes(feature);
}

export function planRank(plan: PlanId): number {
  return PLAN_ORDER.indexOf(plan);
}

export function isAtLeast(plan: PlanId, minimum: PlanId): boolean {
  return planRank(plan) >= planRank(minimum);
}

export function nextPlan(plan: PlanId): PlanId | null {
  const i = planRank(plan);
  return i >= 0 && i < PLAN_ORDER.length - 1 ? PLAN_ORDER[i + 1] : null;
}

export function formatRub(value: number, locale: "ru" | "en"): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function intervalLabelKey(interval: Interval): string {
  return interval === "monthly" ? "common.month" : "common.year";
}

export function minPlanFor(feature: FeatureKey): PlanId {
  const found = PLAN_ORDER.find((id) => PLANS[id].features.includes(feature));
  return found ?? "premium-plus";
}
