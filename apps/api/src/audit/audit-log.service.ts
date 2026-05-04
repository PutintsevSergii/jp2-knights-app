import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";

export type AuditSummary = Record<string, string | number | boolean | null>;

export interface AuditLogInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  scopeOrganizationUnitId: string | null;
  beforeSummary: AuditSummary | null;
  afterSummary: AuditSummary | null;
  requestId?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        scopeOrganizationUnitId: input.scopeOrganizationUnitId,
        beforeSummary: jsonOrNull(input.beforeSummary),
        afterSummary: jsonOrNull(input.afterSummary),
        requestId: input.requestId ?? null,
        ipAddress: input.ipAddress ?? null
      }
    });
  }
}

function jsonOrNull(value: AuditSummary | null): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value ?? Prisma.JsonNull;
}
