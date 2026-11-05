import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { intlLocale, type Locale } from "@/lib/i18n-core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ts: number, locale: Locale = "ru", opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), opts ?? { day: "numeric", month: "short" }).format(
    new Date(ts),
  );
}

export function formatDateTime(ts: number, locale: Locale = "ru") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}
