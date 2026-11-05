import type { AuditResult, AuditSummary } from "@/lib/audit";

/**
 * Builds a JSON report from data already on this device and downloads it.
 * Nothing is uploaded anywhere. The public IP is left out on purpose.
 */
export function downloadReport(current: AuditResult | null, history: AuditSummary[]): void {
  const report = {
    generatedAt: new Date().toISOString(),
    app: "Digital Footprint",
    current: current && {
      score: current.score,
      label: current.label,
      coverage: Number(current.coverage.toFixed(2)),
      issues: current.counts,
      checks: current.checks.map((c) => ({
        id: c.id,
        label: c.label,
        status: c.status,
        severity: c.severity ?? null,
        source: c.source,
        detail: c.detail,
        recommendation: c.recommendation ?? null,
      })),
      device: current.snapshot.device,
      privacy: current.snapshot.privacy,
      network: { ...current.snapshot.network, publicIp: undefined },
    },
    history: history.map((h) => ({
      date: new Date(h.timestamp).toISOString(),
      score: h.score,
      coverage: Number(h.coverage.toFixed(2)),
      issues: h.counts,
    })),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `digital-footprint-report-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
