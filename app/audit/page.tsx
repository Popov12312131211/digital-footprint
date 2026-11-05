"use client";

import { Play } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Checklist } from "@/components/checklist";
import { ScoreCard } from "@/components/cards/score-card";
import { ThreatCard } from "@/components/cards/threat-card";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill, Dot, severityVar, statusTone } from "@/components/common";
import { ListChecks } from "lucide-react";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { recommendations } from "@/lib/audit";

export default function AuditPage() {
  const { current, startAudit, scanning } = useAudit();
  const { t } = useI18n();
  const recs = current ? recommendations(current) : [];

  return (
    <>
      <PageTitle
        title={t("audit.title")}
        description={t("audit.desc")}
        action={
          <Button variant="primary" onClick={startAudit} disabled={scanning}>
            <Play className="h-4 w-4" />
            {scanning ? t("action.scanning") : t("action.runSave")}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="space-y-5 lg:space-y-6">
          <GlassCard interactive={false} id="checklist" className="scroll-mt-28">
            <CardHeader
              icon={<ListChecks className="h-5 w-5" />}
              title={t("audit.checklistTitle")}
              description={t("audit.checklistDesc")}
              tint="success"
            />
            <Checklist />
          </GlassCard>

          <GlassCard interactive={false}>
            <CardHeader
              icon={<ListChecks className="h-5 w-5" />}
              title={t("audit.allChecks")}
              description={
                current
                  ? t("audit.checksCount", { count: current.checks.length })
                  : t("header.reading")
              }
              tint="blue"
            />
            <ul className="space-y-2">
              {current?.checks.map((c) => (
                <li key={c.id} className="glass-inset flex items-start justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{c.label}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{c.detail}</p>
                  </div>
                  <Pill tone={statusTone(c.status)}>{t(`audit.status.${c.status}`)}</Pill>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <div className="space-y-5 lg:space-y-6">
          <ScoreCard />
          <ThreatCard />
          {recs.length > 0 && (
            <GlassCard interactive={false}>
              <h3 className="mb-3 font-display text-[15px] font-semibold text-ink">{t("audit.nextSteps")}</h3>
              <ul className="space-y-2.5">
                {recs.map((c) => (
                  <li key={c.id} className="flex gap-3 text-[13px] leading-relaxed text-ink-2">
                    <Dot color={severityVar[c.severity!]} className="mt-1.5" />
                    <span>
                      <span className="font-medium text-ink">{t(`severity.${c.severity!}`)}.</span> {c.recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      </div>
    </>
  );
}
