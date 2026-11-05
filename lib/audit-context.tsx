"use client";

import * as React from "react";
import {
  collectSnapshot,
  evaluate,
  summarize,
  type AuditResult,
  type AuditSummary,
  type ChecklistAnswers,
  type Snapshot,
} from "@/lib/audit";
import { useI18n } from "@/lib/i18n";

const HISTORY_KEY = "df-audits-v1";
const ANSWERS_KEY = "df-checklist-v1";
const MAX_HISTORY = 30;

export interface LastRun {
  result: AuditResult;
  previous: AuditSummary | null;
}

interface AuditContextValue {
  /** false until the first browser snapshot is collected */
  ready: boolean;
  scanning: boolean;
  current: AuditResult | null;
  /** The saved audit the current score is compared against, if any */
  previous: AuditSummary | null;
  history: AuditSummary[];
  answers: ChecklistAnswers;
  /** false when this browser blocks localStorage, so nothing can be saved */
  storageOk: boolean;
  lastRun: LastRun | null;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  /** Opens the audit dialog and runs a fresh audit */
  startAudit: () => Promise<void>;
  answer: (id: string, value: boolean | undefined) => void;
  clearHistory: () => void;
}

const AuditContext = React.createContext<AuditContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);
  const [answers, setAnswers] = React.useState<ChecklistAnswers>({});
  const [history, setHistory] = React.useState<AuditSummary[]>([]);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [storageOk, setStorageOk] = React.useState(true);
  const [lastRun, setLastRun] = React.useState<LastRun | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const answersRef = React.useRef<ChecklistAnswers>({});
  const historyRef = React.useRef<AuditSummary[]>([]);
  const runningRef = React.useRef(false);

  // Load persisted state and take the first snapshot.
  React.useEffect(() => {
    const a = read<ChecklistAnswers>(ANSWERS_KEY, {});
    const h = read<AuditSummary[]>(HISTORY_KEY, []);
    answersRef.current = a;
    historyRef.current = h;
    setAnswers(a);
    setHistory(h);
    let alive = true;
    collectSnapshot().then((s) => {
      if (alive) setSnapshot(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const evaluated = React.useMemo(
    () => (snapshot ? evaluate(snapshot, answers, locale) : null),
    [snapshot, answers, locale],
  );

  // Once an audit is saved, the live result takes its id until the inputs change.
  const current = React.useMemo<AuditResult | null>(() => {
    if (!evaluated) return null;
    return savedId ? { ...evaluated, id: savedId } : evaluated;
  }, [evaluated, savedId]);

  const previous = React.useMemo(() => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    if (savedId && last.id === savedId) return history[history.length - 2] ?? null;
    return last;
  }, [history, savedId]);

  const answer = React.useCallback((id: string, value: boolean | undefined) => {
    const next = { ...answersRef.current };
    if (value === undefined) delete next[id];
    else next[id] = value;
    answersRef.current = next;
    setAnswers(next);
    setStorageOk(write(ANSWERS_KEY, next));
    setSavedId(null); // inputs changed, so the saved audit no longer matches
  }, []);

  const startAudit = React.useCallback(async () => {
    setDialogOpen(true);
    if (runningRef.current) return;
    runningRef.current = true;
    setScanning(true);
    try {
      // Hold the scan state long enough to read; the data itself is quick.
      const [fresh] = await Promise.all([
        collectSnapshot(),
        new Promise((r) => window.setTimeout(r, 1500)),
      ]);
      const result = evaluate(fresh, answersRef.current, locale);
      const prev = historyRef.current[historyRef.current.length - 1] ?? null;
      const nextHistory = [...historyRef.current, summarize(result)].slice(-MAX_HISTORY);
      historyRef.current = nextHistory;
      setSnapshot(fresh);
      setHistory(nextHistory);
      setSavedId(result.id);
      setStorageOk(write(HISTORY_KEY, nextHistory));
      setLastRun({ result, previous: prev });
    } finally {
      runningRef.current = false;
      setScanning(false);
    }
  }, [locale]);

  const clearHistory = React.useCallback(() => {
    historyRef.current = [];
    setHistory([]);
    setSavedId(null);
    setLastRun(null);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* nothing to remove */
    }
  }, []);

  const value: AuditContextValue = {
    ready: current !== null,
    scanning,
    current,
    previous,
    history,
    answers,
    storageOk,
    lastRun,
    dialogOpen,
    setDialogOpen,
    startAudit,
    answer,
    clearHistory,
  };

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = React.useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used inside <AuditProvider>");
  return ctx;
}
