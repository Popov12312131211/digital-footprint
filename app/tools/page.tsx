"use client";

import * as React from "react";
import {
  Check,
  ClipboardList,
  Copy,
  Mail,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Pill } from "@/components/common";
import { UpgradeGate } from "@/components/upgrade-gate";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import { analyzePassword, generatePassword, type GeneratorOptions } from "@/lib/password";
import { cn } from "@/lib/utils";

const CHECKLIST_KEY = "df-tools-checklist-v1";

interface EmailBreach {
  name: string;
  title: string;
  date: string;
  pwnCount: number;
}

type EmailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; available: boolean; breaches: EmailBreach[] }
  | { status: "error" };

const DEFAULT_OPTIONS: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};

export default function ToolsPage() {
  const { t } = useI18n();
  const { ready, canUse } = useAccount();
  const { toast } = useToast();
  const [options, setOptions] = React.useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [generated, setGenerated] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailState, setEmailState] = React.useState<EmailState>({ status: "idle" });
  const [checked, setChecked] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) setChecked(parsed.filter((x): x is string => typeof x === "string"));
    } catch {
      /* checklist starts empty */
    }
  }, []);

  const generate = React.useCallback(() => {
    setGenerated(generatePassword(options));
  }, [options]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  const toggle = (key: string) => {
    setChecked((current) => {
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      try {
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      } catch {
        /* still applies in this session */
      }
      return next;
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      toast({ title: t("tools.copied"), tone: "success" });
    } catch {
      toast({ title: t("action.copy"), tone: "warning" });
    }
  };

  const checkEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setEmailState({ status: "loading" });
    try {
      const response = await fetch(`/api/email-exposure?email=${encodeURIComponent(email.trim())}`, {
        cache: "no-store",
      });
      if (!response.ok && response.status !== 502) {
        setEmailState({ status: "error" });
        return;
      }
      const data = (await response.json()) as { available?: boolean; breaches?: EmailBreach[] };
      setEmailState({
        status: "done",
        available: data.available === true,
        breaches: Array.isArray(data.breaches) ? data.breaches : [],
      });
    } catch {
      setEmailState({ status: "error" });
    }
  };

  if (!ready) {
    return (
      <>
        <PageTitle title={t("tools.title")} description={t("tools.desc")} />
        <GlassCard interactive={false}>
          <p className="text-sm text-ink-2">{t("common.loading")}</p>
        </GlassCard>
      </>
    );
  }

  if (!canUse("newTools")) {
    return (
      <>
        <PageTitle title={t("tools.title")} description={t("tools.desc")} />
        <UpgradeGate
          required="premium-plus"
          titleKey="tools.emailGate"
          descKey="tools.gateDesc"
          className="mx-auto max-w-2xl"
        />
      </>
    );
  }

  const analysis = analyzePassword(generated);

  return (
    <>
      <PageTitle title={t("tools.title")} description={t("tools.desc")} />

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<RefreshCw className="h-5 w-5" />}
            title={t("tools.generatorTitle")}
            description={t("tools.generatorDesc")}
            tint="purple"
          />

          <div className="glass-inset flex items-center gap-2 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm text-ink">{generated}</code>
            <button
              type="button"
              onClick={copy}
              aria-label={t("tools.copy")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:text-ink"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-[13px]">
            <span className="text-ink-2">{t("tools.strength")}</span>
            <Pill tone={analysis.score >= 65 ? "success" : analysis.score >= 45 ? "warning" : "danger"}>
              {t(`passwords.label.${analysis.label}`)} · {analysis.entropy} bit
            </Pill>
          </div>

          <div className="mt-4">
            <label className="block text-[13px] text-ink-2">
              <span className="flex items-center justify-between">
                <span>{t("tools.length")}</span>
                <span className="tabular font-medium text-ink">{options.length}</span>
              </span>
              <input
                type="range"
                min={8}
                max={64}
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                className="mt-2 w-full accent-[color:var(--accent-blue)]"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {([
              ["uppercase", "tools.uppercase"],
              ["lowercase", "tools.lowercase"],
              ["numbers", "tools.numbers"],
              ["symbols", "tools.symbols"],
              ["excludeAmbiguous", "tools.excludeAmbiguous"],
            ] as const).map(([key, labelKey]) => (
              <label key={key} className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="h-4 w-4 rounded accent-[color:var(--accent-blue)]"
                />
                {t(labelKey)}
              </label>
            ))}
          </div>

          <Button variant="secondary" className="mt-4 w-full" onClick={generate}>
            <RefreshCw className="h-4 w-4" /> {t("tools.generate")}
          </Button>
          <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("tools.generatorNote")}</p>
        </GlassCard>

        <GlassCard interactive={false}>
          <CardHeader
            icon={<Mail className="h-5 w-5" />}
            title={t("tools.emailTitle")}
            description={t("tools.emailDesc")}
            tint="warning"
          />
          <form onSubmit={checkEmail} className="space-y-3">
            <Field label={t("tools.emailTitle")}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("tools.emailPlaceholder")}
                autoComplete="email"
              />
            </Field>
            <Button type="submit" variant="primary" className="w-full" disabled={emailState.status === "loading"}>
              {emailState.status === "loading" ? t("action.checking") : t("tools.emailCheck")}
            </Button>
          </form>

          {emailState.status === "error" && (
            <p className="mt-4 text-sm text-danger">{t("tools.emailError")}</p>
          )}

          {emailState.status === "done" && !emailState.available && (
            <div className="mt-4 rounded-2xl border border-[color:var(--glass-border)] p-4 text-[13px] leading-relaxed text-ink-2">
              {t("tools.emailUnavailable")}
            </div>
          )}

          {emailState.status === "done" && emailState.available && (
            <div className="mt-4">
              {emailState.breaches.length === 0 ? (
                <p className="flex items-start gap-2 text-[13px] text-success">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("tools.emailNone")}
                </p>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-danger">
                    {t("tools.emailResult", { count: emailState.breaches.length })}
                  </p>
                  <ul className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                    {emailState.breaches.map((breach) => (
                      <li key={`${breach.name}-${breach.date}`} className="glass-inset p-3">
                        <p className="text-[13px] font-medium text-ink">{breach.title || breach.name}</p>
                        <p className="mt-0.5 text-xs text-ink-2">
                          {breach.date} · {t("passwords.pwnedCount", { count: breach.pwnCount.toLocaleString() })}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-2">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("tools.emailNote")}
          </p>
        </GlassCard>
      </div>

      <GlassCard interactive={false} className="mt-5">
        <CardHeader
          icon={<ClipboardList className="h-5 w-5" />}
          title={t("tools.brokerTitle")}
          description={t("tools.brokerDesc")}
          tint="cyan"
          action={
            <Pill tone={checked.length === 6 ? "success" : "neutral"}>
              {checked.length} / 6
            </Pill>
          }
        />
        <ul className="grid gap-2 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const key = `broker${n}`;
            const isChecked = checked.includes(key);
            return (
              <li key={key}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3 text-[13px] leading-relaxed transition-colors",
                    isChecked
                      ? "border-[color:color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_8%,transparent)] text-ink"
                      : "border-[color:var(--glass-border)] text-ink-2",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(key)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[color:var(--accent-blue)]"
                  />
                  <span className={isChecked ? "line-through opacity-80" : undefined}>{t(`tools.${key}`)}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-2">
          <Wrench className="h-3.5 w-3.5" /> {t("tools.checklistTitle")} · {t("tools.premiumTools")}
        </p>
      </GlassCard>
    </>
  );
}
