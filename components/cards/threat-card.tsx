"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { CardLoading, severityVar } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { SEVERITIES, totalIssues, type Severity } from "@/lib/audit";
import { cn } from "@/lib/utils";

const ThreatPieChart = dynamic(
  () => import("@/components/charts/threat-pie").then((m) => m.ThreatPieChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-full bg-white/5" />,
  },
);

export function ThreatCard({ className }: { className?: string }) {
  const { current } = useAudit();
  const { t, tp } = useI18n();
  const [active, setActive] = React.useState<Severity | null>(null);

  const total = current ? totalIssues(current.counts) : 0;
  const slices = React.useMemo(
    () =>
      current
        ? SEVERITIES.filter((s) => current.counts[s] > 0).map((s) => ({
            key: s,
            name: t(`severity.${s}`),
            value: current.counts[s],
          }))
        : [],
    [current, t],
  );

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<ShieldAlert className="h-5 w-5" />}
        title={t("threat.title")}
        description={t("threat.desc")}
        tint="warning"
      />

      {!current ? (
        <CardLoading rows={5} />
      ) : (
        <div className="space-y-5">
          <div className="relative mx-auto h-[176px] w-[176px]">
            <ThreatPieChart slices={slices} total={total} active={active} onActive={setActive} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              {total === 0 ? (
                <CheckCircle2 className="h-9 w-9 text-success" aria-hidden />
              ) : (
                <div>
                  <span className="tabular block font-display text-4xl font-semibold leading-none text-ink">
                    {total}
                  </span>
                  <span className="mt-1 block text-xs text-ink-2">
                    {tp("issue", total)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ul className="space-y-1.5">
            {SEVERITIES.map((s) => (
              <li
                key={s}
                onMouseEnter={() => current.counts[s] > 0 && setActive(s)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-colors",
                  active === s && "bg-white/10 [[data-theme=light]_&]:bg-black/5",
                )}
              >
                <span className="flex items-center gap-2.5 text-ink">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: severityVar[s] }}
                  />
                  {t(`severity.${s}`)}
                </span>
                <span className="tabular font-semibold text-ink">{current.counts[s]}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-relaxed text-ink-2">
            {total === 0 ? t("threat.allClear") : t("threat.note")}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
