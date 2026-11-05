"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lift + glow on hover and a light sheen that follows the pointer. */
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = true, onPointerMove, ...props }, ref) => {
    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive) {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      onPointerMove?.(e);
    };

    return (
      <div
        ref={ref}
        onPointerMove={handleMove}
        className={cn("glass p-5 sm:p-6", interactive && "glass-hover", className)}
        {...props}
      />
    );
  },
);
GlassCard.displayName = "GlassCard";

interface CardHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tint?: "blue" | "purple" | "cyan" | "success" | "warning";
}

const tints: Record<NonNullable<CardHeaderProps["tint"]>, string> = {
  blue: "text-blue",
  purple: "text-purple",
  cyan: "text-cyan",
  success: "text-success",
  warning: "text-warning",
};

export function CardHeader({ icon, title, description, action, tint = "blue" }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn("glass-inset grid h-10 w-10 shrink-0 place-items-center", tints[tint])}
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h3>
          {description && <p className="mt-0.5 truncate text-[13px] text-ink-2">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
