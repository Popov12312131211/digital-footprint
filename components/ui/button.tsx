import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[transform,box-shadow,background,border-color] duration-300 ease-out",
    "active:scale-[0.965] active:duration-100",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        /* translucent blue-violet with a soft glow */
        primary: [
          "rounded-full border border-white/30 text-white",
          "bg-[linear-gradient(135deg,rgba(79,107,240,0.92),rgba(124,92,232,0.9))]",
          "backdrop-blur-xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-8px_16px_rgba(255,255,255,0.06),0_8px_28px_-6px_rgba(120,149,255,0.65),0_2px_6px_rgba(0,0,0,0.25)]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-8px_16px_rgba(255,255,255,0.08),0_12px_38px_-4px_rgba(150,130,255,0.8),0_2px_6px_rgba(0,0,0,0.25)]",
          "hover:-translate-y-0.5",
        ],
        /* clear glass with a hairline border */
        secondary: [
          "rounded-full border border-[color:var(--glass-border)] text-ink",
          "bg-[linear-gradient(150deg,var(--glass-primary),var(--glass-secondary))]",
          "backdrop-blur-xl",
          "shadow-[inset_0_1px_0_var(--glass-highlight),0_6px_20px_-8px_var(--shadow-2)]",
          "hover:border-[color:color-mix(in_srgb,var(--accent-blue)_50%,var(--glass-border))]",
          "hover:bg-[linear-gradient(150deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))]",
        ],
        ghost: [
          "rounded-full text-ink-2",
          "hover:bg-white/10 hover:text-ink",
          "[[data-theme=light]_&]:hover:bg-black/5",
        ],
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
