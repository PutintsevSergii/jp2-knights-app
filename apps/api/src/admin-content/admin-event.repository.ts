import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AdminContentScope } from "../admin/admin-content-access.policy.js";
import {
  eventStatusCreateMetadata,
  eventStatusUpdateMetadata,
  toEventStatus,
  toVisibility
} from "../content/content-contracts.js";
import {
  adminManageableContentWhere,
  adminScopedContentUpdateWhere
} from "../content/content-visibility.where.js";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminEventSummary,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

export abstract class AdminEventRepository {
  abstract listManageableEvents(
    scope: AdminContentScope
  ): Promise<AdminEventSummary[]>;
  abstract createEvent(
    data: CreateAdminEventRequest,
    actorUserId: string
  ): Promise<AdminEventSummary>;
  abstract updateEvent(
    id: string,
    data: UpdateAdminEventRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminEventSummary | null>;
  abstract findEventForAudit(
    id: string,
    scope: AdminContentScope
  ): Promise<AdminEventSummary | null>;
}

@Injectable()
export class PrismaAdminEventRepository implements AdminEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableEvents(
    scope: AdminContentScope
  ): Promise<AdminEventSummary[]> {
    const records = await this.prisma.event.findMany({
      where: adminEventListWhere(scope),
      orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminEventSummary);
  }

  async createEvent(
    data: CreateAdminEventRequest,
    actorUserId: string
  ): Promise<AdminEventSummary> {
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
        createdBy: actorUserId,
        updatedBy: actorUserId,
        ...eventStatusCreateMetadata(data.status, actorUserId)
      }
    });

    return toAdminEventSummary(record);
  }

  async updateEvent(
    id: string,
    data: UpdateAdminEventRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminEventSummary | null> {
    const updateData: Prisma.EventUncheckedUpdateInput = {
      updatedBy: actorUserId
    };

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
    Object.assign(updateData, eventStatusUpdateMetadata(data.status, actorUserId));
    if (data.approvedAt !== undefined) {
      updateData.approvedAt = data.approvedAt === null ? null : new Date(data.approvedAt);
      updateData.approvedBy = data.approvedAt === null ? null : actorUserId;
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

    const where = adminEventUpdateWhere(id, scope);
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
    scope: AdminContentScope
  ): Promise<AdminEventSummary | null> {
    const record = await this.prisma.event.findFirst({
      where: adminEventUpdateWhere(id, scope)
    });

    return record ? toAdminEventSummary(record) : null;
  }
}

export function adminEventListWhere(
  scope: AdminContentScope
): Prisma.EventWhereInput {
  return adminManageableContentWhere<Prisma.EventWhereInput>(scope);
}

function adminEventUpdateWhere(
  id: string,
  scope: AdminContentScope
): Prisma.EventWhereInput {
  return adminScopedContentUpdateWhere<Prisma.EventWhereInput>(id, scope);
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
  approvedBy: string | null;
  publishedBy: string | null;
  approvedAt: Date | null;
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
    approvedByUserId: record.approvedBy,
    publishedByUserId: record.publishedBy,
    approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminEventVisibility(value: string): AdminEventSummary["visibility"] {
  return toVisibility(value, "event");
}

function toAdminEventStatus(value: string): AdminEventSummary["status"] {
  return toEventStatus(value, "event");
}
