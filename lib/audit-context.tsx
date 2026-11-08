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
import { useNotifications } from "@/lib/notifications";
import { useActivity } from "@/lib/activity";
import { STORAGE_KEYS, readJson, removeStored, writeJson } from "@/lib/storage";

const HISTORY_KEY = STORAGE_KEYS.audits;
const ANSWERS_KEY = STORAGE_KEYS.checklist;
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

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const { push } = useNotifications();
  const { add: addActivity } = useActivity();
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
    const a = readJson<ChecklistAnswers>(ANSWERS_KEY, {});
    const h = readJson<AuditSummary[]>(HISTORY_KEY, []);
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
    setStorageOk(writeJson(ANSWERS_KEY, next));
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
      setStorageOk(writeJson(HISTORY_KEY, nextHistory));
      setLastRun({ result, previous: prev });

      if (prev && prev.score !== result.score) {
        const event = {
          kind: "score" as const,
          titleKey: result.score < prev.score ? "notification.scoreDown.title" : "notification.scoreUp.title",
          descKey: result.score < prev.score ? "notification.scoreDown.desc" : "notification.scoreUp.desc",
          params: { previous: prev.score, score: result.score },
          href: "/reports",
        };
        push(event);
        addActivity(event);
      }
    } finally {
      runningRef.current = false;
      setScanning(false);
    }
  }, [locale, push, addActivity]);

  const clearHistory = React.useCallback(() => {
    historyRef.current = [];
    setHistory([]);
    setSavedId(null);
    setLastRun(null);
    removeStored(HISTORY_KEY);
  }, []);

  const value = React.useMemo<AuditContextValue>(
    () => ({
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
    }),
    [
      current,
      scanning,
      previous,
      history,
      answers,
      storageOk,
      lastRun,
      dialogOpen,
      startAudit,
      answer,
      clearHistory,
    ],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = React.useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used inside <AuditProvider>");
  return ctx;
}
