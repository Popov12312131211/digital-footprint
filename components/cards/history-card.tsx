"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, History, Play } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { labelFor, totalIssues } from "@/lib/audit";
import { formatDate, formatDateTime } from "@/lib/utils";

const HistoryAreaChart = dynamic(
  () => import("@/components/charts/history-area").then((m) => m.HistoryAreaChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />,
  },
);

export function HistoryCard({
  className,
  rows = 4,
  showLink = true,
}: {
  className?: string;
  rows?: number;
  showLink?: boolean;
}) {
  const { history, startAudit, scanning, storageOk } = useAudit();
  const { t, tp, locale } = useI18n();

  const data = React.useMemo(
    () =>
      history.map((h) => ({
        ts: h.timestamp,
        label: formatDate(h.timestamp, locale),
        score: h.score,
      })),
    [history, locale],
  );
  const recent = React.useMemo(() => [...history].reverse().slice(0, rows), [history, rows]);

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<History className="h-5 w-5" />}
        title={t("history.title")}
        description={
          history.length > 0
            ? t("history.desc", { count: history.length })
            : t("history.savedOnly")
        }
        tint="purple"
        action={
          showLink && history.length > 0 ? (
            <Link
              href="/reports"
              className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-blue hover:opacity-80"
            >
              {t("history.all")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      />

      {history.length === 0 ? (
        <div className="grid place-items-center gap-4 py-8 text-center">
          <p className="max-w-[34ch] text-sm leading-relaxed text-ink-2">
            {storageOk ? t("history.empty") : t("history.blocked")}
          </p>
          <Button variant="primary" size="sm" onClick={startAudit} disabled={scanning}>
            <Play className="h-3.5 w-3.5" />
            {t("history.runFirst")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-[220px] min-w-0">
            <HistoryAreaChart data={data} />
          </div>

          <ol className="space-y-2">
            {recent.map((h, i) => {
              const prev = recent[i + 1];
              const d = prev ? h.score - prev.score : null;
              return (
                <li key={h.id} className="glass-inset flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{formatDateTime(h.timestamp, locale)}</p>
                    <p className="text-xs text-ink-2">
                      {totalIssues(h.counts)} {tp("issue", totalIssues(h.counts))} ·{" "}
                      {t(`scoreLabel.${labelFor(h.score)}`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d !== null && d !== 0 && (
                      <Pill tone={d > 0 ? "success" : "danger"} className="tabular">
                        {d > 0 ? `+${d}` : d}
                      </Pill>
                    )}
                    <span className="tabular font-display text-lg font-semibold text-ink">{h.score}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </GlassCard>
  );
}
