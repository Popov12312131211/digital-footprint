"use client";

import * as React from "react";
import { newId } from "@/lib/utils";
import { STORAGE_KEYS, readJson, removeStored, writeJson } from "@/lib/storage";
import type { TranslateParams } from "@/lib/i18n-core";

export type ActivityKind =
  | "score"
  | "breach"
  | "domain"
  | "billing"
  | "referral"
  | "account"
  | "report"
  | "system";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  titleKey: string;
  descKey?: string;
  params?: TranslateParams;
  href?: string;
  at: number;
}

export interface ActivityInput {
  kind: ActivityKind;
  titleKey: string;
  descKey?: string;
  params?: TranslateParams;
  href?: string;
}

interface ActivityContextValue {
  ready: boolean;
  items: ActivityEvent[];
  add: (input: ActivityInput) => void;
  clear: () => void;
}

const STORAGE_KEY = STORAGE_KEYS.activity;
const MAX_ITEMS = 250;

const ActivityContext = React.createContext<ActivityContextValue | null>(null);

function readStored(): ActivityEvent[] {
  const parsed = readJson<ActivityEvent[]>(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed.slice(-MAX_ITEMS) : [];
}

function writeStored(items: ActivityEvent[]) {
  writeJson(STORAGE_KEY, items.slice(-MAX_ITEMS));
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ActivityEvent[]>([]);
  const [ready, setReady] = React.useState(false);
  const itemsRef = React.useRef<ActivityEvent[]>([]);

  React.useEffect(() => {
    const stored = readStored();
    itemsRef.current = stored;
    setItems(stored);
    setReady(true);
  }, []);

  const commit = React.useCallback((next: ActivityEvent[]) => {
    const trimmed = next.slice(-MAX_ITEMS);
    itemsRef.current = trimmed;
    setItems(trimmed);
    writeStored(trimmed);
  }, []);

  const add = React.useCallback(
    (input: ActivityInput) => {
      commit([
        ...itemsRef.current,
        {
          id: newId(),
          kind: input.kind,
          titleKey: input.titleKey,
          descKey: input.descKey,
          params: input.params,
          href: input.href,
          at: Date.now(),
        },
      ]);
    },
    [commit],
  );

  const clear = React.useCallback(() => {
    commit([]);
    removeStored(STORAGE_KEY);
  }, [commit]);

  const value = React.useMemo<ActivityContextValue>(
    () => ({ ready, items, add, clear }),
    [ready, items, add, clear],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = React.useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside <ActivityProvider>");
  return ctx;
}
