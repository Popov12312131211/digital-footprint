"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CreditCard,
  Download,
  FileBarChart,
  Gift,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  Radar,
  ScanSearch,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useAudit } from "@/lib/audit-context";
import { recommendations } from "@/lib/audit";
import { useI18n } from "@/lib/i18n";
import { downloadReport } from "@/lib/report";
import { useTheme } from "@/lib/theme";
import { useAccount } from "@/lib/account";
import { useNotifications, type NotificationKind } from "@/lib/notifications";
import { cn, formatDateTime } from "@/lib/utils";

export const NAV = [
  { href: "/", labelKey: "nav.overview", shortKey: "nav.overview", icon: LayoutDashboard },
  { href: "/audit", labelKey: "nav.audit", shortKey: "nav.auditShort", icon: ScanSearch },
  { href: "/passwords", labelKey: "nav.passwords", shortKey: "nav.passwordsShort", icon: KeyRound },
  { href: "/monitoring", labelKey: "nav.monitoring", shortKey: "nav.monitoringShort", icon: Radar },
  { href: "/reports", labelKey: "nav.reports", shortKey: "nav.reports", icon: FileBarChart },
  { href: "/pricing", labelKey: "nav.pricing", shortKey: "nav.pricing", icon: CreditCard },
] as const;

const MOBILE_NAV = [
  { href: "/", labelKey: "nav.overview", shortKey: "nav.overview", icon: LayoutDashboard },
  { href: "/audit", labelKey: "nav.audit", shortKey: "nav.auditShort", icon: ScanSearch },
  { href: "/passwords", labelKey: "nav.passwords", shortKey: "nav.passwordsShort", icon: KeyRound },
  { href: "/monitoring", labelKey: "nav.monitoring", shortKey: "nav.monitoringShort", icon: Radar },
  { href: "/account", labelKey: "nav.account", shortKey: "nav.accountShort", icon: UserRound },
] as const;

const kindColor: Record<NotificationKind, string> = {
  score: "var(--warning)",
  breach: "var(--danger)",
  domain: "var(--accent-blue)",
  billing: "var(--success)",
  referral: "var(--accent-purple)",
  system: "var(--text-secondary)",
};

