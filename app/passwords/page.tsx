"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/common";
import { UpgradeGate } from "@/components/upgrade-gate";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import {
  analyzePassword,
  checkPasswordBreach,
  crackTime,
  generatePassword,
  type BreachResult,
} from "@/lib/password";
import { cn } from "@/lib/utils";

const LABEL_COLOR = {
  weak: "var(--sev-critical)",
  fair: "var(--danger)",
  good: "var(--warning)",
  strong: "var(--success)",
  excellent: "var(--accent-cyan)",
} as const;

const LABEL_TONE = {
  weak: "danger",
  fair: "danger",
  good: "warning",
  strong: "success",
  excellent: "success",
} as const;

type BreachState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: BreachResult }
  | { status: "error" };

export default function PasswordsPage() {
  const { t, locale } = useI18n();
  const { canUse, recordBreachCheck } = useAccount();
  const { toast } = useToast();
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [breach, setBreach] = React.useState<BreachState>({ status: "idle" });
  const [generated, setGenerated] = React.useState("");
  const [length, setLength] = React.useState(20);

  const analysis = React.useMemo(() => analyzePassword(password), [password]);
  const crack = crackTime(analysis.crackSeconds);
  const breachAllowed = canUse("breachCheck");

  const generate = React.useCallback(() => {
    setGenerated(
      generatePassword({
        length,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      }),
    );
  }, [length]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: t("tools.copied"), tone: "success" });
    } catch {
      toast({ title: t("passwords.privacy"), tone: "warning" });
    }
  };

  const runBreachCheck = async () => {
    if (!password) return;
    setBreach({ status: "loading" });
    try {
      const result = await checkPasswordBreach(password);
      setBreach({ status: "done", result });
      recordBreachCheck();
    } catch {
      setBreach({ status: "error" });
    }
  };

  React.useEffect(() => {
    setBreach({ status: "idle" });
  }, [password]);

  const labelColor = LABEL_COLOR[analysis.label];

  return (
    <>
      <PageTitle title={t("passwords.title")} description={t("passwords.desc")} />

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<KeyRound className="h-5 w-5" />}
            title={t("passwords.analysis")}
            description={t("passwords.localNote")}
            tint="blue"
            action={
              password ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPassword("");
                    setVisible(false);
                  }}
                >
                  {t("passwords.clear")}
                </Button>
              ) : undefined
            }
          />

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">{t("passwords.inputLabel")}</span>
            <div className="relative">
              <Input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwords.placeholder")}
                autoComplete="off"
                spellCheck={false}
                className="pr-12 font-mono"
                aria-describedby="password-privacy"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={t(visible ? "passwords.hide" : "passwords.show")}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-2 transition-colors hover:text-ink"
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {password.length === 0 ? (
            <p className="mt-5 text-[13px] leading-relaxed text-ink-2">{t("passwords.empty")}</p>
          ) : (
            <>
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-ink-2">{t("passwords.strength")}</span>
                  <Pill tone={LABEL_TONE[analysis.label]}>{t(`passwords.label.${analysis.label}`)}</Pill>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10 [[data-theme=light]_&]:bg-black/10">
                  <div
                    className="h-full rounded-full transition-[width,background-color] duration-300"
                    style={{ width: `${Math.max(4, analysis.score)}%`, background: labelColor }}
                  />
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-3">
                <Stat label={t("passwords.length")} value={String(analysis.length)} />
                <Stat label={t("passwords.entropy")} value={t("passwords.entropyBits", { bits: analysis.entropy })} />
                <Stat
                  label={t("passwords.crackTime")}
                  value={t(crack.key, crack.count !== undefined ? { count: crack.count } : undefined)}
                />
              </dl>

              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-ink">{t("passwords.checksTitle")}</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {analysis.checks.map((check) => (
                    <li key={check.id} className="flex items-center gap-2 text-[13px]">
                      {check.passed ? (
                        <Check className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-danger" />
                      )}
                      <span className={check.passed ? "text-ink" : "text-ink-2"}>
                        {t(
                          check.id === "length"
                            ? "passwords.checksLength"
                            : check.id === "classes"
                              ? "passwords.checksClasses"
                              : check.id === "pattern"
                                ? "passwords.checksPattern"
                                : "passwords.checksCommon",
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-ink">{t("passwords.suggestions")}</h3>
                {analysis.suggestions.length === 0 ? (
                  <p className="mt-1.5 text-[13px] text-success">{t("passwords.noSuggestions")}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {analysis.suggestions.map((key) => (
                      <li key={key} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-2" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <p id="password-privacy" className="mt-5 flex items-start gap-2 border-t border-[color:var(--glass-border)] pt-4 text-xs leading-relaxed text-ink-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {t("passwords.neverStored")}
          </p>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard interactive={false}>
            <CardHeader
              icon={<ShieldAlert className="h-5 w-5" />}
              title={t("passwords.breachTitle")}
              description={t("passwords.breachDesc")}
              tint="warning"
            />

            {!breachAllowed ? (
              <UpgradeGate
                required="premium"
                titleKey="passwords.premiumGate"
                descKey="passwords.premiumGateDesc"
                className="bg-transparent p-0"
              />
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={runBreachCheck}
                  disabled={!password || breach.status === "loading"}
                >
                  {breach.status === "loading" ? t("passwords.breachChecking") : t("passwords.breachCheck")}
                </Button>

                {breach.status === "done" && (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-4",
                      breach.result.breached
                        ? "border-[color:color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)]"
                        : "border-[color:color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_8%,transparent)]",
                    )}
                  >
                    <p className={cn("text-sm font-semibold", breach.result.breached ? "text-danger" : "text-success")}>
                      {t(breach.result.breached ? "passwords.breachFound" : "passwords.breachSafe")}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                      {breach.result.breached
                        ? t("passwords.breachFoundDesc", { count: breach.result.count.toLocaleString(locale) })
                        : t("passwords.breachSafeDesc")}
                    </p>
                  </div>
                )}

                {breach.status === "error" && (
                  <div className="mt-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--warning)_35%,transparent)] p-4">
                    <p className="text-sm font-semibold text-warning">{t("passwords.breachError")}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{t("passwords.breachErrorDesc")}</p>
                  </div>
                )}

                <p className="mt-4 text-xs leading-relaxed text-ink-2">{t("passwords.breachSource")}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("passwords.hashNote")}</p>
              </>
            )}
          </GlassCard>

          <GlassCard interactive={false}>
            <CardHeader
              icon={<RefreshCw className="h-5 w-5" />}
              title={t("passwords.generatorTitle")}
              description={t("passwords.generatorDesc")}
              tint="purple"
            />
            <div className="glass-inset flex items-center gap-2 p-2.5">
              <code className="min-w-0 flex-1 break-all font-mono text-[13px] text-ink">{generated}</code>
              <button
                type="button"
                onClick={() => copy(generated)}
                aria-label={t("action.copy")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:text-ink"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="flex-1 text-xs text-ink-2">
                {t("tools.length")}: <span className="tabular font-medium text-ink">{length}</span>
                <input
                  type="range"
                  min={8}
                  max={48}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="mt-2 w-full accent-[color:var(--accent-blue)]"
                />
              </label>
            </div>
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={generate}>
              <RefreshCw className="h-4 w-4" /> {t("passwords.generate")}
            </Button>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("passwords.generatedNote")}</p>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-inset p-3">
      <dt className="text-[11px] uppercase tracking-wide text-ink-2">{label}</dt>
      <dd className="tabular mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
