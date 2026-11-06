"use client";

import * as React from "react";
import Link from "next/link";
import { Globe2, Plus, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Pill, type Tone } from "@/components/common";
import { UpgradeGate } from "@/components/upgrade-gate";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/lib/account";
import { useMonitoring, type DomainRecord, type DomainStatus } from "@/lib/monitoring";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/utils";

const STATUS_TONE: Record<DomainStatus, Tone> = {
  pending: "neutral",
  ok: "success",
  warning: "warning",
  error: "danger",
};

const STATUS_KEY: Record<DomainStatus, string> = {
  pending: "monitoring.statusPending",
  ok: "monitoring.statusOk",
  warning: "monitoring.statusWarning",
  error: "monitoring.statusError",
};

export default function MonitoringPage() {
  const { t, locale } = useI18n();
  const { limits } = useAccount();
  const { ready, items, checking, canMonitor, limit, addDomain, removeDomain, checkDomain, checkAll } = useMonitoring();
  const { toast } = useToast();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<DomainRecord | null>(null);
  const [checkingAll, setCheckingAll] = React.useState(false);

  const atLimit = limit !== null && items.length >= limit;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = addDomain(value);
    if (!result.ok) {
      setError(
        t(
          result.error === "limit"
            ? "monitoring.limit"
            : result.error === "premium"
              ? "monitoring.gateTitle"
              : "monitoring.invalid",
        ),
      );
      return;
    }
    setValue("");
    toast({ title: t("toast.domainAdded"), description: t("toast.domainAddedDesc"), tone: "success" });
  };

  const refreshAll = async () => {
    setCheckingAll(true);
    await checkAll();
    setCheckingAll(false);
    toast({ title: t("toast.domainChecked"), tone: "success" });
  };

  if (!canMonitor) {
    return (
      <>
        <PageTitle title={t("monitoring.title")} description={t("monitoring.desc")} />
        <UpgradeGate
          required="premium"
          titleKey="monitoring.gateTitle"
          descKey="monitoring.gateDesc"
          className="mx-auto max-w-2xl"
        />
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={t("monitoring.title")}
        description={t("monitoring.desc")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => void refreshAll()}
              disabled={items.length === 0 || checkingAll || checking.length > 0}
            >
              <RefreshCw className={checkingAll ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              {t("monitoring.refresh")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <GlassCard interactive={false}>
            <CardHeader
              icon={<Plus className="h-5 w-5" />}
              title={t("monitoring.add")}
              description={t("monitoring.addHint")}
              tint="blue"
              action={<Pill tone={atLimit ? "warning" : "neutral"}>{t("monitoring.count", { used: items.length, total: limit ?? "∞" })}</Pill>}
            />
            <form onSubmit={submit} className="space-y-3">
              <Field label={t("monitoring.add")} error={error ?? undefined} hint={atLimit ? t("monitoring.limitDesc", { count: limit }) : undefined}>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t("monitoring.placeholder")}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={atLimit}
                />
              </Field>
              <Button type="submit" variant="primary" className="w-full" disabled={!value.trim() || atLimit}>
                {t("monitoring.addButton")}
              </Button>
              {atLimit && (
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/pricing">{t("monitoring.upgrade")}</Link>
                </Button>
              )}
            </form>
          </GlassCard>

          <GlassCard interactive={false}>
            <CardHeader
              icon={<RefreshCw className="h-5 w-5" />}
              title={t("monitoring.autoCheck")}
              description={t("monitoring.autoCheckDesc", { hours: limits.monitorIntervalHours })}
              tint="purple"
            />
            <dl className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">{t("monitoring.source")}</dt>
                <dd className="text-right text-ink">{t("monitoring.sourceDoh")}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">{t("monitoring.breaches")}</dt>
                <dd className="text-right text-ink">{t("monitoring.sourceHibp")}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-2">{t("monitoring.dnsNote")}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">{t("monitoring.breachesUnavailable")}</p>
          </GlassCard>
        </div>

        <div>
          {!ready ? (
            <GlassCard interactive={false}>
              <p className="text-sm text-ink-2">{t("common.loading")}</p>
            </GlassCard>
          ) : items.length === 0 ? (
            <GlassCard interactive={false}>
              <div className="flex flex-col items-center py-12 text-center">
                <span className="glass-inset grid h-14 w-14 place-items-center text-purple">
                  <Globe2 className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">{t("monitoring.empty")}</h2>
                <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-2">{t("monitoring.emptyDesc")}</p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {items.map((record) => {
                const isChecking = checking.includes(record.id);
                const nextCheck =
                  record.lastCheckedAt && limits.monitorIntervalHours > 0
                    ? record.lastCheckedAt + limits.monitorIntervalHours * 3_600_000
                    : null;
                return (
                  <GlassCard key={record.id} interactive={false}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="glass-inset grid h-10 w-10 shrink-0 place-items-center text-purple">
                          <Globe2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-display text-[16px] font-semibold tracking-tight text-ink">
                            {record.domain}
                          </h2>
                          <p className="mt-0.5 text-xs text-ink-2">
                            {t("monitoring.lastChecked")}:{" "}
                            {record.lastCheckedAt ? formatDateTime(record.lastCheckedAt, locale) : t("monitoring.never")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={STATUS_TONE[record.status]}>{t(STATUS_KEY[record.status])}</Pill>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void checkDomain(record.id)}
                          disabled={isChecking}
                        >
                          <RefreshCw className={isChecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                          {isChecking ? t("monitoring.checking") : t("monitoring.check")}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(record)}
                          aria-label={t("monitoring.remove")}
                          className="glass-inset grid h-8 w-8 place-items-center text-ink-2 transition-colors hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-2">
                          {t("monitoring.addresses")}
                        </h3>
                        {record.addresses.length === 0 ? (
                          <p className="mt-1.5 text-[13px] text-ink-2">{t("monitoring.noAddresses")}</p>
                        ) : (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {record.addresses.slice(0, 8).map((address) => (
                              <code key={address} className="glass-inset break-all px-2 py-1 font-mono text-[11px] text-ink">
                                {address}
                              </code>
                            ))}
                          </div>
                        )}
                        {record.mx.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {record.mx.slice(0, 4).map((host) => (
                              <code key={host} className="rounded-md border border-[color:var(--glass-border)] px-2 py-0.5 font-mono text-[11px] text-ink-2">
                                MX {host}
                              </code>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {t("monitoring.breaches")}
                        </h3>
                        {record.breaches.length > 0 ? (
                          <ul className="mt-1.5 space-y-1.5">
                            {record.breaches.slice(0, 5).map((breach) => (
                              <li key={`${breach.name}-${breach.date}`} className="text-[13px] leading-snug">
                                <span className="font-medium text-ink">{breach.title || breach.name}</span>
                                <span className="text-ink-2"> · {breach.date}</span>
                                <span className="ml-1 text-xs text-ink-2">
                                  {t("monitoring.breachCount", { count: breach.pwnCount.toLocaleString() })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : record.breachesAvailable ? (
                          <p className="mt-1.5 text-[13px] text-ink-2">{t("monitoring.noBreaches")}</p>
                        ) : (
                          <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{t("monitoring.breachesUnavailable")}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--glass-border)] pt-3 text-xs text-ink-2">
                      <span>
                        {t("monitoring.nextCheck")}:{" "}
                        {nextCheck ? formatDateTime(nextCheck, locale) : t("monitoring.never")}
                      </span>
                      <span>{t("monitoring.autoCheckDesc", { hours: limits.monitorIntervalHours })}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogTitle>{t("monitoring.remove")}</DialogTitle>
          <DialogDescription>
            {t("monitoring.removeConfirm", { domain: removeTarget?.domain ?? "" })}
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t("action.cancel")}</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                if (removeTarget) {
                  removeDomain(removeTarget.id);
                  toast({ title: t("toast.domainRemoved"), tone: "info" });
                }
                setRemoveTarget(null);
              }}
            >
              {t("action.remove")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
