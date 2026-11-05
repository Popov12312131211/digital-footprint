"use client";

import { ArrowDownRight, ArrowUpRight, Gauge, Minus, Play } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CardLoading, Pill, type Tone } from "@/components/common";
import { ScoreRing } from "@/components/score-ring";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import type { ScoreLabel } from "@/lib/audit";
import { formatDate } from "@/lib/utils";

const labelTone: Record<ScoreLabel, Tone> = {
  Strong: "success",
  Good: "info",
  "Needs attention": "warning",
  "At risk": "danger",
};

export function ScoreCard({ className }: { className?: string }) {
  const { current, previous, startAudit, scanning } = useAudit();
  const { t } = useI18n();

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<Gauge className="h-5 w-5" />}
        title={t("score.title")}
        description={t("score.desc")}
      />

      {!current ? (
        <CardLoading rows={4} />
      ) : (
        <div className="flex flex-col items-center gap-5">
          <ScoreRing score={current.score} />

          <div className="flex flex-col items-center gap-2 text-center">
            <Pill tone={labelTone[current.label]}>{t(`scoreLabel.${current.label}`)}</Pill>
            <Delta score={current.score} previous={previous} />
          </div>

          <div className="w-full">
            <div className="mb-1.5 flex justify-between text-xs text-ink-2">
              <span>{t("score.checksAnswered")}</span>
              <span className="tabular">{Math.round(current.coverage * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10 [[data-theme=light]_&]:bg-black/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cyan),var(--accent-blue),var(--accent-purple))] transition-[width] duration-700"
                style={{ width: `${Math.round(current.coverage * 100)}%` }}
              />
            </div>
            {current.coverage < 1 && (
              <p className="mt-2 text-xs leading-relaxed text-ink-2">
                {t("score.completeHint")}
              </p>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={startAudit} disabled={scanning} className="w-full">
            <Play className="h-3.5 w-3.5" />
            {scanning ? t("action.scanning") : t("action.runSave")}
          </Button>
        </div>
      )}
    </GlassCard>
  );
}

function Delta({
  score,
  previous,
}: {
  score: number;
  previous: { score: number; timestamp: number } | null;
}) {
  const { t, locale } = useI18n();
  if (!previous) {
    return (
      <p className="max-w-[24ch] text-xs leading-relaxed text-ink-2">
        {t("score.noCompare")}
      </p>
    );
  }
  const d = score - previous.score;
  const Icon = d > 0 ? ArrowUpRight : d < 0 ? ArrowDownRight : Minus;
  const color = d > 0 ? "var(--success)" : d < 0 ? "var(--danger)" : "var(--text-secondary)";
  return (
    <p className="tabular flex items-center gap-1.5 text-xs text-ink-2">
      <Icon className="h-4 w-4" style={{ color }} aria-hidden />
      <span style={{ color }} className="font-semibold">
        {d > 0 ? `+${d}` : d === 0 ? t("score.noChange") : d}
      </span>
      <span>{t("score.since", { date: formatDate(previous.timestamp, locale) })}</span>
    </p>
  );
}
