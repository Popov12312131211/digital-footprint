"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { t } = useI18n();
  return (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="anim-fade fixed inset-0 z-50 bg-[color:var(--background)]/55 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Centered with inset + auto margins (not translate) so the open animation can use transform.
        "anim-glass glass fixed inset-0 z-50 m-auto h-fit w-[calc(100vw-2rem)] max-w-lg",
        "max-h-[85dvh] overflow-y-auto p-6 sm:p-7",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="glass-inset absolute right-4 top-4 grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:text-ink"
        aria-label={t("common.close")}
      >
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = "DialogContent";

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("pr-10 font-display text-xl font-semibold tracking-tight text-ink", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1.5 text-sm leading-relaxed text-ink-2", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
