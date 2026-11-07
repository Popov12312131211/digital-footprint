"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  CreditCard,
  Download,
  Gift,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Pill } from "@/components/common";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAccount, daysUntil } from "@/lib/account";
import { useActivity } from "@/lib/activity";
import { useMonitoring } from "@/lib/monitoring";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { formatRub, planOf, type PlanId } from "@/lib/plans";
import { downloadReport } from "@/lib/report";
import { STORAGE_KEYS, writeRaw } from "@/lib/storage";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function AccountPage() {
  const { ready, isAuthenticated } = useAccount();
  const { t } = useI18n();

  if (!ready) {
    return (
      <>
        <PageTitle title={t("account.title")} description={t("account.desc")} />
        <GlassCard interactive={false}>
          <p className="text-sm text-ink-2">{t("common.loading")}</p>
        </GlassCard>
      </>
    );
  }

  if (!isAuthenticated) return <AuthPanel />;
  return <AccountDashboard />;
}

function AuthPanel() {
  const { t } = useI18n();
  const { signIn, signUp } = useAccount();
  const { toast } = useToast();
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup">("signup");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [next, setNext] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("next");
    if (target && target.startsWith("/")) setNext(target);
    const ref = params.get("ref");
    if (ref && /^DF-[A-Z0-9]{4,10}$/i.test(ref)) {
      writeRaw(STORAGE_KEYS.pendingReferral, ref.toUpperCase());
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "signup" ? await signUp(email, name, password) : await signIn(email, password);
      if (!result.ok) {
        setError(t(`account.${result.error ?? "invalidCredentials"}`));
        return;
      }
      toast({
        title: t(mode === "signup" ? "toast.accountCreated" : "toast.signedIn"),
        description: t(mode === "signup" ? "toast.accountCreatedDesc" : "toast.signedInDesc"),
        tone: "success",
      });
      if (next) router.push(next);
      else router.push("/account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle title={t("account.title")} description={t("account.desc")} />
      <div className="mx-auto max-w-lg">
        <GlassCard interactive={false}>
          <div className="mb-5 flex items-start gap-3">
            <span className="glass-inset grid h-11 w-11 shrink-0 place-items-center text-blue">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                {t(mode === "signup" ? "account.signUpTitle" : "account.signInTitle")}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{t("account.authDesc")}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label={t("account.email")} hint={t("account.emailHint")}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            {mode === "signup" && (
              <Field label={`${t("account.name")} · ${t("common.optional")}`} hint={t("account.nameHint")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
              </Field>
            )}
            <Field label={t("account.password")} hint={t("account.passwordHint")}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? t("common.loading") : t(mode === "signup" ? "account.signUp" : "account.signIn")}
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-ink-2">
            {t(mode === "signup" ? "account.haveAccount" : "account.noAccount")}{" "}
            <button
              type="button"
              className="font-medium text-blue hover:opacity-80"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
              }}
            >
              {t(mode === "signup" ? "account.switchSignIn" : "account.switchSignUp")}
            </button>
          </p>

          <p className="mt-4 rounded-2xl border border-[color:var(--glass-border)] p-3 text-xs leading-relaxed text-ink-2">
            {t("account.authPrivacy")}
          </p>
        </GlassCard>
      </div>
    </>
  );
}

