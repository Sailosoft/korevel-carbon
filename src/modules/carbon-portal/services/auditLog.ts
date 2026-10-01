import { carbonPortalDb } from "../db/database";
import type { AuditAction, AuditEntityType } from "../db/types";

export const DEFAULT_ACTOR = "jdoe@korevel.io";

export type AuditInput = {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  actor?: string;
  at?: string;
};

export async function logAudit(input: AuditInput): Promise<void> {
  await carbonPortalDb.auditLog.add({
    at: input.at ?? new Date().toISOString(),
    actor: input.actor ?? DEFAULT_ACTOR,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
  });
}
