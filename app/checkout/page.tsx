"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import { formatRub, planOf, type Interval, type PlanId } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const { isAuthenticated, profile, subscribe } = useAccount();
  const { toast } = useToast();
  const router = useRouter();
  const [planId, setPlanId] = React.useState<Exclude<PlanId, "free"> | null>(null);
  const [interval, setInterval] = React.useState<Interval>("monthly");
  const [card, setCard] = React.useState("4242 4242 4242 4242");
  const [name, setName] = React.useState("");
  const [expiry, setExpiry] = React.useState("12/30");
  const [cvc, setCvc] = React.useState("123");
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const period = params.get("interval");
    if (plan === "premium" || plan === "premium-plus") setPlanId(plan);
    if (period === "monthly" || period === "yearly") setInterval(period);
  }, []);

  React.useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const plan = planId ? planOf(planId) : null;
  const amount = plan && planId ? plan.price[interval] : 0;

  const pay = () => {
    setError(null);
    if (!planId) {
      setError(t("checkout.planMissing"));
      return;
    }
    const digits = card.replace(/\D/g, "");
    if (digits.length !== 16) {
      setError(t("checkout.invalidCard"));
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      subscribe(planId, interval);
      setProcessing(false);
      toast({
        title: t("toast.checkoutSuccess"),
        description: t("toast.checkoutSuccessDesc", { plan: t(planOf(planId).nameKey) }),
        tone: "success",
      });
      router.push("/account");
    }, 900);
  };

  if (!planId) {
    return (
      <>
        <PageTitle title={t("checkout.title")} description={t("checkout.desc")} />
        <GlassCard interactive={false}>
          <p className="text-sm text-ink-2">{t("checkout.planMissing")}</p>
          <Button asChild variant="primary" className="mt-4">
            <Link href="/pricing">{t("checkout.back")}</Link>
          </Button>
        </GlassCard>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageTitle title={t("checkout.title")} description={t("checkout.desc")} />
        <GlassCard interactive={false} className="mx-auto max-w-xl">
          <div className="flex items-start gap-4">
            <span className="glass-inset grid h-12 w-12 shrink-0 place-items-center text-blue">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{t("checkout.loginTitle")}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t("checkout.loginDesc")}</p>
            </div>
          </div>
          <Button asChild variant="primary" className="mt-6 w-full">
            <Link href={`/account?next=${encodeURIComponent(`/checkout?plan=${planId}&interval=${interval}`)}`}>
              {t("checkout.loginCta")}
            </Link>
          </Button>
        </GlassCard>
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("checkout.title")} description={t("checkout.desc")} />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<CreditCard className="h-5 w-5" />}
            title={t("checkout.card")}
            description={t("checkout.demoDesc")}
            tint="blue"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label={t("checkout.cardName")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("checkout.cardNumber")}>
                <Input
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className="tabular"
                />
              </Field>
            </div>
            <Field label={t("checkout.expiry")}>
              <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" autoComplete="cc-exp" />
            </Field>
            <Field label={t("checkout.cvc")}>
              <Input value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" autoComplete="cc-csc" />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("checkout.email")} hint={profile?.email}>
                <Input value={profile?.email ?? ""} readOnly />
              </Field>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          <Button variant="primary" className="mt-5 w-full" onClick={pay} disabled={processing}>
            {processing ? t("checkout.processing") : t("checkout.pay", { price: formatRub(amount, locale) })}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-2">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {t("checkout.secure")}
          </p>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard interactive={false}>
            <h2 className="font-display text-lg font-semibold text-ink">{t("checkout.order")}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">{t("checkout.plan")}</dt>
                <dd className="font-medium text-ink">{t(plan!.nameKey)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">{t("checkout.interval")}</dt>
                <dd className="font-medium text-ink">
                  {t(interval === "monthly" ? "plan.billingMonthly" : "plan.billingYearly")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[color:var(--glass-border)] pt-3">
                <dt className="text-ink-2">{t("checkout.total")}</dt>
                <dd className="tabular font-display text-xl font-semibold text-ink">
                  {formatRub(amount, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">{t("checkout.today")}</dt>
                <dd className="tabular font-semibold text-ink">{formatRub(amount, locale)}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-2xl border border-[color:var(--glass-border)] p-3 text-xs leading-relaxed text-ink-2">
              {t("checkout.trialNote")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("checkout.demo")}: {t("checkout.cancelNote")}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              {t("plan.renews", {
                date: formatDate(
                  Date.now() + (interval === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
                  locale,
                ),
              })}
            </p>
          </GlassCard>

          <div className="glass-inset flex items-start gap-3 p-3.5 text-[13px] leading-relaxed text-ink-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{t("pricing.demoNote")}</span>
          </div>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4" /> {t("checkout.back")}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
