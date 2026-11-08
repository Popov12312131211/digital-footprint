"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "framer-motion";
import { GlassTooltip } from "@/components/chart-tooltip";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/utils";

export interface HistoryPoint {
  ts: number;
  label: string;
  score: number;
}

export function HistoryAreaChart({ data }: { data: HistoryPoint[] }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="hist-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent-blue)" stopOpacity={0.45} />
            <stop offset="1" stopColor="var(--accent-purple)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="hist-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--accent-cyan)" />
            <stop offset="1" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--glass-border)" strokeDasharray="3 6" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ stroke: "var(--glass-border)", strokeWidth: 1 }}
          content={(p) => (
            <GlassTooltip
              {...p}
              title={(_, item) => formatDateTime((item as { ts: number }).ts, locale)}
              value={(v) => `${String(v)} / 100`}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="score"
          name={t("history.scoreName")}
          stroke="url(#hist-line)"
          strokeWidth={2.5}
          fill="url(#hist-fill)"
          dot={{ r: 3.5, fill: "var(--accent-blue)", stroke: "var(--background)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--accent-cyan)", stroke: "var(--background)", strokeWidth: 2 }}
          isAnimationActive={!reduce}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
