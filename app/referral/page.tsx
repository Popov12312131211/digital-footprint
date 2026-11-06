"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Gift, Link2, Send, UserPlus, Users } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Pill } from "@/components/common";
import { UpgradeGate } from "@/components/upgrade-gate";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";

export default function ReferralPage() {
  const { t } = useI18n();
  const { ready, isAuthenticated, canUse, referral, applyReferralCode } = useAccount();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteLink = referral ? `${origin}/account?ref=${referral.code}` : "";

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: t("toast.referralCopied"), tone: "success" });
    } catch {
      toast({ title: t("referral.copy"), tone: "warning" });
    }
  };

  if (!ready) {
    return (
      <>
        <PageTitle title={t("referral.title")} description={t("referral.desc")} />
        <GlassCard interactive={false}>
          <p className="text-sm text-ink-2">{t("common.loading")}</p>
        </GlassCard>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageTitle title={t("referral.title")} description={t("referral.desc")} />
        <GlassCard interactive={false} className="mx-auto max-w-xl text-center">
          <span className="glass-inset mx-auto grid h-14 w-14 place-items-center text-purple">
            <Gift className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">{t("account.notLoggedIn")}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t("account.notLoggedInDesc")}</p>
          <Button asChild variant="primary" className="mt-5">
            <Link href="/account">{t("account.startFree")}</Link>
          </Button>
        </GlassCard>
      </>
    );
  }

  if (!canUse("referral")) {
    return (
      <>
        <PageTitle title={t("referral.title")} description={t("referral.desc")} />
        <UpgradeGate
          required="premium"
          titleKey="referral.gateTitle"
          descKey="referral.gateDesc"
          className="mx-auto max-w-2xl"
        />
      </>
    );
  }

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = applyReferralCode(code);
    if (!result.ok) {
      setError(
        t(
          result.error === "self"
            ? "referral.self"
            : result.error === "already"
              ? "referral.already"
              : result.error === "notSignedIn"
                ? "account.notLoggedIn"
                : "referral.invalid",
        ),
      );
      return;
    }
    setCode("");
    toast({
      title: t("toast.referralApplied"),
      description: t("toast.referralAppliedDesc"),
      tone: "success",
    });
  };

  return (
    <>
      <PageTitle title={t("referral.title")} description={t("referral.desc")} />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<Gift className="h-5 w-5" />}
            title={t("referral.yourCode")}
            description={t("referral.codeDesc")}
            tint="purple"
          />

          <div className="glass-inset flex flex-wrap items-center justify-between gap-3 p-4">
            <code className="tabular font-display text-2xl font-semibold tracking-[0.18em] text-ink">
              {referral?.code ?? "—"}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => referral && copy(referral.code)}
              disabled={!referral}
            >
              <Copy className="h-4 w-4" /> {t("referral.copy")}
            </Button>
          </div>

          <div className="mt-4">
            <Field label={t("referral.inviteLink")}>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <Button
                  variant="secondary"
                  onClick={() => copy(inviteLink)}
                  aria-label={t("action.copy")}
                  disabled={!inviteLink}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </Field>
            <Button
              variant="primary"
              className="mt-3 w-full"
              disabled={!referral}
              onClick={() =>
                referral &&
                copy(t("referral.shareText", { link: inviteLink, code: referral.code }))
              }
            >
              <Send className="h-4 w-4" /> {t("referral.invite")}
            </Button>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("referral.inviteDesc")}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Users className="h-4 w-4" />} label={t("referral.invited")} value={String(referral?.invited ?? 0)} />
            <Metric icon={<Gift className="h-4 w-4" />} label={t("referral.credits")} value={String(referral?.credits ?? 0)} />
            <Metric
              icon={<Check className="h-4 w-4" />}
              label={t("referral.status")}
              value={referral?.referredBy ? t("account.statusActive") : t("referral.none")}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[color:var(--glass-border)] p-4">
            <h3 className="text-sm font-semibold text-ink">{t("referral.howTitle")}</h3>
            <ol className="mt-3 space-y-3">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="glass-inset grid h-7 w-7 shrink-0 place-items-center text-[12px] font-semibold text-blue">
                    {n}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{t(`referral.step${n}`)}</p>
                    <p className="text-xs leading-relaxed text-ink-2">{t(`referral.step${n}Desc`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard interactive={false}>
            <CardHeader
              icon={<UserPlus className="h-5 w-5" />}
              title={t("referral.applyTitle")}
              description={t("referral.applyDesc")}
              tint="blue"
            />
            <form onSubmit={apply} className="space-y-3">
              <Field label={t("referral.yourCode")} error={error ?? undefined}>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={t("referral.applyPlaceholder")}
                  autoComplete="off"
                  spellCheck={false}
                  className="tabular tracking-wider"
                />
              </Field>
              <Button type="submit" variant="primary" className="w-full" disabled={!code.trim()}>
                {t("referral.apply")}
              </Button>
            </form>
          </GlassCard>

          <GlassCard interactive={false}>
            <CardHeader
              icon={<Gift className="h-5 w-5" />}
              title={t("referral.reward")}
              description={t("referral.rewardDesc", { credits: 500, days: 14 })}
              tint="success"
            />
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-ink-2">{t("referral.current")}</span>
              <Pill tone="success">{t("referral.tier")}</Pill>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10 [[data-theme=light]_&]:bg-black/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-purple),var(--accent-cyan))]"
                style={{ width: `${Math.min(100, ((referral?.invited ?? 0) / 5) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-2">
              {referral?.invited ?? 0} / 5 · {t("referral.credits")}: {referral?.credits ?? 0}
            </p>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