export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { theme, toggle } = useTheme();
  const { locale, toggleLocale, t } = useI18n();
  const { current, history, clearHistory } = useAudit();
  const { profile, planDef, isAuthenticated, signOut, referral } = useAccount();
  const { items, unread, markRead, markAllRead } = useNotifications();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const recs = current ? recommendations(current) : [];
  const recent = [...items].slice(-5).reverse();

  return (
    <>
      <header className="fixed inset-x-3 top-3 z-40 sm:inset-x-6 sm:top-5">
        <div className="glass mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-[26px] px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-2xl pr-2" aria-label={t("brand.overview")}>
            <span className="relative grid h-10 w-10 place-items-center rounded-[14px] border border-white/25 bg-[linear-gradient(135deg,rgba(79,107,240,0.9),rgba(124,92,232,0.85))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_20px_-4px_rgba(120,149,255,0.7)]">
              <Shield className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </span>
            <span className="hidden font-display text-[15px] font-semibold tracking-tight text-ink lg:block">
              Digital Footprint
            </span>
          </Link>

          <nav aria-label={t("nav.primary")} className="hidden items-center gap-0.5 md:flex">
            {NAV.map(({ href, labelKey }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                    active ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-0 -z-10 rounded-full border border-[color:var(--glass-border)] bg-white/10 shadow-[inset_0_1px_0_var(--glass-highlight)] [[data-theme=light]_&]:bg-white/70"
                    />
                  )}
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              aria-label={locale === "ru" ? t("lang.switchToEn") : t("lang.switchToRu")}
              title={locale === "ru" ? t("lang.switchToEn") : t("lang.switchToRu")}
            >
              <span className="text-[12px] font-semibold tracking-wide">{locale === "ru" ? "RU" : "EN"}</span>
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={t("header.notifications", { count: unread + recs.length })}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unread > 0 ? (
                    <span
                      aria-hidden
                      className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white"
                      style={{ background: "var(--danger)", boxShadow: "0 0 8px var(--danger)" }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : recs.length > 0 ? (
                    <span
                      aria-hidden
                      className="absolute right-2 top-2 h-2 w-2 rounded-full"
                      style={{ background: "var(--warning)", boxShadow: "0 0 8px var(--warning)" }}
                    />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[min(360px,calc(100vw-2rem))]">
                <DropdownMenuLabel className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink">{t("header.notificationsTitle")}</span>
                  {unread > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        markAllRead();
                        toast({ title: t("notifications.allRead"), tone: "info" });
                      }}
                      className="text-xs font-medium text-blue hover:opacity-80"
                    >
                      {t("header.markAllRead")}
                    </button>
                  )}
                </DropdownMenuLabel>
                {recent.length === 0 ? (
                  <p className="px-3 pb-3 pt-1 text-[13px] leading-relaxed text-ink-2">
                    {t("header.noNotifications")}
                  </p>
                ) : (
                  recent.map((n) => (
                    <DropdownMenuItem key={n.id} asChild>
                      <Link
                        href={n.href ?? "/notifications"}
                        onClick={() => markRead(n.id)}
                        className="items-start"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: kindColor[n.kind], opacity: n.read ? 0.35 : 1 }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[13px]", n.read ? "font-normal text-ink-2" : "font-medium text-ink")}>
                            {t(n.titleKey, n.params)}
                          </span>
                          {n.descKey && (
                            <span className="mt-0.5 block text-xs leading-snug text-ink-2">
                              {t(n.descKey, n.params)}
                            </span>
                          )}
                          <span className="mt-1 block text-[11px] text-ink-2">
                            {formatDateTime(n.createdAt, locale)}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/notifications">
                    <Bell className="h-4 w-4 text-ink-2" /> {t("header.viewAll")}
                  </Link>
                </DropdownMenuItem>
                {recs.length > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/audit">
                      <Sparkles className="h-4 w-4 text-warning" /> {t("header.recommendations")}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="glass-inset ml-1 grid h-10 w-10 place-items-center rounded-full text-ink transition-transform active:scale-95"
                  aria-label={t("header.profile")}
                >
                  {isAuthenticated ? (
                    <span className="text-xs font-semibold uppercase">
                      {(profile?.name ?? profile?.email ?? "?").slice(0, 2)}
                    </span>
                  ) : (
                    <UserRound className="h-[18px] w-[18px]" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[min(280px,calc(100vw-2rem))]">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>
                      <span className="block text-[13px] font-medium text-ink">{profile?.name}</span>
                      <span className="block truncate text-xs">{profile?.email}</span>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[color:var(--glass-border)] px-2 py-0.5 text-[11px] text-ink">
                        {t(planDef.nameKey)}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <UserRound className="h-4 w-4 text-ink-2" /> {t("header.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account#billing">
                        <CreditCard className="h-4 w-4 text-ink-2" /> {t("header.billing")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/referral">
                        <Gift className="h-4 w-4 text-ink-2" /> {t("header.referral")}
                        {referral && referral.credits > 0 && (
                          <span className="ml-auto text-[11px] text-ink-2">{referral.credits}</span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tools">
                        <Wrench className="h-4 w-4 text-ink-2" /> {t("nav.tools")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">
                        <CreditCard className="h-4 w-4 text-ink-2" /> {t("nav.pricing")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <span className="block text-[13px] font-medium text-ink">{t("header.thisDevice")}</span>
                      <span className="block text-xs">{t("header.storedOnly")}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <UserRound className="h-4 w-4 text-ink-2" /> {t("header.signIn")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">
                        <CreditCard className="h-4 w-4 text-ink-2" /> {t("nav.pricing")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tools">
                        <Wrench className="h-4 w-4 text-ink-2" /> {t("nav.tools")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onSelect={() => {
                    downloadReport(current, history);
                    toast({ title: t("toast.reportTitle"), description: t("toast.reportDesc"), tone: "success" });
                  }}
                >
                  <Download className="h-4 w-4 text-ink-2" /> {t("header.download")}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={history.length === 0} onSelect={() => setConfirmOpen(true)}>
                  <Trash2 className="h-4 w-4 text-ink-2" /> {t("header.clearHistory")}
                </DropdownMenuItem>
                {isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        signOut();
                        toast({ title: t("toast.signedOut"), tone: "info" });
                      }}
                    >
                      <LogOut className="h-4 w-4 text-ink-2" /> {t("header.signOut")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav
        aria-label={t("nav.primary")}
        className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[26px] p-1.5 md:hidden"
      >
        {MOBILE_NAV.map(({ href, shortKey, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[20px] text-[11px] font-medium transition-colors",
                active
                  ? "bg-white/10 text-ink shadow-[inset_0_1px_0_var(--glass-highlight)] [[data-theme=light]_&]:bg-white/70"
                  : "text-ink-2",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-blue")} />
              {t(shortKey)}
            </Link>
          );
        })}
      </nav>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>{t("header.clearTitle")}</DialogTitle>
          <DialogDescription>{t("header.clearDesc", { count: history.length })}</DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t("header.keepHistory")}</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                clearHistory();
                setConfirmOpen(false);
                toast({ title: t("toast.historyCleared"), description: t("toast.historyClearedDesc"), tone: "info" });
              }}
            >
              {t("header.clearConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
