import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/background";
import { Header } from "@/components/header";
import { AuditDialog } from "@/components/audit-dialog";
import { PageTransition } from "@/components/page-transition";
import { ToastProvider } from "@/components/ui/toast";
import { AuditProvider } from "@/lib/audit-context";
import { LocaleProvider, localeInitScript } from "@/lib/i18n";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { NotificationsProvider } from "@/lib/notifications";
import { ActivityProvider } from "@/lib/activity";
import { AccountProvider } from "@/lib/account";
import { MonitoringProvider } from "@/lib/monitoring";

const sans = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans", display: "swap" });
const display = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-display", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Понимайте свой цифровой след, находите риски приватности и защищайте свою онлайн-личность.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Digital Footprint",
    template: "%s · Digital Footprint",
  },
  description,
  applicationName: "Digital Footprint",
  openGraph: {
    type: "website",
    siteName: "Digital Footprint",
    title: "Digital Footprint",
    description,
    locale: "ru_RU",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Footprint",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080b14",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              <NotificationsProvider>
                <ActivityProvider>
                  <AccountProvider>
                    <MonitoringProvider>
                      <AuditProvider>
                        <Background />
                        <Header />
                        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-28 sm:px-6 md:pb-20 md:pt-32">
                          <PageTransition>{children}</PageTransition>
                        </main>
                        <AuditDialog />
                      </AuditProvider>
                    </MonitoringProvider>
                  </AccountProvider>
                </ActivityProvider>
              </NotificationsProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
