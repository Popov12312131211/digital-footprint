"use client";

import { Laptop } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { CardLoading, Row } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";

export function DeviceCard({ className }: { className?: string }) {
  const { current } = useAudit();
  const { t, tp } = useI18n();
  const d = current?.snapshot.device;

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<Laptop className="h-5 w-5" />}
        title={t("device.title")}
        description={t("device.desc")}
        tint="blue"
      />

      {!current || !d ? (
        <CardLoading rows={6} />
      ) : (
        <>
          <dl>
            <Row label={t("device.browser")}>
              {d.browser} {d.browserVersion}
            </Row>
            <Row label={t("device.os")}>{d.os}</Row>
            <Row label={t("device.screen")}>
              <span className="tabular">
                {d.screen} @ {d.pixelRatio}x
              </span>
            </Row>
            <Row label={t("device.language")}>{d.languages.slice(0, 3).join(", ")}</Row>
            <Row label={t("device.timezone")} hint={d.utcOffset}>
              {d.timezone}
            </Row>
            <Row label={t("device.hardware")}>
              <span className="tabular">
                {d.cores != null ? `${d.cores} ${tp("cores", d.cores)}` : t("device.coresHidden")}
                {d.memoryGb != null && ` · ${d.memoryGb} GB`}
                {d.touchPoints > 0 && ` · ${t("device.touch")}`}
              </span>
            </Row>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-ink-2">
            {t("device.note")}
          </p>
        </>
      )}
    </GlassCard>
  );
}
