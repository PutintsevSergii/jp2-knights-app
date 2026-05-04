import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminEventSummary,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

export abstract class AdminEventRepository {
  abstract listManageableEvents(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary[]>;
  abstract createEvent(data: CreateAdminEventRequest): Promise<AdminEventSummary>;
  abstract updateEvent(
    id: string,
    data: UpdateAdminEventRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary | null>;
  abstract findEventForAudit(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary | null>;
}

@Injectable()
export class PrismaAdminEventRepository implements AdminEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableEvents(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary[]> {
    const records = await this.prisma.event.findMany({
      where: adminEventListWhere(scopeOrganizationUnitIds),
      orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminEventSummary);
  }

  async createEvent(data: CreateAdminEventRequest): Promise<AdminEventSummary> {
    const record = await this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        startAt: new Date(data.startAt),
        endAt: data.endAt === undefined || data.endAt === null ? null : new Date(data.endAt),
        locationLabel: data.locationLabel ?? null,
        visibility: data.visibility,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        status: data.status,
        publishedAt: data.status === "published" ? new Date() : null,
        cancelledAt: data.status === "cancelled" ? new Date() : null,
        archivedAt: data.status === "archived" ? new Date() : null
      }
    });

    return toAdminEventSummary(record);
  }

  async updateEvent(
    id: string,
    data: UpdateAdminEventRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary | null> {
    const updateData: Prisma.EventUncheckedUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
    if (data.endAt !== undefined)
      updateData.endAt = data.endAt === null ? null : new Date(data.endAt);
    if (data.locationLabel !== undefined) updateData.locationLabel = data.locationLabel;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.targetOrganizationUnitId !== undefined) {
      updateData.targetOrganizationUnitId = data.targetOrganizationUnitId;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.status === "published") updateData.publishedAt = new Date();
    if (data.status === "cancelled") updateData.cancelledAt = new Date();
    if (data.status === "archived") updateData.archivedAt = new Date();
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt === null ? null : new Date(data.publishedAt);
    }
    if (data.cancelledAt !== undefined) {
      updateData.cancelledAt = data.cancelledAt === null ? null : new Date(data.cancelledAt);
    }
    if (data.archivedAt !== undefined) {
      updateData.archivedAt = data.archivedAt === null ? null : new Date(data.archivedAt);
    }

    const where = adminEventUpdateWhere(id, scopeOrganizationUnitIds);
    const result = await this.prisma.event.updateMany({
      where,
      data: updateData
    });

    if (result.count === 0) {
      return null;
    }

    const record = await this.prisma.event.findFirst({
      where
    });

    return record ? toAdminEventSummary(record) : null;
  }

  async findEventForAudit(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminEventSummary | null> {
    const record = await this.prisma.event.findFirst({
      where: adminEventUpdateWhere(id, scopeOrganizationUnitIds)
    });

    return record ? toAdminEventSummary(record) : null;
  }
}

export function adminEventListWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.EventWhereInput {
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

function adminEventUpdateWhere(
  id: string,
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.EventWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return { id };
  }

  return {
    id,
    targetOrganizationUnitId: { in: [...scopeOrganizationUnitIds] }
  };
}

interface AdminEventRecord {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startAt: Date;
  endAt: Date | null;
  locationLabel: string | null;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  publishedAt: Date | null;
  cancelledAt: Date | null;
  archivedAt: Date | null;
}

function toAdminEventSummary(record: AdminEventRecord): AdminEventSummary {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    type: record.type,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt ? record.endAt.toISOString() : null,
    locationLabel: record.locationLabel,
    visibility: toAdminEventVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    status: toAdminEventStatus(record.status),
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminEventVisibility(value: string): AdminEventSummary["visibility"] {
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

  throw new Error("Repository returned an unknown event visibility.");
}

function toAdminEventStatus(value: string): AdminEventSummary["status"] {
  if (value === "draft" || value === "published" || value === "cancelled" || value === "archived") {
    return value;
  }

  throw new Error("Repository returned an unknown event status.");
}
