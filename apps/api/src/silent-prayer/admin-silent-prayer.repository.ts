import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminSilentPrayerEventSummary,
  CreateAdminSilentPrayerEventRequest,
  UpdateAdminSilentPrayerEventRequest
} from "./admin-silent-prayer.types.js";

export abstract class AdminSilentPrayerRepository {
  abstract listManageableEvents(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminSilentPrayerEventSummary[]>;
  abstract createEvent(
    data: CreateAdminSilentPrayerEventRequest,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary>;
  abstract updateEvent(
    id: string,
    data: UpdateAdminSilentPrayerEventRequest,
    scopeOrganizationUnitIds: readonly string[] | null,
    actorUserId: string
  ): Promise<AdminSilentPrayerEventSummary | null>;
  abstract findEventForAudit(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminSilentPrayerEventSummary | null>;
}

@Injectable()
export class PrismaAdminSilentPrayerRepository implements AdminSilentPrayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableEvents(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminSilentPrayerEventSummary[]> {
    const records = await this.prisma.silentPrayerEvent.findMany({
      where: adminSilentPrayerListWhere(scopeOrganizationUnitIds),
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
        approvedBy: data.status === "APPROVED" || data.status === "PUBLISHED" ? actorUserId : null,
        publishedBy: data.status === "PUBLISHED" ? actorUserId : null,
        approvedAt:
          data.status === "APPROVED" || data.status === "PUBLISHED" ? new Date() : null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        cancelledAt: null,
        archivedAt: data.status === "ARCHIVED" ? new Date() : null
      }
    });

    return toAdminSilentPrayerEventSummary(record);
  }

  async updateEvent(
    id: string,
    data: UpdateAdminSilentPrayerEventRequest,
    scopeOrganizationUnitIds: readonly string[] | null,
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
    if (data.status === "APPROVED" || data.status === "PUBLISHED") {
      updateData.approvedBy = actorUserId;
      updateData.approvedAt = new Date();
    }
    if (data.status === "PUBLISHED") {
      updateData.publishedBy = actorUserId;
      updateData.publishedAt = new Date();
    }
    if (data.status === "ARCHIVED") updateData.archivedAt = new Date();
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

    const where = adminSilentPrayerUpdateWhere(id, scopeOrganizationUnitIds);
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
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminSilentPrayerEventSummary | null> {
    const record = await this.prisma.silentPrayerEvent.findFirst({
      where: adminSilentPrayerUpdateWhere(id, scopeOrganizationUnitIds)
    });

    return record ? toAdminSilentPrayerEventSummary(record) : null;
  }
}

export function adminSilentPrayerListWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.SilentPrayerEventWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return {};
  }

  return {
    OR: [
      { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
      { targetOrganizationUnitId: { in: [...scopeOrganizationUnitIds] } }
    ]
  };
}

function adminSilentPrayerUpdateWhere(
  id: string,
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.SilentPrayerEventWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return { id };
  }

  return {
    id,
    targetOrganizationUnitId: { in: [...scopeOrganizationUnitIds] }
  };
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
    approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminSilentPrayerVisibility(
  value: string
): AdminSilentPrayerEventSummary["visibility"] {
  if (
    value === "PUBLIC" ||
    value === "FAMILY_OPEN" ||
    value === "CANDIDATE" ||
    value === "BROTHER" ||
    value === "ORGANIZATION_UNIT" ||
    value === "OFFICER" ||
    value === "ADMIN"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown silent-prayer visibility.");
}

function toAdminSilentPrayerStatus(value: string): AdminSilentPrayerEventSummary["status"] {
  if (
    value === "DRAFT" ||
    value === "REVIEW" ||
    value === "APPROVED" ||
    value === "PUBLISHED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown silent-prayer status.");
}
