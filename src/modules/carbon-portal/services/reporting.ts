import { carbonPortalDb } from "../db/database";
import type { Report, ReportStatus } from "../db/types";
import { computeReportSnapshot } from "./aggregates";
import { logAudit } from "./auditLog";

export type GenerateReportInput = {
  title: string;
  periodStart: string;
  periodEnd: string;
};

/** Freezes current aggregates into a report row (draft) plus an audit entry. */
export async function generateReport(input: GenerateReportInput): Promise<Report> {
  const emissions = await carbonPortalDb.emissions.toArray();
  const snapshot = computeReportSnapshot(emissions, input.periodStart, input.periodEnd);
  const report: Report = {
    id: `rep-${crypto.randomUUID()}`,
    title: input.title.trim(),
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    status: "draft",
    ...snapshot,
    generatedAt: new Date().toISOString(),
    publishedAt: null,
  };
  await carbonPortalDb.reports.put(report);
  await logAudit({
    action: "create",
    entityType: "report",
    entityId: report.id,
    summary: `Generated report "${report.title}" (${report.totalTonnes.toFixed(1)} t CO2e)`,
  });
  return report;
}

const STATUS_ACTION: Record<ReportStatus, "approve" | "publish" | "create"> = {
  draft: "create",
  in_review: "approve",
  published: "publish",
};

const STATUS_SUMMARY: Record<ReportStatus, string> = {
  draft: "moved back to draft",
  in_review: "sent for review",
  published: "published",
};

export async function setReportStatus(id: string, status: ReportStatus): Promise<void> {
  const report = await carbonPortalDb.reports.get(id);
  if (!report) return;

  const now = new Date().toISOString();
  await carbonPortalDb.reports.put({
    ...report,
    status,
    publishedAt: status === "published" ? now : report.publishedAt,
  });
  await logAudit({
    action: STATUS_ACTION[status],
    entityType: "report",
    entityId: report.id,
    summary: `Report "${report.title}" ${STATUS_SUMMARY[status]}`,
  });
}

export async function deleteReport(id: string): Promise<void> {
  const report = await carbonPortalDb.reports.get(id);
  await carbonPortalDb.reports.delete(id);
  if (report) {
    await logAudit({
      action: "update",
      entityType: "report",
      entityId: report.id,
      summary: `Deleted report "${report.title}"`,
    });
  }
}
