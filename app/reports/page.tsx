"use client";

import { Download } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { HistoryCard } from "@/components/cards/history-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";
import { downloadReport } from "@/lib/report";

export default function ReportsPage() {
  const { current, history } = useAudit();
  const { toast } = useToast();
  const { t } = useI18n();

  return (
    <>
      <PageTitle
        title={t("reports.title")}
        description={t("reports.desc")}
        action={
          <Button
            variant="secondary"
            disabled={!current}
            onClick={() => {
              downloadReport(current, history);
              toast({ title: t("toast.reportTitle"), description: t("toast.reportDesc"), tone: "success" });
            }}
          >
            <Download className="h-4 w-4" />
            {t("reports.download")}
          </Button>
        }
      />
      <HistoryCard rows={30} showLink={false} />
    </>
  );
}
