"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="glass-inset grid h-14 w-14 place-items-center text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
        {t("error.title")}
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{t("error.desc")}</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-ink-2">{error.digest}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={reset}>
          {t("common.retry")}
        </Button>
        <Button asChild variant="secondary">
          <a href="/">{t("notFound.home")}</a>
        </Button>
      </div>
    </section>
  );
}
