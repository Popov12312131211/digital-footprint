"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck, UserRound, Fingerprint } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CardLoading, Pill } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { CHECKLIST, recommendations, type ChecklistGroup } from "@/lib/audit";

const GROUPS: { id: ChecklistGroup; icon: React.ReactNode }[] = [
  { id: "two-factor", icon: <ShieldCheck className="h-[18px] w-[18px]" /> },
  { id: "passwords", icon: <KeyRound className="h-[18px] w-[18px]" /> },
  { id: "accounts", icon: <UserRound className="h-[18px] w-[18px]" /> },
];

export function FootprintCard({ className }: { className?: string }) {
  const { current, answers } = useAudit();
  const { t } = useI18n();

  const answered = CHECKLIST.filter((i) => answers[i.id] !== undefined).length;
  const recs = current ? recommendations(current).filter((c) => c.source === "self-reported") : [];

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<Fingerprint className="h-5 w-5" />}
        title={t("footprint.title")}
        description={t("footprint.desc", { answered, total: CHECKLIST.length })}
        tint="success"
      />

      {!current ? (
        <CardLoading rows={5} />
      ) : (
        <>
          <ul className="space-y-2.5">
            {GROUPS.map(({ id, icon }) => {
              const items = CHECKLIST.filter((i) => i.group === id);
              const yes = items.filter((i) => answers[i.id] === true).length;
              const no = items.filter((i) => answers[i.id] === false).length;
              const state =
                yes === items.length ? (
                  <Pill tone="success">{t("footprint.done")}</Pill>
                ) : no > 0 ? (
                  <Pill tone="danger">{t("footprint.toFix", { count: no })}</Pill>
                ) : yes > 0 ? (
                  <Pill tone="info">{t("footprint.of", { yes, total: items.length })}</Pill>
                ) : (
                  <Pill tone="neutral">{t("footprint.notAnswered")}</Pill>
                );
              return (
                <li key={id} className="glass-inset flex items-center justify-between gap-3 p-3.5">
                  <span className="flex min-w-0 items-center gap-3 text-[13px] font-medium text-ink">
                    <span className="text-ink-2" aria-hidden>
                      {icon}
                    </span>
                    <span className="truncate">{t(`group.${id}`)}</span>
                  </span>
                  {state}
                </li>
              );
            })}
          </ul>

          <div className="mt-5">
            <h4 className="mb-2 text-[13px] font-semibold text-ink">{t("footprint.recs")}</h4>
            {recs.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-ink-2">
                {answered === 0 ? t("footprint.empty") : t("footprint.noGaps")}
              </p>
            ) : (
              <ul className="space-y-2">
                {recs.slice(0, 2).map((c) => (
                  <li key={c.id} className="glass-inset p-3 text-[13px] leading-relaxed text-ink-2">
                    <span className="text-xs font-medium text-ink">{t(`severity.${c.severity!}`)}</span>
                    <br />
                    {c.recommendation}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button asChild variant="secondary" size="sm" className="mt-5 w-full">
            <Link href="/audit#checklist">
              {answered === 0 ? t("footprint.start") : t("footprint.open")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </>
      )}
    </GlassCard>
  );
}
