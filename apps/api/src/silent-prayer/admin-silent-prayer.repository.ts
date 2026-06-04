import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AdminContentScope } from "../admin/admin-content-access.policy.js";
import {
  adminManageableContentWhere,
  adminScopedContentUpdateWhere
} from "../content/content-visibility.where.js";
import {
  approvalContentStatusCreateMetadata,
  approvalContentStatusUpdateMetadata,
  toContentStatus,
  toVisibility
} from "../content/content-contracts.js";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminSilentPrayerEventSummary,
  CreateAdminSilentPrayerEventRequest,
  UpdateAdminSilentPrayerEventRequest
} from "./admin-silent-prayer.types.js";

export abstract class AdminSilentPrayerRepository {
  abstract listManageableEvents(
    scope: AdminContentScope
  ): Promise<AdminSilentPrayerEventSummary[]>;
  abstract createEvent(
    data: CreateAdminSilentPrayerEventRequest,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary>;
  abstract updateEvent(
    id: string,
    data: UpdateAdminSilentPrayerEventRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary | null>;
  abstract findEventForAudit(
    id: string,
    scope: AdminContentScope
  ): Promise<AdminSilentPrayerEventSummary | null>;
}

@Injectable()
export class PrismaAdminSilentPrayerRepository implements AdminSilentPrayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableEvents(
    scope: AdminContentScope
  ): Promise<AdminSilentPrayerEventSummary[]> {
    const records = await this.prisma.silentPrayerEvent.findMany({
      where: adminSilentPrayerListWhere(scope),
      orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminSilentPrayerEventSummary);
  }

  async createEvent(
    data: CreateAdminSilentPrayerEventRequest,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary> {
    const record = await this.prisma.silentPrayerEvent.create({
      data: {
        title: data.title,
        intention: data.intention ?? null,
        visibility: data.visibility,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        status: data.status,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt === undefined || data.endsAt === null ? null : new Date(data.endsAt),
        createdBy: actorUserId,
        updatedBy: actorUserId,
        ...approvalContentStatusCreateMetadata(data.status, actorUserId),
        cancelledAt: null,
      }
    });

    return toAdminSilentPrayerEventSummary(record);
  }

  async updateEvent(
    id: string,
    data: UpdateAdminSilentPrayerEventRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary | null> {
    const updateData: Prisma.SilentPrayerEventUncheckedUpdateInput = {
      updatedBy: actorUserId
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.intention !== undefined) updateData.intention = data.intention;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.targetOrganizationUnitId !== undefined) {
      updateData.targetOrganizationUnitId = data.targetOrganizationUnitId;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) {
      updateData.endsAt = data.endsAt === null ? null : new Date(data.endsAt);
    }
    Object.assign(updateData, approvalContentStatusUpdateMetadata(data.status, actorUserId));
    if (data.approvedAt !== undefined) {
      updateData.approvedAt = data.approvedAt === null ? null : new Date(data.approvedAt);
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt === null ? null : new Date(data.publishedAt);
    }
    if (data.cancelledAt !== undefined) {
      updateData.cancelledAt = data.cancelledAt === null ? null : new Date(data.cancelledAt);
    }
    if (data.archivedAt !== undefined) {
      updateData.archivedAt = data.archivedAt === null ? null : new Date(data.archivedAt);
    }

    const where = adminSilentPrayerUpdateWhere(id, scope);
    const result = await this.prisma.silentPrayerEvent.updateMany({
      where,
      data: updateData
    });

    if (result.count === 0) {
      return null;
    }

    const record = await this.prisma.silentPrayerEvent.findFirst({ where });

    return record ? toAdminSilentPrayerEventSummary(record) : null;
  }

  async findEventForAudit(
    id: string,
    scope: AdminContentScope
  ): Promise<AdminSilentPrayerEventSummary | null> {
    const record = await this.prisma.silentPrayerEvent.findFirst({
      where: adminSilentPrayerUpdateWhere(id, scope)
    });

    return record ? toAdminSilentPrayerEventSummary(record) : null;
  }
}

export function adminSilentPrayerListWhere(
  scope: AdminContentScope
): Prisma.SilentPrayerEventWhereInput {
  return adminManageableContentWhere<Prisma.SilentPrayerEventWhereInput>(scope);
}

function adminSilentPrayerUpdateWhere(
  id: string,
  scope: AdminContentScope
): Prisma.SilentPrayerEventWhereInput {
  return adminScopedContentUpdateWhere<Prisma.SilentPrayerEventWhereInput>(id, scope);
}

interface AdminSilentPrayerEventRecord {
  id: string;
  title: string;
  intention: string | null;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  approvedBy: string | null;
  publishedBy: string | null;
  approvedAt: Date | null;
  publishedAt: Date | null;
  cancelledAt: Date | null;
  archivedAt: Date | null;
}

function toAdminSilentPrayerEventSummary(
  record: AdminSilentPrayerEventRecord
): AdminSilentPrayerEventSummary {
  return {
    id: record.id,
    title: record.title,
    intention: record.intention,
    visibility: toAdminSilentPrayerVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    status: toAdminSilentPrayerStatus(record.status),
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt ? record.endsAt.toISOString() : null,
    approvedByUserId: record.approvedBy,
    publishedByUserId: record.publishedBy,
    approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminSilentPrayerVisibility(
  value: string
): AdminSilentPrayerEventSummary["visibility"] {
  return toVisibility(value, "silent-prayer");
}

function toAdminSilentPrayerStatus(value: string): AdminSilentPrayerEventSummary["status"] {
  return toContentStatus(value, "silent-prayer");
}
