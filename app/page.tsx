"use client";

import { Hero } from "@/components/hero";
import { ScoreCard } from "@/components/cards/score-card";
import { ThreatCard } from "@/components/cards/threat-card";
import { PrivacyCard } from "@/components/cards/privacy-card";
import { NetworkCard } from "@/components/cards/network-card";
import { DeviceCard } from "@/components/cards/device-card";
import { FootprintCard } from "@/components/cards/footprint-card";
import { HistoryCard } from "@/components/cards/history-card";
import { useI18n } from "@/lib/i18n";

export default function OverviewPage() {
  const { t } = useI18n();
  return (
    <>
      <Hero />

      <h2 className="sr-only">{t("nav.overview")}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <ScoreCard />
        <ThreatCard />
        <PrivacyCard />
        <NetworkCard />
        <DeviceCard />
        <FootprintCard />
        <HistoryCard className="sm:col-span-2 lg:col-span-3" />
      </div>
    </>
  );
}
