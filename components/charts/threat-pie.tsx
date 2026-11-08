"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotion } from "framer-motion";
import { GlassTooltip } from "@/components/chart-tooltip";
import { severityVar } from "@/components/common";
import { useI18n } from "@/lib/i18n";
import type { Severity } from "@/lib/audit";

export interface ThreatSlice {
  key: Severity;
  name: string;
  value: number;
}

export function ThreatPieChart({
  slices,
  total,
  active,
  onActive,
}: {
  slices: ThreatSlice[];
  total: number;
  active: Severity | null;
  onActive: (severity: Severity | null) => void;
}) {
  const { t, tp } = useI18n();
  const reduce = useReducedMotion();

  return (
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
          onMouseEnter={(_, i) => total > 0 && onActive(slices[i]?.key ?? null)}
          onMouseLeave={() => onActive(null)}
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
  );
}
