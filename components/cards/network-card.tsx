"use client";

import * as React from "react";
import { Eye, EyeOff, Globe } from "lucide-react";
import { CardHeader, GlassCard } from "@/components/ui/glass-card";
import { CardLoading, Pill, Row } from "@/components/common";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";

function maskIp(ip: string): string {
  if (ip.includes(":")) return `${ip.split(":")[0]}:••••:••••`;
  const p = ip.split(".");
  return p.length === 4 ? `${p[0]}.•••.•••.${p[3]}` : "••••••";
}

export function NetworkCard({ className }: { className?: string }) {
  const { current } = useAudit();
  const { t } = useI18n();
  const [reveal, setReveal] = React.useState(false);

  const n = current?.snapshot.network;
  const tz = current?.snapshot.device.timezone;

  return (
    <GlassCard className={className}>
      <CardHeader
        icon={<Globe className="h-5 w-5" />}
        title={t("network.title")}
        description={t("network.desc")}
        tint="cyan"
      />

      {!current || !n ? (
        <CardLoading rows={5} />
      ) : (
        <dl>
          <Row
            label={t("network.publicIp")}
            hint={n.publicIp ? undefined : t("network.ipHint")}
          >
            {n.publicIp ? (
              <span className="inline-flex items-center gap-2">
                <span className="tabular">{reveal ? n.publicIp : maskIp(n.publicIp)}</span>
                <button
                  onClick={() => setReveal((v) => !v)}
                  className="rounded-full p-1 text-ink-2 transition-colors hover:text-ink"
                  aria-label={reveal ? t("network.hideIp") : t("network.showIp")}
                  aria-pressed={reveal}
                >
                  {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            ) : (
              <span className="text-ink-2">{t("network.notAvailable")}</span>
            )}
          </Row>

          <Row
            label={t("network.connection")}
            hint={n.effectiveType ? undefined : t("network.connHint")}
          >
            {n.effectiveType ? (
              <span className="tabular">
                {n.effectiveType.toUpperCase()}
                {n.downlinkMbps != null && ` · ${n.downlinkMbps} Mbps`}
                {n.rttMs != null && ` · ${n.rttMs} ms`}
              </span>
            ) : (
              <span className="text-ink-2">{t("network.unknown")}</span>
            )}
          </Row>

          <Row label={t("network.dns")} hint={t("network.dnsHint")}>
            <span className="text-ink-2">{t("network.notExposed")}</span>
          </Row>

          <Row label={t("network.https")}>
            {n.https ? (
              <Pill tone="success">
                {n.protocol === "https" ? t("network.encrypted") : t("network.localOnly")}
              </Pill>
            ) : (
              <Pill tone="danger">{t("network.notEncrypted")}</Pill>
            )}
          </Row>

          <Row
            label={t("network.region")}
            hint={n.ipRegion ? t("network.regionFromIp") : t("network.regionFromTz")}
          >
            {n.ipRegion ?? tz ?? t("network.unknown")}
          </Row>
        </dl>
      )}
    </GlassCard>
  );
}
