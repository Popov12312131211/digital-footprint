"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type ToastTone = "success" | "warning" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (t: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const toneStyles: Record<ToastTone, { icon: React.ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-success" />, ring: "var(--success)" },
  warning: { icon: <AlertTriangle className="h-5 w-5 text-warning" />, ring: "var(--warning)" },
  info: { icon: <Info className="h-5 w-5 text-blue" />, ring: "var(--accent-blue)" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  const dismiss = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, tone = "info" }) => {
      const id = ++counter.current;
      setItems((prev) => [...prev.slice(-3), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[20px] p-4"
            >
              <span className="mt-0.5 shrink-0">{toneStyles[item.tone].icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-full p-1 text-ink-2 transition-colors hover:text-ink"
                aria-label={t("common.dismiss")}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
