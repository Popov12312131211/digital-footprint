"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BadgeCheck,
  FileBarChart,
  Gift,
  Globe2,
  KeyRound,
  Lock,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common";
import { useAccount } from "@/lib/account";
import { useActivity } from "@/lib/activity";
import { useMonitoring } from "@/lib/monitoring";
import { useNotifications } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OverviewExtras() {
  const { t, locale } = useI18n();
  const { isAuthenticated, planDef, subscription, subscriptionStatus, usage, limits, referral } = useAccount();
  const { items: domains, limit } = useMonitoring();
  const { unread, items: notifications } = useNotifications();
  const { items: activity } = useActivity();
  const recent = React.useMemo(
    () => [...notifications].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [notifications],
  );

  return (
    <div className="mb-5 grid gap-5 lg:grid-cols-3">
      <GlassCard interactive={false} className="lg:col-span-2">
        <CardHeader
          icon={<BadgeCheck className="h-5 w-5" />}
          title={t("overview.planTitle")}
          description={t("overview.planDesc")}
          tint="success"
          action={
            <Pill tone={subscriptionStatus === "active" ? "success" : subscriptionStatus === "canceled" ? "warning" : "neutral"}>
              {t(planDef.nameKey)}
            </Pill>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat
            icon={<Globe2 className="h-4 w-4" />}
            label={t("overview.domains")}
            value={
              limit === null
                ? `${domains.length} / ∞`
                : `${domains.length} / ${limit}`
            }
          />
          <MiniStat
            icon={<FileBarChart className="h-4 w-4" />}
            label={t("account.usageReports")}
            value={
              limits.savedReports === null
                ? `${usage?.reports ?? 0} / ∞`
                : `${usage?.reports ?? 0} / ${limits.savedReports}`
            }
          />
          <MiniStat
            icon={<Gift className="h-4 w-4" />}
            label={t("referral.credits")}
            value={String(referral?.credits ?? 0)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-ink-2">
            {subscription
              ? `${t(subscription.interval === "monthly" ? "plan.billingMonthly" : "plan.billingYearly")} · ${t("plan.renews", {
                  date: formatDateTime(subscription.renewsAt, locale),
                })}`
              : isAuthenticated
                ? t("account.noSubscription")
                : t("account.notLoggedIn")}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/account">
                <UserRound className="h-4 w-4" />
                {isAuthenticated ? t("overview.planCta") : t("account.startFree")}
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/pricing">
                <Sparkles className="h-4 w-4" />
                {planDef.id === "free" ? t("plan.upgrade") : t("plan.manage")}
              </Link>
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard interactive={false}>
        <CardHeader
          icon={<Bell className="h-5 w-5" />}
          title={t("overview.notificationsTitle")}
          description={t("overview.notificationsDesc")}
          tint="blue"
          action={
            unread > 0 ? (
              <Pill tone="info">{t("notifications.unread", { count: unread })}</Pill>
            ) : undefined
          }
        />

        {recent.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-ink-2">{t("overview.notificationsEmpty")}</p>
        ) : (
          <ul className="space-y-2.5">
            {recent.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    item.read ? "bg-ink-2/40" : "bg-[color:var(--accent-blue)]",
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{t(item.titleKey, item.params)}</p>
                  <p className="text-[11px] text-ink-2">{formatDateTime(item.createdAt, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
          <Link href="/notifications">
            {t("overview.notificationsCta")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>

        {activity.length > 0 && (
          <p className="mt-2 text-center text-[11px] text-ink-2">
            {t("account.activity")}: {activity.length}
          </p>
        )}
      </GlassCard>
    </div>
  );
}

export function OverviewTools() {
  const { t } = useI18n();
  const { canUse } = useAccount();

  const tools = [
    {
      href: "/passwords",
      icon: KeyRound,
      title: "overview.toolPasswords",
      desc: "overview.toolPasswordsDesc",
      locked: false,
    },
    {
      href: "/monitoring",
      icon: Globe2,
      title: "overview.toolMonitoring",
      desc: "overview.toolMonitoringDesc",
      locked: !canUse("domainMonitoring"),
    },
    {
      href: "/reports",
      icon: FileBarChart,
      title: "overview.toolReports",
      desc: "overview.toolReportsDesc",
      locked: false,
    },
    {
      href: "/referral",
      icon: Gift,
      title: "overview.referralTitle",
      desc: "overview.referralDesc",
      locked: !canUse("referral"),
    },
    {
      href: "/tools",
      icon: Wrench,
      title: "overview.toolTools",
      desc: "overview.toolToolsDesc",
      locked: !canUse("newTools"),
    },
    {
      href: "/account",
      icon: UserRound,
      title: "overview.toolAccount",
      desc: "overview.toolAccountDesc",
      locked: false,
    },
  ];

  return (
    <GlassCard interactive={false} className="mb-5">
      <CardHeader
        icon={<Wrench className="h-5 w-5" />}
        title={t("overview.toolsTitle")}
        description={t("overview.toolsDesc")}
        tint="cyan"
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-inset group flex items-center gap-3 p-3 transition-colors hover:border-[color:color-mix(in_srgb,var(--accent-blue)_35%,var(--glass-border))]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/6 text-blue [[data-theme=light]_&]:bg-black/5">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">{t(tool.title)}</span>
                <span className="block truncate text-[11px] text-ink-2">{t(tool.desc)}</span>
              </span>
              {tool.locked ? (
                <Lock className="h-3.5 w-3.5 shrink-0 text-ink-2" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-2 transition-transform group-hover:translate-x-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-inset p-3">
      <div className="flex items-center gap-1.5 text-ink-2">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="tabular mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
