import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "glass-inset h-11 w-full rounded-[14px] px-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow]",
        "placeholder:text-ink-2/70 focus:border-[color:var(--accent-blue)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-blue)_22%,transparent)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-2">{hint}</span>
      ) : null}
    </label>
  );
}
