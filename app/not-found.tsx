"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="glass-inset grid h-14 w-14 place-items-center text-blue">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{t("notFound.desc")}</p>
      <Button asChild variant="primary" className="mt-6">
        <Link href="/">{t("notFound.home")}</Link>
      </Button>
    </section>
  );
}