function AccountDashboard() {
  const { t, locale } = useI18n();
  const {
    profile,
    planDef,
    subscription,
    subscriptionStatus,
    invoices,
    referral,
    usage,
    limits,
    updateProfile,
    signOut,
    cancelSubscription,
    resumeSubscription,
    resetAll,
  } = useAccount();
  const { items: activity } = useActivity();
  const { items: domains, limit: domainLimit } = useMonitoring();
  const { current, history } = useAudit();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = React.useState(profile?.name ?? "");
  const [resetOpen, setResetOpen] = React.useState(false);

  const recentActivity = [...activity].slice(-12).reverse();
  const statusTone =
    subscriptionStatus === "active"
      ? "success"
      : subscriptionStatus === "canceled"
        ? "warning"
        : subscriptionStatus === "expired"
          ? "danger"
          : "neutral";
  const statusKey =
    subscriptionStatus === "active"
      ? "account.statusActive"
      : subscriptionStatus === "canceled"
        ? "account.statusCanceled"
        : subscriptionStatus === "expired"
          ? "account.statusExpired"
          : "plan.free";

  return (
    <>
      <PageTitle
        title={t("account.welcome", { name: profile?.name ?? "" })}
        description={t("account.desc")}
        action={
          <Button asChild variant="primary">
            <Link href="/pricing">
              <Sparkles className="h-4 w-4" />
              {planDef.id === "free" ? t("plan.upgrade") : t("plan.manage")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<UserRound className="h-5 w-5" />}
            title={t("account.profile")}
            description={profile ? t("account.memberSince", { date: formatDate(profile.createdAt, locale) }) : ""}
            tint="blue"
          />
          <div className="space-y-3">
            <Field label={t("account.name")}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t("account.email")} hint={profile?.email}>
              <Input value={profile?.email ?? ""} readOnly />
            </Field>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  updateProfile(name);
                  toast({ title: t("account.saved"), description: t("account.savedDesc"), tone: "success" });
                }}
                disabled={!name.trim() || name === profile?.name}
              >
                {t("action.save")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signOut();
                  toast({ title: t("toast.signedOut"), tone: "info" });
                }}
              >
                <LogOut className="h-4 w-4" /> {t("account.signOut")}
              </Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard interactive={false}>
          <CardHeader
            icon={<BadgeCheck className="h-5 w-5" />}
            title={t("account.subscription")}
            description={t(planDef.nameKey)}
            tint="success"
            action={<Pill tone={statusTone}>{t(statusKey)}</Pill>}
          />
          <dl className="space-y-2.5 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-2">{t("plan.yourPlan")}</dt>
              <dd className="font-medium text-ink">{t(planDef.nameKey)}</dd>
            </div>
            {subscription && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-2">{t("account.nextPayment")}</dt>
                  <dd className="font-medium text-ink">{formatDate(subscription.renewsAt, locale)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-2">{t("checkout.interval")}</dt>
                  <dd className="font-medium text-ink">
                    {t(subscription.interval === "monthly" ? "plan.billingMonthly" : "plan.billingYearly")}
                  </dd>
                </div>
                {subscription.renewsAt > Date.now() && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-2">{t("account.daysLeft", { count: daysUntil(subscription.renewsAt) })}</dt>
                    <dd />
                  </div>
                )}
              </>
            )}
          </dl>

          {subscriptionStatus === "canceled" && subscription && (
            <p className="mt-3 rounded-2xl border border-[color:var(--glass-border)] p-3 text-xs leading-relaxed text-ink-2">
              {t("account.canceledNotice", { date: formatDate(subscription.renewsAt, locale) })}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/pricing">{subscription ? t("plan.change") : t("plan.upgrade")}</Link>
            </Button>
            {subscription && subscriptionStatus === "active" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  cancelSubscription();
                  toast({ title: t("toast.planCanceled"), tone: "info" });
                }}
              >
                {t("plan.downgrade")}
              </Button>
            )}
            {subscription && subscriptionStatus === "canceled" && subscription.renewsAt > Date.now() && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resumeSubscription();
                  toast({ title: t("toast.planResumed"), tone: "success" });
                }}
              >
                {t("action.continue")}
              </Button>
            )}
          </div>
        </GlassCard>

        <GlassCard interactive={false}>
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title={t("account.usage")}
            description={t("account.usageDesc")}
            tint="purple"
          />
          <UsageRow
            label={t("account.usageChecks")}
            value={usage?.breachChecks ?? 0}
            max={null}
          />
          <UsageRow
            label={t("account.usageReports")}
            value={usage?.reports ?? 0}
            max={limits.savedReports}
          />
          <UsageRow
            label={t("account.usageDomains")}
            value={domains.length}
            max={domainLimit}
          />
          <p className="mt-3 text-xs leading-relaxed text-ink-2">
            {t("plan.usageTitle")}: {t(planDef.nameKey)}
          </p>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2" id="billing">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<ReceiptText className="h-5 w-5" />}
            title={t("account.billing")}
            description={t("account.billingDesc")}
            tint="cyan"
          />
          {invoices.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-ink-2">{t("account.billingEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="glass-inset flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">
                      {t(planOf(invoice.plan).nameKey)} ·{" "}
                      {t(invoice.interval === "monthly" ? "plan.billingMonthly" : "plan.billingYearly")}
                    </p>
                    <p className="text-xs text-ink-2">{formatDateTime(invoice.createdAt, locale)}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-[13px] font-semibold text-ink">{formatRub(invoice.amount, locale)}</p>
                    <Pill tone="success">{t("account.invoicePaid")}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ink-2">{t("pricing.demoNote")}</p>
        </GlassCard>

        <GlassCard interactive={false}>
          <CardHeader
            icon={<Gift className="h-5 w-5" />}
            title={t("account.referral")}
            description={t("referral.rewardDesc", { credits: 500, days: 14 })}
            tint="purple"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/referral">{t("action.open")}</Link>
              </Button>
            }
          />
          <dl className="space-y-2.5 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-2">{t("referral.yourCode")}</dt>
              <dd className="tabular font-semibold tracking-wider text-ink">{referral?.code ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-2">{t("referral.credits")}</dt>
              <dd className="font-medium text-ink">{referral?.credits ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-2">{t("referral.invited")}</dt>
              <dd className="font-medium text-ink">{referral?.invited ?? 0}</dd>
            </div>
          </dl>
          <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
            <Link href="/referral">{t("overview.referralCta")}</Link>
          </Button>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title={t("account.activity")}
            description={t("account.activityDesc")}
            tint="blue"
          />
          {recentActivity.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-ink-2">{t("account.activityEmpty")}</p>
          ) : (
            <ol className="space-y-2">
              {recentActivity.map((item) => (
                <li key={item.id} className="glass-inset flex items-start justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{t(item.titleKey, item.params)}</p>
                    {item.descKey && (
                      <p className="mt-0.5 text-xs leading-snug text-ink-2">{t(item.descKey, item.params)}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-2">{formatDateTime(item.at, locale)}</span>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>

        <div className="space-y-5">
          <GlassCard interactive={false}>
            <CardHeader
              icon={<Download className="h-5 w-5" />}
              title={t("reports.title")}
              description={t("reports.demoNote")}
              tint="success"
            />
            <p className="text-[13px] leading-relaxed text-ink-2">
              {t("history.desc", { count: history.length })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!current}
                onClick={() => {
                  downloadReport(current, history);
                  toast({ title: t("toast.reportTitle"), description: t("toast.reportDesc"), tone: "success" });
                }}
              >
                <Download className="h-4 w-4" /> {t("reports.download")}
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/reports">{t("nav.reports")}</Link>
              </Button>
            </div>
          </GlassCard>

          <GlassCard interactive={false} className="border-[color:color-mix(in_srgb,var(--danger)_40%,var(--glass-border))]">
            <CardHeader
              icon={<TriangleAlert className="h-5 w-5" />}
              title={t("account.dangerZone")}
              description={t("account.dangerDesc")}
              tint="warning"
            />
            <p className="text-[13px] leading-relaxed text-ink-2">{t("account.resetDesc")}</p>
            <Button variant="ghost" size="sm" className="mt-4 text-danger" onClick={() => setResetOpen(true)}>
              {t("account.resetData")}
            </Button>
          </GlassCard>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogTitle>{t("account.resetConfirm")}</DialogTitle>
          <DialogDescription>{t("account.resetDesc")}</DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t("common.cancel")}</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                resetAll();
                setResetOpen(false);
                router.push("/");
              }}
            >
              {t("account.resetData")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UsageRow({ label, value, max }: { label: string; value: number; max: number | null }) {
  const { t } = useI18n();
  const pct = max === null ? 0 : Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className="tabular font-medium text-ink">
          {value}
          {max === null ? ` · ${t("limits.unlimited")}` : ` / ${max}`}
        </span>
      </div>
      {max !== null && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10 [[data-theme=light]_&]:bg-black/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cyan),var(--accent-blue))]"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
