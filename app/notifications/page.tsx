"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  CreditCard,
  Gift,
  Globe2,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useNotifications, type NotificationKind } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { cn, formatDateTime } from "@/lib/utils";

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  score: Activity,
  breach: ShieldAlert,
  domain: Globe2,
  billing: CreditCard,
  referral: Gift,
  system: Bell,
};

const KIND_TINT: Record<NotificationKind, string> = {
  score: "text-blue",
  breach: "text-danger",
  domain: "text-purple",
  billing: "text-success",
  referral: "text-cyan",
  system: "text-ink-2",
};

export default function NotificationsPage() {
  const { t, locale } = useI18n();
  const { ready, items, unread, markRead, markAllRead, remove, clear } = useNotifications();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [clearOpen, setClearOpen] = React.useState(false);

  const visible = React.useMemo(() => {
    const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);
    return filter === "unread" ? sorted.filter((n) => !n.read) : sorted;
  }, [items, filter]);

  return (
    <>
      <PageTitle
        title={t("notifications.title")}
        description={t("notifications.desc")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                markAllRead();
                toast({ title: t("notifications.allRead"), tone: "success" });
              }}
              disabled={unread === 0}
            >
              {t("notifications.markAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearOpen(true)}
              disabled={items.length === 0}
            >
              <Trash2 className="h-4 w-4" /> {t("notifications.clear")}
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="glass-inset inline-flex rounded-full p-1">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === value ? "bg-white/12 text-ink [[data-theme=light]_&]:bg-white/80" : "text-ink-2 hover:text-ink",
              )}
            >
              {t(value === "all" ? "notifications.filterAll" : "notifications.filterUnread")}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-2">{t("notifications.unread", { count: unread })}</span>
      </div>

      {!ready ? (
        <GlassCard interactive={false}>
          <p className="text-sm text-ink-2">{t("common.loading")}</p>
        </GlassCard>
      ) : visible.length === 0 ? (
        <GlassCard interactive={false}>
          <div className="flex flex-col items-center py-10 text-center">
            <span className="glass-inset grid h-14 w-14 place-items-center text-ink-2">
              <Bell className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              {t(filter === "unread" ? "notifications.emptyUnread" : "notifications.empty")}
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-2">
              {t("notifications.desc")}
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-5">
              <Link href="/audit">{t("nav.audit")}</Link>
            </Button>
          </div>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => {
            const Icon = KIND_ICON[item.kind];
            return (
              <li key={item.id}>
                <GlassCard
                  interactive={false}
                  className={cn(
                    "relative flex items-start gap-3.5 p-4 sm:p-4",
                    !item.read && "border-[color:color-mix(in_srgb,var(--accent-blue)_35%,var(--glass-border))]",
                  )}
                >
                  <span className={cn("glass-inset grid h-10 w-10 shrink-0 place-items-center", KIND_TINT[item.kind])}>
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[14px] font-semibold text-ink">{t(item.titleKey, item.params)}</h2>
                      {!item.read && <Pill tone="info">{t("notifications.new")}</Pill>}
                    </div>
                    {item.descKey && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                        {t(item.descKey, item.params)}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-2">
                      <span>{formatDateTime(item.createdAt, locale)}</span>
                      {item.href && (
                        <Link
                          href={item.href}
                          onClick={() => markRead(item.id)}
                          className="font-medium text-blue hover:opacity-80"
                        >
                          {t("notifications.open")}
                        </Link>
                      )}
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markRead(item.id)}
                          className="hover:text-ink"
                        >
                          {t("action.markRead")}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      remove(item.id);
                      toast({ title: t("notifications.deleted"), tone: "info" });
                    }}
                    aria-label={t("notifications.delete")}
                    className="glass-inset grid h-8 w-8 shrink-0 place-items-center text-ink-2 transition-colors hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogTitle>{t("notifications.clearConfirm")}</DialogTitle>
          <DialogDescription>{t("notifications.desc")}</DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t("common.cancel")}</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                clear();
                setClearOpen(false);
                toast({ title: t("toast.notificationsCleared"), tone: "info" });
              }}
            >
              {t("notifications.clear")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
