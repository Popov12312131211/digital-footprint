"use client";

import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import { planOf, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function UpgradeGate({
  required,
  titleKey,
  descKey,
  className,
}: {
  required: PlanId;
  titleKey: string;
  descKey: string;
  className?: string;
}) {
  const { planDef } = useAccount();
  const { t } = useI18n();
  const requiredDef = planOf(required);

  return (
    <GlassCard interactive={false} className={cn("overflow-hidden", className)}>
      <div className="flex items-start gap-4">
        <span className="glass-inset grid h-12 w-12 shrink-0 place-items-center text-purple">
          <Lock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{t(titleKey)}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t(descKey)}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {["gate.benefit1", "gate.benefit2", "gate.benefit3"].map((key) => (
          <li key={key} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {t(key)}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-2">
          {t("gate.current", { plan: t(planDef.nameKey) })} · {t("gate.requires", { plan: t(requiredDef.nameKey) })}
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/pricing">
            <Sparkles className="h-4 w-4" />
            {t("gate.cta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </GlassCard>
  );
}
