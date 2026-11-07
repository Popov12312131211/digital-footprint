"use client";

import Link from "next/link";
import { Download, FileCode2, FileJson, FileSpreadsheet, Lock, Sparkles } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { HistoryCard } from "@/components/cards/history-card";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common";
import { useToast } from "@/components/ui/toast";
import { useAudit } from "@/lib/audit-context";
import { useAccount } from "@/lib/account";
import { useActivity } from "@/lib/activity";
import { useMonitoring } from "@/lib/monitoring";
import { useI18n } from "@/lib/i18n";
import {
  downloadAdvancedReport,
  downloadCsvReport,
  downloadHtmlReport,
  downloadReport,
  type ReportExtras,
} from "@/lib/report";
import { planOf } from "@/lib/plans";

export default function ReportsPage() {
  const { current, history } = useAudit();
  const { plan, planDef, canUse, referral, recordReport } = useAccount();
  const { items: activity, add: addActivity } = useActivity();
  const { items: domains } = useMonitoring();
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const extras: ReportExtras = {
    plan: t(planDef.nameKey),
    activity,
    domains,
    referral: referral ? { code: referral.code, invited: referral.invited, credits: referral.credits } : null,
  };

  const labels = {
    generated: t("reports.generatedAt"),
    score: t("reports.score"),
    coverage: t("reports.coverage"),
    checks: t("passwords.checksTitle"),
    history: t("history.title"),
    recommendations: t("privacy.recs"),
    plan: t("reports.plan"),
    activity: t("reports.activity"),
    domains: t("reports.monitoring"),
    referral: t("reports.referral"),
    device: t("device.title"),
    privacy: t("privacy.title"),
    network: t("network.title"),
    issues: t("reports.issues"),
    noData: t("reports.noAuditData"),
    status: t("reports.status"),
    detail: t("reports.detail"),
    domain: t("reports.domain"),
    dns: t("reports.dns"),
    breaches: t("reports.breaches"),
    date: t("reports.date"),
    type: t("reports.type"),
    event: t("reports.event"),
    statusPass: t("audit.status.pass"),
    statusWarn: t("audit.status.warn"),
    statusFail: t("audit.status.fail"),
    statusInfo: t("audit.status.info"),
    statusUnknown: t("audit.status.unknown"),
    generatedLocally: t("reports.generatedLocally"),
    invited: t("reports.invited"),
    credits: t("reports.credits"),
    lang: locale,
  };

  const run = (build: () => void) => {
    if (!current) {
      toast({ title: t("reports.requireAudit"), tone: "warning" });
      return;
    }
    if (!recordReport()) {
      toast({
        title: t("toast.reportLimit"),
        description: t("toast.reportLimitDesc", { count: planOf(plan).limits.savedReports ?? 0 }),
        tone: "warning",
      });
      return;
    }
    build();
    addActivity({
      kind: "report",
      titleKey: "notification.report.title",
      descKey: "notification.report.desc",
      params: { report: t("reports.title") },
      href: "/reports",
    });
    toast({ title: t("toast.reportTitle"), description: t("toast.reportDesc"), tone: "success" });
  };

  return (
    <>
      <PageTitle
        title={t("reports.title")}
        description={t("reports.desc")}
        action={<Pill tone="info">{t(planDef.nameKey)}</Pill>}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <GlassCard interactive={false}>
          <CardHeader
            icon={<FileJson className="h-5 w-5" />}
            title={t("reports.basicTitle")}
            description={t("reports.basicDesc")}
            tint="blue"
            action={<Pill tone="neutral">{t("plan.free")}</Pill>}
          />
          <p className="text-[13px] leading-relaxed text-ink-2">{t("reports.sections")}: {t("reports.score")}, {t("history.title")}</p>
          <Button
            variant="primary"
            className="mt-4 w-full"
            disabled={!current}
            onClick={() =>
              run(() => downloadReport(current, history))
            }
          >
            <Download className="h-4 w-4" /> {t("reports.downloadJson")}
          </Button>
          {!current && <p className="mt-2 text-xs text-ink-2">{t("reports.requireAudit")}</p>}
        </GlassCard>

        <GlassCard
          interactive={false}
          className={!canUse("advancedReports") ? "opacity-90" : undefined}
        >
          <CardHeader
            icon={canUse("advancedReports") ? <FileJson className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            title={t("reports.fullTitle")}
            description={t("reports.fullDesc")}
            tint="purple"
            action={<Pill tone={canUse("advancedReports") ? "success" : "neutral"}>{t("reports.premium")}</Pill>}
          />
          <p className="text-[13px] leading-relaxed text-ink-2">
            {t("reports.activity")}, {t("reports.monitoring")}, {t("reports.referral")}
          </p>
          {canUse("advancedReports") ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              disabled={!current}
              onClick={() => run(() => downloadAdvancedReport(current, history, extras))}
            >
              <Download className="h-4 w-4" /> {t("reports.downloadJson")}
            </Button>
          ) : (
            <Button asChild variant="secondary" className="mt-4 w-full">
              <Link href="/pricing">
                <Sparkles className="h-4 w-4" /> {t("reports.gatePremium")}
              </Link>
            </Button>
          )}
        </GlassCard>

        <GlassCard
          interactive={false}
          className={!canUse("extendedReports") ? "opacity-90" : undefined}
        >
          <CardHeader
            icon={canUse("extendedReports") ? <FileCode2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            title={t("reports.extendedTitle")}
            description={t("reports.extendedDesc")}
            tint="cyan"
            action={<Pill tone={canUse("extendedReports") ? "success" : "neutral"}>{t("reports.extended")}</Pill>}
          />
          <p className="text-[13px] leading-relaxed text-ink-2">
            {t("reports.downloadHtml")} · {t("reports.downloadCsv")}
          </p>
          {canUse("extendedReports") ? (
            <div className="mt-4 grid gap-2">
              <Button
                variant="secondary"
                disabled={!current}
                onClick={() => run(() => downloadHtmlReport(current, history, extras, labels))}
              >
                <FileCode2 className="h-4 w-4" /> {t("reports.downloadHtml")}
              </Button>
              <Button
                variant="ghost"
                disabled={!current}
                onClick={() => run(() => downloadCsvReport(current, history, extras))}
              >
                <FileSpreadsheet className="h-4 w-4" /> {t("reports.downloadCsv")}
              </Button>
            </div>
          ) : (
            <Button asChild variant="secondary" className="mt-4 w-full">
              <Link href="/pricing">
                <Sparkles className="h-4 w-4" /> {t("reports.gatePlus")}
              </Link>
            </Button>
          )}
        </GlassCard>
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs leading-relaxed text-ink-2">
        <Download className="h-3.5 w-3.5" /> {t("reports.demoNote")}
      </p>

      <div className="mt-6">
        <HistoryCard rows={30} showLink={false} />
      </div>
    </>
  );
}
