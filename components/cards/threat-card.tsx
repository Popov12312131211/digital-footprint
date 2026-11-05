"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotion } from "framer-motion";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { CardLoading, severityVar } from "@/components/common";
import { GlassTooltip } from "@/components/chart-tooltip";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { SEVERITIES, totalIssues, type Severity } from "@/lib/audit";
import { cn } from "@/lib/utils";

export function ThreatCard({ className }: { className?: string }) {
  const { current } = useAudit();
  const { t, tp } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState<Severity | null>(null);

  const total = current ? totalIssues(current.counts) : 0;
  const slices = current
    ? SEVERITIES.filter((s) => current.counts[s] > 0).map((s) => ({
        key: s,
        name: t(`severity.${s}`),
        value: current.counts[s],
      }))
    : [];

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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={total === 0 ? [{ key: "none", name: t("threat.noIssues"), value: 1 }] : slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={total === 0 ? 0 : 4}
                  cornerRadius={8}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={!reduce}
                  animationDuration={900}
                  onMouseEnter={(_, i) => total > 0 && setActive(slices[i]?.key ?? null)}
                  onMouseLeave={() => setActive(null)}
                >
                  {total === 0 ? (
                    <Cell fill="var(--success)" fillOpacity={0.35} />
                  ) : (
                    slices.map((s) => (
                      <Cell
                        key={s.key}
                        fill={severityVar[s.key]}
                        fillOpacity={active && active !== s.key ? 0.3 : 1}
                        style={{ transition: "fill-opacity 0.2s", outline: "none" }}
                      />
                    ))
                  )}
                </Pie>
                {total > 0 && (
                  <Tooltip
                    content={(p) => (
                      <GlassTooltip {...p} value={(v) => `${String(v)} ${tp("issue", Number(v))}`} />
                    )}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
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
