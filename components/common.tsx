"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Check, CheckStatus, Severity } from "@/lib/audit";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const toneVar: Record<Tone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--accent-blue)",
  neutral: "var(--text-secondary)",
};

export const severityVar: Record<Severity, string> = {
  critical: "var(--sev-critical)",
  high: "var(--sev-high)",
  medium: "var(--sev-medium)",
  low: "var(--sev-low)",
};

export function statusTone(status: CheckStatus): Tone {
  switch (status) {
    case "pass":
      return "success";
    case "warn":
      return "warning";
    case "fail":
      return "danger";
    case "info":
      return "info";
    default:
      return "neutral";
  }
}

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const c = toneVar[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        color: c,
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${c} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", className)}
      style={{ background: color, boxShadow: `0 0 10px ${color}` }}
    />
  );
}

/** Label / value list. Wrap rows in <dl>. */
export function Row({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--glass-border)] py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <dt className="shrink-0 text-[13px] text-ink-2">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium text-ink">
        <div className="break-words">{children}</div>
        {hint && <div className="mt-0.5 text-xs font-normal text-ink-2">{hint}</div>}
      </dd>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-white/10 [[data-theme=light]_&]:bg-black/5", className)}
    />
  );
}

export function CardLoading({ rows = 5 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div className="space-y-3" role="status" aria-label={t("common.reading")}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-5" />
      ))}
    </div>
  );
}

export function findCheck(checks: Check[] | undefined, id: string): Check | undefined {
  return checks?.find((c) => c.id === id);
}
