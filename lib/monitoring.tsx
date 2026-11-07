"use client";

import * as React from "react";
import { useAccount } from "@/lib/account";
import { useNotifications } from "@/lib/notifications";
import { useActivity } from "@/lib/activity";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import { newId } from "@/lib/utils";

export type DomainStatus = "pending" | "ok" | "warning" | "error";

export interface DomainBreach {
  name: string;
  title: string;
  date: string;
  pwnCount: number;
}

export interface DomainRecord {
  id: string;
  domain: string;
  addedAt: number;
  lastCheckedAt: number | null;
  status: DomainStatus;
  addresses: string[];
  mx: string[];
  breaches: DomainBreach[];
  breachesAvailable: boolean;
  error?: string;
}

interface DomainApiResponse {
  name?: string;
  ok?: boolean;
  addresses?: string[];
  mx?: string[];
  breaches?: DomainBreach[];
  breachesAvailable?: boolean;
  error?: string;
}

interface MonitoringContextValue {
  ready: boolean;
  items: DomainRecord[];
  checking: string[];
  canMonitor: boolean;
  limit: number | null;
  addDomain: (value: string) => { ok: boolean; error?: "invalid" | "limit" | "premium" };
  removeDomain: (id: string) => void;
  checkDomain: (id: string) => Promise<void>;
  checkAll: () => Promise<void>;
}

const STORAGE_KEY = STORAGE_KEYS.domains;
const DOMAIN = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

const MonitoringContext = React.createContext<MonitoringContextValue | null>(null);

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/\.$/, "");
}

