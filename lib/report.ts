import type { AuditResult, AuditSummary } from "@/lib/audit";
import type { ActivityEvent } from "@/lib/activity";
import type { DomainRecord } from "@/lib/monitoring";

export interface ReportExtras {
  plan: string;
  activity: ActivityEvent[];
  domains: DomainRecord[];
  referral: { code: string; invited: number; credits: number } | null;
}

export interface ReportLabels {
  app: string;
  generated: string;
  score: string;
  coverage: string;
  checks: string;
  history: string;
  recommendations: string;
  plan: string;
  activity: string;
  domains: string;
  referral: string;
  device: string;
  privacy: string;
  network: string;
  issues: string;
  noData: string;
  status: string;
  detail: string;
  domain: string;
  dns: string;
  breaches: string;
  date: string;
  type: string;
  event: string;
  statusPass: string;
  statusWarn: string;
  statusFail: string;
  statusInfo: string;
  statusUnknown: string;
  generatedLocally: string;
  invited: string;
  credits: string;
  lang: string;
}

const DEFAULT_LABELS: ReportLabels = {
  app: "Digital Footprint",
  generated: "Generated",
  score: "Score",
  coverage: "Coverage",
  checks: "Checks",
  history: "Audit history",
  recommendations: "Recommendations",
  plan: "Plan",
  activity: "Change history",
  domains: "Monitored domains",
  referral: "Referral",
  device: "Device",
  privacy: "Privacy",
  network: "Network",
  issues: "Issues",
  noData: "No data",
  status: "Status",
  detail: "Detail",
  domain: "Domain",
  dns: "DNS",
  breaches: "Breaches",
  date: "Date",
  type: "Type",
  event: "Event",
  statusPass: "Passed",
  statusWarn: "Review",
  statusFail: "Failed",
  statusInfo: "Info",
  statusUnknown: "Not answered",
  generatedLocally: "Generated locally. No data was uploaded.",
  invited: "invited",
  credits: "credits",
  lang: "en",
};

function statusLabel(labels: ReportLabels, status: string): string {
  switch (status) {
    case "pass":
      return labels.statusPass;
    case "warn":
      return labels.statusWarn;
    case "fail":
      return labels.statusFail;
    case "info":
      return labels.statusInfo;
    default:
      return labels.statusUnknown;
  }
}

