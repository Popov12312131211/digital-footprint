"use client";

import Link from "next/link";
import { ArrowRight, EyeOff } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { CardLoading, Pill, Row, findCheck } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { recommendations } from "@/lib/audit";

export function PrivacyCard({ className }: { className?: string }) {
  const { current } = useAudit();
  const { t } = useI18n();

  const recs = current ? recommendations(current).filter((c) => c.source === "browser") : [];
  const gpc = findCheck(current?.checks, "gpc");

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<EyeOff className="h-5 w-5" />}
        title={t("privacy.title")}
        description={t("privacy.desc")}
        tint="purple"
      />

      {!current ? (
        <CardLoading rows={6} />
      ) : (
        <>
          <dl>
            <Row label={t("privacy.browser")}>
              {current.snapshot.device.browser} {current.snapshot.device.browserVersion}
            </Row>
            <Row label={t("privacy.webrtc")}>
              {current.snapshot.privacy.webrtc ? (
                <Pill tone="warning">{t("privacy.available")}</Pill>
              ) : (
                <Pill tone="success">{t("privacy.unavailable")}</Pill>
              )}
            </Row>
            <Row label={t("privacy.cookies")}>
              {current.snapshot.privacy.cookiesEnabled ? (
                <Pill tone="info">{t("privacy.enabled")}</Pill>
              ) : (
                <Pill tone="neutral">{t("privacy.disabled")}</Pill>
              )}
            </Row>
            <Row label={t("privacy.storage")}>
              {current.snapshot.privacy.localStorage ? (
                <Pill tone="info">{t("privacy.storageAvailable")}</Pill>
              ) : (
                <Pill tone="neutral">{t("privacy.blocked")}</Pill>
              )}
            </Row>
            <Row label={t("privacy.signal")}>
              {gpc?.status === "pass" ? (
                <Pill tone="success">{t("privacy.sent")}</Pill>
              ) : (
                <Pill tone="warning">{t("privacy.notSent")}</Pill>
              )}
            </Row>
          </dl>

          <div className="mt-5">
            <h4 className="mb-2 text-[13px] font-semibold text-ink">{t("privacy.recs")}</h4>
            {recs.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-ink-2">
                {t("privacy.nothing")}
              </p>
            ) : (
              <ul className="space-y-2">
                {recs.slice(0, 2).map((c) => (
                  <li key={c.id} className="glass-inset p-3 text-[13px] leading-relaxed text-ink-2">
                    <span className="font-medium text-ink">{c.label}</span>
                    <span className="text-xs"> · {t(`severity.${c.severity!}`)}</span>
                    <br />
                    {c.recommendation}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/privacy"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue transition-opacity hover:opacity-80"
            >
              {t("privacy.details")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </GlassCard>
  );
}
