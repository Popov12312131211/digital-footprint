"use client";

import * as React from "react";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { CHECKLIST, type ChecklistGroup } from "@/lib/audit";
import { cn } from "@/lib/utils";

const GROUPS: ChecklistGroup[] = ["two-factor", "passwords", "accounts"];

function Choice({
  selected,
  tone,
  onClick,
  children,
}: {
  selected: boolean;
  tone: "success" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const c = tone === "success" ? "var(--success)" : "var(--danger)";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-9 min-w-[56px] rounded-full border px-4 text-[13px] font-medium transition-all duration-200 active:scale-95",
        !selected &&
          "border-[color:var(--glass-border)] text-ink-2 hover:text-ink hover:border-[color:color-mix(in_srgb,var(--text-secondary)_50%,transparent)]",
      )}
      style={
        selected
          ? {
              color: c,
              borderColor: `color-mix(in srgb, ${c} 55%, transparent)`,
              background: `color-mix(in srgb, ${c} 16%, transparent)`,
              boxShadow: `0 0 18px -4px color-mix(in srgb, ${c} 60%, transparent)`,
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

/** Self-reported account checklist. Pressing the selected answer again clears it. */
export function Checklist() {
  const { answers, answer } = useAudit();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {GROUPS.map((g) => (
        <section key={g} aria-labelledby={`grp-${g}`}>
          <h4 id={`grp-${g}`} className="mb-2.5 font-display text-sm font-semibold text-ink">
            {t(`group.${g}`)}
          </h4>
          <ul className="space-y-2.5">
            {CHECKLIST.filter((i) => i.group === g).map((item) => {
              const a = answers[item.id];
              return (
                <li
                  key={item.id}
                  className="glass-inset flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-ink">
                      {t(`checklistItem.${item.id}.label`)}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-2">
                      {t(`checklistItem.${item.id}.hint`)}
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label={t(`checklistItem.${item.id}.label`)}
                    className="flex shrink-0 gap-2"
                  >
                    <Choice
                      selected={a === true}
                      tone="success"
                      onClick={() => answer(item.id, a === true ? undefined : true)}
                    >
                      {t("checklist.yes")}
                    </Choice>
                    <Choice
                      selected={a === false}
                      tone="danger"
                      onClick={() => answer(item.id, a === false ? undefined : false)}
                    >
                      {t("checklist.no")}
                    </Choice>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
