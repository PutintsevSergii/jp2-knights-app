import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type { AdminAuditLogSummary } from "./admin-audit.types.js";

export abstract class AdminAuditRepository {
  abstract listLatest(limit?: number): Promise<AdminAuditLogSummary[]>;
}

@Injectable()
export class PrismaAdminAuditRepository implements AdminAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listLatest(limit = 50): Promise<AdminAuditLogSummary[]> {
    const records = await this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    return records.map((record) => ({
      id: record.id,
      actorUserId: record.actorUserId,
      actorDisplayName: record.actor?.displayName ?? null,
      action: record.action,
      entityType: record.entityType,
      entityId: record.entityId,
      scopeOrganizationUnitId: record.scopeOrganizationUnitId,
      beforeSummary: toAuditSummary(record.beforeSummary),
      afterSummary: toAuditSummary(record.afterSummary),
      requestId: record.requestId,
      createdAt: record.createdAt.toISOString()
    }));
  }
}

function toAuditSummary(value: Prisma.JsonValue | null): AdminAuditLogSummary["beforeSummary"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number | boolean | null] =>
      isAuditSummaryValue(entry[1])
    )
  );
}

function isAuditSummaryValue(value: unknown): value is string | number | boolean | null {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}
