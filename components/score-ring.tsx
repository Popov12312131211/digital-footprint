"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  caption?: string;
}

/** Circular 0–100 gauge. The arc and the number animate together. */
export function ScoreRing({ score, size = 176, stroke = 14, caption }: ScoreRingProps) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const gid = React.useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const value = useMotionValue(reduce ? score : 0);
  const offset = useTransform(value, (v) => c * (1 - v / 100));
  const text = useTransform(value, (v) => String(Math.round(v)));

  React.useEffect(() => {
    if (reduce) {
      value.set(score);
      return;
    }
    const controls = animate(value, score, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [score, reduce, value]);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={t("score.aria", { score })}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        style={{ filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--accent-blue) 55%, transparent))" }}
      >
        <defs>
          <linearGradient id={`ring-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-cyan)" />
            <stop offset="0.5" stopColor="var(--accent-blue)" />
            <stop offset="1" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <motion.span className="tabular block font-display text-5xl font-semibold leading-none tracking-tight text-ink">
            {text}
          </motion.span>
          <span className="mt-1.5 block text-xs text-ink-2">{caption ?? t("score.outOf")}</span>
        </div>
      </div>
    </div>
  );
}