function baseReport(current: AuditResult | null, history: AuditSummary[]) {
  return {
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
}

function saveFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

/** Basic JSON report. Available on every plan. */
export function downloadReport(current: AuditResult | null, history: AuditSummary[]): void {
  saveFile(
    JSON.stringify(baseReport(current, history), null, 2),
    `digital-footprint-report-${stamp()}.json`,
    "application/json",
  );
}

/** Advanced JSON report with monitoring, activity and referral sections. */
export function downloadAdvancedReport(
  current: AuditResult | null,
  history: AuditSummary[],
  extras: ReportExtras,
): void {
  saveFile(
    JSON.stringify(
      {
        ...baseReport(current, history),
        extras: {
          plan: extras.plan,
          monitoring: extras.domains.map((d) => ({
            domain: d.domain,
            status: d.status,
            addresses: d.addresses,
            mx: d.mx,
            breaches: d.breaches,
            lastCheckedAt: d.lastCheckedAt ? new Date(d.lastCheckedAt).toISOString() : null,
          })),
          activity: extras.activity.map((a) => ({
            at: new Date(a.at).toISOString(),
            kind: a.kind,
            titleKey: a.titleKey,
            params: a.params ?? null,
          })),
          referral: extras.referral,
        },
      },
      null,
      2,
    ),
    `digital-footprint-advanced-report-${stamp()}.json`,
    "application/json",
  );
}

export function downloadHtmlReport(
  current: AuditResult | null,
  history: AuditSummary[],
  extras: ReportExtras,
  labels: Partial<ReportLabels> = {},
): void {
  const l = { ...DEFAULT_LABELS, ...labels };
  const rows = current
    ? current.checks
        .map(
          (check) => `<tr>
            <td>${esc(check.label)}</td>
            <td><span class="status ${esc(check.status)}">${esc(statusLabel(l, check.status))}</span></td>
            <td>${esc(check.detail)}</td>
            <td>${esc(check.recommendation ?? "—")}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="4">${esc(l.noData)}</td></tr>`;

  const recommendations = current
    ? current.checks
        .filter((check) => check.recommendation && check.status !== "pass")
        .map((check) => `<li><strong>${esc(check.label)}</strong> — ${esc(check.recommendation!)}</li>`)
        .join("")
    : "";

  const domains = extras.domains
    .map(
      (d) => `<tr><td>${esc(d.domain)}</td><td>${esc(d.status)}</td><td>${d.addresses.length}</td><td>${d.breaches.length}</td></tr>`,
    )
    .join("");

  const activity = extras.activity
    .slice(-50)
    .reverse()
    .map((a) => `<tr><td>${esc(new Date(a.at).toISOString())}</td><td>${esc(a.kind)}</td><td>${esc(a.titleKey)}</td></tr>`)
    .join("");

  const html = `<!doctype html>
<html lang="${esc(l.lang)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(l.app)} — ${esc(l.generated)} ${esc(stamp())}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f7fb; color: #171a2b; }
  main { max-width: 960px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 36px 40px; box-shadow: 0 20px 60px -30px rgba(20,24,50,.35); }
  h1 { margin: 0; font-size: 28px; letter-spacing: -.02em; }
  h2 { margin: 32px 0 10px; font-size: 17px; }
  .muted { color: #6b7280; font-size: 13px; }
  .hero { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
  .score { font-size: 44px; font-weight: 700; line-height: 1; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 16px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 14px; }
  .card b { display: block; font-size: 20px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eef0f4; vertical-align: top; }
  th { color: #6b7280; font-weight: 600; }
  .status { display: inline-block; border-radius: 99px; padding: 2px 8px; font-size: 11px; font-weight: 600; background: #eef0f4; }
  .status.pass { background: #dcfce7; color: #166534; }
  .status.warn { background: #fef3c7; color: #92400e; }
  .status.fail { background: #fee2e2; color: #991b1b; }
  ul { margin: 8px 0; padding-left: 20px; font-size: 13px; line-height: 1.6; }
  @media print { body { padding: 0; background: #fff; } main { box-shadow: none; border-radius: 0; } }
</style>
</head>
<body>
<main>
  <div class="hero">
    <div>
      <h1>${esc(l.app)}</h1>
      <p class="muted">${esc(l.generated)}: ${esc(new Date().toLocaleString())} · ${esc(l.plan)}: ${esc(extras.plan)}</p>
    </div>
    <div>
      <div class="muted">${esc(l.score)}</div>
      <div class="score">${current ? current.score : "—"}<span style="font-size:15px;color:#6b7280">/100</span></div>
    </div>
  </div>

  <div class="grid">
    <div class="card"><span class="muted">${esc(l.coverage)}</span><b>${current ? Math.round(current.coverage * 100) + "%" : "—"}</b></div>
    <div class="card"><span class="muted">${esc(l.issues)}</span><b>${current ? current.checks.filter((c) => c.status === "fail" || c.status === "warn").length : "—"}</b></div>
    <div class="card"><span class="muted">${esc(l.domains)}</span><b>${extras.domains.length}</b></div>
    <div class="card"><span class="muted">${esc(l.activity)}</span><b>${extras.activity.length}</b></div>
  </div>

  <h2>${esc(l.checks)}</h2>
  <table>
    <thead><tr><th>${esc(l.checks)}</th><th>${esc(l.status)}</th><th>${esc(l.detail)}</th><th>${esc(l.recommendations)}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  ${recommendations ? `<h2>${esc(l.recommendations)}</h2><ul>${recommendations}</ul>` : ""}

  <h2>${esc(l.domains)}</h2>
  ${
    domains
      ? `<table><thead><tr><th>${esc(l.domain)}</th><th>${esc(l.status)}</th><th>${esc(l.dns)}</th><th>${esc(l.breaches)}</th></tr></thead><tbody>${domains}</tbody></table>`
      : `<p class="muted">${esc(l.noData)}</p>`
  }

  <h2>${esc(l.activity)}</h2>
  ${
    activity
      ? `<table><thead><tr><th>${esc(l.date)}</th><th>${esc(l.type)}</th><th>${esc(l.event)}</th></tr></thead><tbody>${activity}</tbody></table>`
      : `<p class="muted">${esc(l.noData)}</p>`
  }

  ${
    extras.referral
      ? `<h2>${esc(l.referral)}</h2><p class="muted">${esc(extras.referral.code)} · ${extras.referral.invited} ${esc(l.invited)} · ${extras.referral.credits} ${esc(l.credits)}</p>`
      : ""
  }

  <h2>${esc(l.history)}</h2>
  ${
    history.length
      ? `<table><thead><tr><th>${esc(l.date)}</th><th>${esc(l.score)}</th><th>${esc(l.coverage)}</th></tr></thead><tbody>${history
          .slice(-30)
          .reverse()
          .map(
            (h) =>
              `<tr><td>${esc(new Date(h.timestamp).toISOString())}</td><td>${h.score}</td><td>${Math.round(h.coverage * 100)}%</td></tr>`,
          )
          .join("")}</tbody></table>`
      : `<p class="muted">${esc(l.noData)}</p>`
  }

  <p class="muted" style="margin-top:28px">${esc(l.generatedLocally)}</p>
</main>
</body>
</html>`;

  saveFile(html, `digital-footprint-extended-report-${stamp()}.html`, "text/html;charset=utf-8");
}

export function downloadCsvReport(
  current: AuditResult | null,
  history: AuditSummary[],
  extras: ReportExtras,
): void {
  const lines: string[][] = [
    ["section", "key", "value"],
    ["meta", "generatedAt", new Date().toISOString()],
    ["meta", "plan", extras.plan],
  ];

  if (current) {
    lines.push(["score", "score", String(current.score)]);
    lines.push(["score", "label", current.label]);
    lines.push(["score", "coverage", String(Number(current.coverage.toFixed(2)))]);
    for (const check of current.checks) {
      lines.push(["check", check.id, `${check.status} | ${check.label} | ${check.detail}`]);
    }
  }

  for (const h of history.slice(-50)) {
    lines.push(["history", new Date(h.timestamp).toISOString(), `${h.score} | ${Math.round(h.coverage * 100)}%`]);
  }
  for (const d of extras.domains) {
    lines.push(["domain", d.domain, `${d.status} | dns:${d.addresses.length} | breaches:${d.breaches.length}`]);
  }
  for (const a of extras.activity.slice(-50)) {
    lines.push(["activity", new Date(a.at).toISOString(), a.titleKey]);
  }
  if (extras.referral) {
    lines.push(["referral", extras.referral.code, `${extras.referral.invited} invited | ${extras.referral.credits} credits`]);
  }

  const csv = lines
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  saveFile(csv, `digital-footprint-extended-report-${stamp()}.csv`, "text/csv;charset=utf-8");
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
