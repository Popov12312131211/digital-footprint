"use client";

import * as React from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Download, ScanSearch } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Pill, severityVar, type Tone } from "@/components/common";
import { ScoreRing } from "@/components/score-ring";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { recommendations, type ScoreLabel } from "@/lib/audit";
import { downloadReport } from "@/lib/report";

const labelTone: Record<ScoreLabel, Tone> = {
  Strong: "success",
  Good: "info",
  "Needs attention": "warning",
  "At risk": "danger",
};

const STEPS = ["dialog.step1", "dialog.step2", "dialog.step3", "dialog.step4"] as const;

export function AuditDialog() {
  const { dialogOpen, setDialogOpen, scanning, lastRun, history } = useAudit();
  const { toast } = useToast();
  const { t, tp } = useI18n();
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState(0);
  const announced = React.useRef<string | null>(null);

  // Walk through the steps while the scan runs.
  React.useEffect(() => {
    if (!scanning) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 360);
    return () => window.clearInterval(id);
  }, [scanning]);

  // Confirm with a toast once a run completes.
  React.useEffect(() => {
    if (scanning || !lastRun || announced.current === lastRun.result.id) return;
    announced.current = lastRun.result.id;
    toast({
      title: t("toast.auditSaved"),
      description: t("toast.auditSavedDesc", { score: lastRun.result.score }),
      tone: "success",
    });
  }, [scanning, lastRun, toast, t]);

  const result = lastRun?.result;
  const delta = result && lastRun?.previous ? result.score - lastRun.previous.score : null;
  const recs = result ? recommendations(result).slice(0, 3) : [];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-xl">
        {scanning || !result ? (
          <div>
            <DialogTitle>{t("dialog.running")}</DialogTitle>
            <DialogDescription>{t("dialog.runningDesc")}</DialogDescription>

            <div className="my-8 grid place-items-center">
              <div className="relative grid h-36 w-36 place-items-center">
                {!reduce && (
                  <>
                    <span className="absolute inset-0 animate-pulse-ring rounded-full border border-[color:var(--accent-blue)]" />
                    <span
                      className="absolute inset-0 animate-pulse-ring rounded-full border border-[color:var(--accent-purple)]"
                      style={{ animationDelay: "-2s" }}
                    />
                  </>
                )}
                <span className="glass-inset grid h-24 w-24 place-items-center rounded-full text-blue">
                  <ScanSearch className="h-9 w-9" />
                </span>
              </div>
            </div>

            <ol className="space-y-2" aria-live="polite">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-3 text-sm transition-opacity duration-300"
                  style={{ opacity: i <= step ? 1 : 0.4 }}
                >
                  {i < step ? (
                    <CheckCircle2 className="h-[18px] w-[18px] text-success" aria-hidden />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-[18px] w-[18px] place-items-center"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${i === step ? "bg-[color:var(--accent-blue)]" : "bg-[color:var(--glass-border)]"}`}
                      />
                    </span>
                  )}
                  <span className={i <= step ? "text-ink" : "text-ink-2"}>{t(s)}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div>
            <DialogTitle>{t("dialog.complete")}</DialogTitle>
            <DialogDescription>
              {t("dialog.saved", { count: history.length })}
            </DialogDescription>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing score={result.score} size={148} stroke={12} />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <Pill tone={labelTone[result.label]}>{t(`scoreLabel.${result.label}`)}</Pill>
                <p className="tabular mt-2 text-sm text-ink-2">
                  {delta === null
                    ? t("dialog.first")
                    : delta === 0
                      ? t("dialog.same")
                      : t(delta > 0 ? "dialog.up" : "dialog.down", {
                          count: Math.abs(delta),
                          points: tp("points", Math.abs(delta)),
                        })}
                </p>
                {result.coverage < 1 && (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                    {t("dialog.coverage", { pct: Math.round(result.coverage * 100) })}
                  </p>
                )}
              </div>
            </div>

            {recs.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-[13px] font-semibold text-ink">{t("dialog.fixFirst")}</h4>
                <ul className="space-y-2">
                  {recs.map((c) => (
                    <li key={c.id} className="glass-inset flex gap-3 p-3 text-[13px] leading-relaxed text-ink-2">
                      <span
                        aria-hidden
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: severityVar[c.severity!] }}
                      />
                      <span>
                        <span className="font-medium text-ink">{c.label}</span>
                        <span className="text-xs"> · {t(`severity.${c.severity!}`)}</span>
                        <br />
                        {c.recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => downloadReport(result, history)}>
                <Download className="h-4 w-4" />
                {t("reports.download")}
              </Button>
              {result.coverage < 1 ? (
                <Button asChild variant="primary" onClick={() => setDialogOpen(false)}>
                  <Link href="/audit#checklist">
                    {t("dialog.finish")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant="primary">{t("dialog.done")}</Button>
                </DialogClose>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
