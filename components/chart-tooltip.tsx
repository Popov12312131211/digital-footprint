import * as React from "react";

interface GlassTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: unknown; value?: unknown; payload?: unknown }>;
  label?: unknown;
  title?: (label: unknown, item: unknown) => string;
  value?: (value: unknown, name: unknown) => string;
}

/** Tooltip body for Recharts, styled as a small glass panel. */
export function GlassTooltip({ active, payload, label, title, value }: GlassTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0];
  const heading = title ? title(label, first.payload) : label != null ? String(label) : "";

  return (
    <div className="glass rounded-2xl px-3.5 py-2.5 text-xs shadow-none">
      {heading && <p className="mb-1 font-medium text-ink">{heading}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tabular text-ink-2">
          {p.name != null && typeof p.name !== "object" ? `${String(p.name)}: ` : ""}
          <span className="font-semibold text-ink">
            {value ? value(p.value, p.name) : String(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}