function readStored(): DomainRecord[] {
  const parsed = readJson<DomainRecord[]>(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function writeStored(items: DomainRecord[]) {
  writeJson(STORAGE_KEY, items);
}

function statusFor(record: Pick<DomainRecord, "addresses" | "breaches">): DomainStatus {
  if (record.addresses.length === 0) return "error";
  if (record.breaches.length > 0) return "warning";
  return "ok";
}

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const { ready: accountReady, canUse, limits } = useAccount();
  const { push } = useNotifications();
  const { add: addActivity } = useActivity();
  const [items, setItems] = React.useState<DomainRecord[]>([]);
  const [ready, setReady] = React.useState(false);
  const [checking, setChecking] = React.useState<string[]>([]);
  const itemsRef = React.useRef<DomainRecord[]>([]);
  const checkingRef = React.useRef<Set<string>>(new Set());
  const autoRan = React.useRef(false);

  const canMonitor = canUse("domainMonitoring");
  const limit = canMonitor ? limits.monitoredDomains : 0;

  React.useEffect(() => {
    const stored = readStored();
    itemsRef.current = stored;
    setItems(stored);
    setReady(true);
  }, []);

  const commit = React.useCallback((next: DomainRecord[]) => {
    itemsRef.current = next;
    setItems(next);
    writeStored(next);
  }, []);

  const checkDomain = React.useCallback(
    async (id: string) => {
      if (checkingRef.current.has(id)) return;
      const record = itemsRef.current.find((item) => item.id === id);
      if (!record) return;
      checkingRef.current.add(id);
      setChecking(Array.from(checkingRef.current));
      try {
        const response = await fetch(`/api/domain?name=${encodeURIComponent(record.domain)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("request-failed");
        const data = (await response.json()) as DomainApiResponse;
        const updated: DomainRecord = {
          ...record,
          lastCheckedAt: Date.now(),
          addresses: data.addresses ?? [],
          mx: data.mx ?? [],
          breaches: data.breaches ?? [],
          breachesAvailable: Boolean(data.breachesAvailable),
          error: data.error,
        };
        updated.status = statusFor(updated);
        const previousStatus: DomainStatus = record.status;

        const next = itemsRef.current.map((item) => (item.id === id ? updated : item));
        commit(next);

        if (updated.status === "error" && previousStatus !== "pending" && previousStatus !== "error") {
            push({
              kind: "domain",
              titleKey: "notification.domainDown.title",
              descKey: "notification.domainDown.desc",
              params: { domain: updated.domain },
              href: "/monitoring",
            });
            addActivity({
              kind: "domain",
              titleKey: "notification.domainDown.title",
              descKey: "notification.domainDown.desc",
              params: { domain: updated.domain },
              href: "/monitoring",
            });
          } else if (previousStatus === "error" && updated.status !== "error") {
            push({
              kind: "domain",
              titleKey: "notification.domainUp.title",
              descKey: "notification.domainUp.desc",
              params: { domain: updated.domain },
              href: "/monitoring",
            });
            addActivity({
              kind: "domain",
              titleKey: "notification.domainUp.title",
              descKey: "notification.domainUp.desc",
              params: { domain: updated.domain },
              href: "/monitoring",
            });
        }

        const known = new Set(record.breaches.map((breach) => breach.name));
        const fresh = updated.breaches.filter((breach) => !known.has(breach.name));
        if (fresh.length > 0) {
          push({
            kind: "breach",
            titleKey: "notification.domainBreach.title",
            descKey: "notification.domainBreach.desc",
            params: { domain: updated.domain, count: fresh.length },
            href: "/monitoring",
          });
          addActivity({
            kind: "breach",
            titleKey: "notification.domainBreach.title",
            descKey: "notification.domainBreach.desc",
            params: { domain: updated.domain, count: fresh.length },
            href: "/monitoring",
          });
        }
      } catch {
        const updated: DomainRecord = {
          ...record,
          lastCheckedAt: Date.now(),
          status: "error",
          error: "request-failed",
        };
        commit(itemsRef.current.map((item) => (item.id === id ? updated : item)));
        push({
          kind: "domain",
          titleKey: "notification.domainDown.title",
          descKey: "notification.domainDown.desc",
          params: { domain: record.domain },
          href: "/monitoring",
        });
      } finally {
        checkingRef.current.delete(id);
        setChecking(Array.from(checkingRef.current));
      }
    },
    [commit, push, addActivity],
  );

  const addDomain = React.useCallback(
    (value: string) => {
      if (!canMonitor) return { ok: false, error: "premium" as const };
      const domain = normalizeDomain(value);
      if (!DOMAIN.test(domain)) return { ok: false, error: "invalid" as const };
      if (limit !== null && itemsRef.current.length >= limit) {
        return { ok: false, error: "limit" as const };
      }
      if (itemsRef.current.some((item) => item.domain === domain)) {
        return { ok: false, error: "invalid" as const };
      }
      const record: DomainRecord = {
        id: newId(),
        domain,
        addedAt: Date.now(),
        lastCheckedAt: null,
        status: "pending",
        addresses: [],
        mx: [],
        breaches: [],
        breachesAvailable: false,
      };
      commit([...itemsRef.current, record]);
      push({
        kind: "domain",
        titleKey: "notification.domainAdded.title",
        descKey: "notification.domainAdded.desc",
        params: { domain },
        href: "/monitoring",
      });
      addActivity({
        kind: "domain",
        titleKey: "notification.domainAdded.title",
        descKey: "notification.domainAdded.desc",
        params: { domain },
        href: "/monitoring",
      });
      void checkDomain(record.id);
      return { ok: true };
    },
    [canMonitor, limit, commit, push, addActivity, checkDomain],
  );

  const removeDomain = React.useCallback(
    (id: string) => {
      commit(itemsRef.current.filter((item) => item.id !== id));
    },
    [commit],
  );

  const checkAll = React.useCallback(async () => {
    const active = itemsRef.current.filter((item) => !checkingRef.current.has(item.id));
    await Promise.all(active.map((item) => checkDomain(item.id)));
  }, [checkDomain]);

  React.useEffect(() => {
    if (!ready || !accountReady || !canMonitor || autoRan.current) return;
    autoRan.current = true;
    const interval = limits.monitorIntervalHours * 60 * 60 * 1000;
    if (interval <= 0) return;
    const due = itemsRef.current.filter(
      (item) => !item.lastCheckedAt || Date.now() - item.lastCheckedAt >= interval,
    );
    if (due.length === 0) return;
    void Promise.all(due.map((item) => checkDomain(item.id)));
  }, [ready, accountReady, canMonitor, limits.monitorIntervalHours, checkDomain]);

  const value = React.useMemo<MonitoringContextValue>(
    () => ({
      ready,
      items,
      checking,
      canMonitor,
      limit,
      addDomain,
      removeDomain,
      checkDomain,
      checkAll,
    }),
    [ready, items, checking, canMonitor, limit, addDomain, removeDomain, checkDomain, checkAll],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = React.useContext(MonitoringContext);
  if (!ctx) throw new Error("useMonitoring must be used inside <MonitoringProvider>");
  return ctx;
}
