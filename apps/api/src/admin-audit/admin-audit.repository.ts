import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type { AdminAuditLogListQuery, AdminAuditLogSummary } from "./admin-audit.types.js";

export interface AdminAuditLogListResult {
  auditLogs: AdminAuditLogSummary[];
  total: number;
}

export abstract class AdminAuditRepository {
  abstract list(query: AdminAuditLogListQuery): Promise<AdminAuditLogListResult>;
}

@Injectable()
export class PrismaAdminAuditRepository implements AdminAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminAuditLogListQuery): Promise<AdminAuditLogListResult> {
    const where = auditLogWhere(query);
    const [records, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc"
        },
        take: query.limit,
        skip: query.offset,
        include: {
          actor: {
            select: {
              id: true,
              displayName: true
            }
          }
        }
      }),
      this.prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs: records.map((record) => ({
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
      })),
      total
    };
  }
}

function auditLogWhere(query: AdminAuditLogListQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (query.action) where.action = query.action;
  if (query.entityType) where.entityType = query.entityType;
  if (query.actorUserId) where.actorUserId = query.actorUserId;
  if (query.entityId) where.entityId = query.entityId;
  if (query.scopeOrganizationUnitId) {
    where.scopeOrganizationUnitId = query.scopeOrganizationUnitId;
  }
  if (query.createdFrom || query.createdTo) {
    where.createdAt = {
      ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),
      ...(query.createdTo ? { lte: new Date(query.createdTo) } : {})
    };
  }

  return where;
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
