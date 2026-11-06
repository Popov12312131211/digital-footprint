"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import {
  FEATURE_ORDER,
  PLANS,
  PLAN_ORDER,
  formatRub,
  hasFeature,
  planOf,
  type Interval,
  type PlanId,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { t } = useI18n();
  const { plan, isAuthenticated } = useAccount();
  const [interval, setInterval] = React.useState<Interval>("monthly");

  return (
    <>
      <PageTitle title={t("pricing.title")} description={t("pricing.desc")} />

      <div className="mb-7 flex flex-col items-center gap-3">
        <div className="glass-inset inline-flex rounded-full p-1">
          {(["monthly", "yearly"] as Interval[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              aria-pressed={interval === value}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                interval === value ? "bg-white/12 text-ink [[data-theme=light]_&]:bg-white/80" : "text-ink-2 hover:text-ink",
              )}
            >
              {t(value === "monthly" ? "pricing.monthly" : "pricing.yearly")}
              {value === "yearly" && (
                <span className="ml-1.5 rounded-full bg-[color:var(--success)]/15 px-1.5 py-0.5 text-[11px] text-success">
                  −33%
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-2">{t("pricing.vatNote")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => (
          <PlanCard key={id} id={id} interval={interval} currentPlan={plan} signedIn={isAuthenticated} />
        ))}
      </div>

      <GlassCard interactive={false} className="mt-8">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t("pricing.compare")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-ink-2">
                <th className="py-2 pr-4 font-medium">{t("plan.featureListTitle")}</th>
                {PLAN_ORDER.map((id) => (
                  <th key={id} className="px-3 py-2 text-center font-medium">
                    {t(planOf(id).nameKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ORDER.map((feature) => (
                <tr key={feature} className="border-t border-[color:var(--glass-border)]">
                  <td className="py-2.5 pr-4 text-ink">{t(`feature.${feature}`)}</td>
                  {PLAN_ORDER.map((id) => (
                    <td key={id} className="px-3 py-2.5 text-center">
                      {hasFeature(id, feature) ? (
                        <Check className="mx-auto h-4 w-4 text-success" aria-label={t("common.included")} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-ink-2" aria-label={t("common.notIncluded")} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <GlassCard key={n} interactive={false}>
            <h3 className="font-display text-[15px] font-semibold text-ink">{t(`pricing.faq${n}Q`)}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{t(`pricing.faq${n}A`)}</p>
          </GlassCard>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs leading-relaxed text-ink-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
        {t("pricing.demoNote")}
      </p>
    </>
  );
}

function PlanCard({
  id,
  interval,
  currentPlan,
  signedIn,
}: {
  id: PlanId;
  interval: Interval;
  currentPlan: PlanId;
  signedIn: boolean;
}) {
  const { t, locale } = useI18n();
  const plan = planOf(id);
  const isCurrent = currentPlan === id;
  const price = plan.price[interval];
  const isFree = id === "free";
  const yearly = interval === "yearly" && price > 0;
  const href = isFree ? "/account" : `/checkout?plan=${id}&interval=${interval}`;

  return (
    <GlassCard
      interactive={false}
      className={cn(
        "relative flex flex-col",
        plan.highlight && "border-[color:color-mix(in_srgb,var(--accent-blue)_55%,var(--glass-border))]",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/25 bg-[linear-gradient(135deg,rgba(79,107,240,0.95),rgba(124,92,232,0.92))] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_6px_20px_-4px_rgba(120,149,255,0.7)]">
          {t("plan.popular")}
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t(plan.nameKey)}</h2>
        {isCurrent && <span className="text-xs font-medium text-blue">{t("pricing.current")}</span>}
      </div>
      <p className="mt-1.5 min-h-[40px] text-[13px] leading-relaxed text-ink-2">{t(plan.taglineKey)}</p>

      <div className="mt-4">
        <span className="tabular font-display text-4xl font-semibold tracking-tight text-ink">
          {isFree ? t("common.free") : formatRub(price, locale)}
        </span>
        {!isFree && (
          <span className="ml-1 text-sm text-ink-2">
            {t(interval === "monthly" ? "common.perMonth" : "common.perYear")}
          </span>
        )}
        {yearly && (
          <p className="mt-1 text-xs text-ink-2">
            {t("plan.perMonth", { price: formatRub(Math.round(price / 12), locale) })} · {t("plan.savePercent", { percent: 33 })}
          </p>
        )}
        {isFree && <p className="mt-1 text-xs text-ink-2">{t("plan.freeForever")}</p>}
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {FEATURE_ORDER.map((feature) => {
          const included = hasFeature(id, feature);
          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-2.5 text-[13px] leading-snug",
                included ? "text-ink" : "text-ink-2/60",
              )}
            >
              {included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-2/60" />
              )}
              {t(`feature.${feature}`)}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 space-y-2 rounded-2xl border border-[color:var(--glass-border)] p-3">
        <LimitRow label={t("limits.domains")} value={
          plan.limits.monitoredDomains === null
            ? t("limits.unlimited")
            : plan.limits.monitoredDomains === 0
              ? t("limits.none")
              : t("limits.domainsCount", { count: plan.limits.monitoredDomains })
        } />
        <LimitRow label={t("limits.history")} value={
          plan.limits.historyDays === null
            ? t("limits.unlimited")
            : t("limits.days", { count: plan.limits.historyDays })
        } />
        <LimitRow label={t("limits.reports")} value={
          plan.limits.savedReports === null
            ? t("limits.unlimited")
            : t("limits.perMonth", { count: plan.limits.savedReports })
        } />
      </div>

      <Button
        asChild
        variant={plan.highlight ? "primary" : "secondary"}
        className="mt-5 w-full"
      >
        <Link href={href}>
          {isCurrent ? (
            t("pricing.current")
          ) : isFree ? (
            signedIn ? t("account.manage") : t("plan.startFree")
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("pricing.choose")}
            </>
          )}
        </Link>
      </Button>
    </GlassCard>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-ink-2">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
