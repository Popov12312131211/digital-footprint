"use client";

import { PageTitle } from "@/components/page-title";
import { PrivacyCard } from "@/components/cards/privacy-card";
import { NetworkCard } from "@/components/cards/network-card";
import { DeviceCard } from "@/components/cards/device-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Dot, Pill, severityVar, statusTone } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { current } = useAudit();
  const { t } = useI18n();
  const browserChecks = current?.checks.filter((c) => c.source === "browser") ?? [];

  return (
    <>
      <PageTitle
        title={t("privacyPage.title")}
        description={t("privacyPage.desc")}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <PrivacyCard />
        <NetworkCard />
        <DeviceCard />

        <GlassCard interactive={false} className="sm:col-span-2 lg:col-span-3">
          <h3 className="mb-4 font-display text-[15px] font-semibold text-ink">{t("privacyPage.detail")}</h3>
          <ul className="grid gap-2.5 md:grid-cols-2">
            {browserChecks.map((c) => (
              <li key={c.id} className="glass-inset p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{c.label}</p>
                  <Pill tone={statusTone(c.status)}>
                    {c.status === "pass"
                      ? t("privacyPage.good")
                      : c.status === "warn"
                        ? t("privacyPage.review")
                        : c.status === "fail"
                          ? t("privacyPage.fix")
                          : t("privacyPage.info")}
                  </Pill>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{c.detail}</p>
                {c.recommendation && c.severity && (
                  <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-ink">
                    <Dot color={severityVar[c.severity]} className="mt-1.5" />
                    <span>
                      <span className="font-medium">{t(`severity.${c.severity}`)}.</span> {c.recommendation}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </>
  );
}
