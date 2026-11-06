"use client";

import * as React from "react";
import { newId } from "@/lib/utils";
import type { TranslateParams } from "@/lib/i18n-core";

export type NotificationKind = "score" | "breach" | "domain" | "billing" | "referral" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  titleKey: string;
  descKey?: string;
  params?: TranslateParams;
  href?: string;
  createdAt: number;
  read: boolean;
}

export interface NotificationInput {
  kind: NotificationKind;
  titleKey: string;
  descKey?: string;
  params?: TranslateParams;
  href?: string;
}

interface NotificationsContextValue {
  ready: boolean;
  items: AppNotification[];
  unread: number;
  push: (input: NotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "df-notifications-v1";
const MAX_ITEMS = 100;

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

function readStored(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeStored(items: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-MAX_ITEMS)));
  } catch {
    /* storage may be blocked; notifications stay in memory for this session */
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [ready, setReady] = React.useState(false);
  const itemsRef = React.useRef<AppNotification[]>([]);

  React.useEffect(() => {
    const stored = readStored();
    itemsRef.current = stored;
    setItems(stored);
    setReady(true);
  }, []);

  const commit = React.useCallback((next: AppNotification[]) => {
    const trimmed = next.slice(-MAX_ITEMS);
    itemsRef.current = trimmed;
    setItems(trimmed);
    writeStored(trimmed);
  }, []);

  const push = React.useCallback(
    (input: NotificationInput) => {
      const item: AppNotification = {
        id: newId(),
        kind: input.kind,
        titleKey: input.titleKey,
        descKey: input.descKey,
        params: input.params,
        href: input.href,
        createdAt: Date.now(),
        read: false,
      };
      commit([...itemsRef.current, item]);
    },
    [commit],
  );

  const markRead = React.useCallback(
    (id: string) => {
      commit(itemsRef.current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [commit],
  );

  const markAllRead = React.useCallback(() => {
    commit(itemsRef.current.map((n) => ({ ...n, read: true })));
  }, [commit]);

  const remove = React.useCallback(
    (id: string) => {
      commit(itemsRef.current.filter((n) => n.id !== id));
    },
    [commit],
  );

  const clear = React.useCallback(() => {
    commit([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to remove */
    }
  }, [commit]);

  const unread = items.filter((n) => !n.read).length;

  const value = React.useMemo<NotificationsContextValue>(
    () => ({ ready, items, unread, push, markRead, markAllRead, remove, clear }),
    [ready, items, unread, push, markRead, markAllRead, remove, clear],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
}
