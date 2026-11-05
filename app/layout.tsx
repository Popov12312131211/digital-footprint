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

const sans = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans", display: "swap" });
const display = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Digital Footprint",
  description:
    "Понимайте свой цифровой след, находите риски приватности и защищайте свою онлайн-личность.",
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
              <AuditProvider>
                <Background />
                <Header />
                <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-28 sm:px-6 md:pb-20 md:pt-32">
                  <PageTransition>{children}</PageTransition>
                </main>
                <AuditDialog />
              </AuditProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
