import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AdminContentScope } from "../admin/admin-content-access.policy.js";
import {
  approvalContentStatusCreateMetadata,
  approvalContentStatusUpdateMetadata,
  toContentStatus,
  toVisibility
} from "../content/content-contracts.js";
import {
  adminManageableContentWhere,
  adminScopedContentUpdateWhere
} from "../content/content-visibility.where.js";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminAnnouncementSummary,
  CreateAdminAnnouncementRequest,
  UpdateAdminAnnouncementRequest
} from "./admin-announcement.types.js";

export abstract class AdminAnnouncementRepository {
  abstract listManageableAnnouncements(
    scope: AdminContentScope
  ): Promise<AdminAnnouncementSummary[]>;
  abstract createAnnouncement(
    data: CreateAdminAnnouncementRequest,
    actorUserId: string
  ): Promise<AdminAnnouncementSummary>;
  abstract updateAnnouncement(
    id: string,
    data: UpdateAdminAnnouncementRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminAnnouncementSummary | null>;
  abstract findAnnouncementForAudit(
    id: string,
    scope: AdminContentScope
  ): Promise<AdminAnnouncementSummary | null>;
}

@Injectable()
export class PrismaAdminAnnouncementRepository implements AdminAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableAnnouncements(
    scope: AdminContentScope
  ): Promise<AdminAnnouncementSummary[]> {
    const records = await this.prisma.announcement.findMany({
      where: adminAnnouncementListWhere(scope),
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminAnnouncementSummary);
  }

  async createAnnouncement(
    data: CreateAdminAnnouncementRequest,
    actorUserId: string
  ): Promise<AdminAnnouncementSummary> {
    const record = await this.prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        visibility: data.visibility,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        pinned: data.pinned ?? false,
        status: data.status,
        createdBy: actorUserId,
        updatedBy: actorUserId,
        ...approvalContentStatusCreateMetadata(data.status, actorUserId)
      }
    });

    return toAdminAnnouncementSummary(record);
  }

  async updateAnnouncement(
    id: string,
    data: UpdateAdminAnnouncementRequest,
    scope: AdminContentScope,
    actorUserId: string
  ): Promise<AdminAnnouncementSummary | null> {
    const updateData: Prisma.AnnouncementUncheckedUpdateInput = {
      updatedBy: actorUserId
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.targetOrganizationUnitId !== undefined) {
      updateData.targetOrganizationUnitId = data.targetOrganizationUnitId;
    }
    if (data.pinned !== undefined) updateData.pinned = data.pinned;
    if (data.status !== undefined) updateData.status = data.status;
    Object.assign(
      updateData,
      approvalContentStatusUpdateMetadata(data.status, actorUserId)
    );
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt === null ? null : new Date(data.publishedAt);
    }
    if (data.archivedAt !== undefined) {
      updateData.archivedAt = data.archivedAt === null ? null : new Date(data.archivedAt);
    }

    const where = adminAnnouncementUpdateWhere(id, scope);
    const result = await this.prisma.announcement.updateMany({
      where,
      data: updateData
    });

    if (result.count === 0) {
      return null;
    }

    const record = await this.prisma.announcement.findFirst({ where });

    return record ? toAdminAnnouncementSummary(record) : null;
  }

  async findAnnouncementForAudit(
    id: string,
    scope: AdminContentScope
  ): Promise<AdminAnnouncementSummary | null> {
    const record = await this.prisma.announcement.findFirst({
      where: adminAnnouncementUpdateWhere(id, scope)
    });

    return record ? toAdminAnnouncementSummary(record) : null;
  }
}

export function adminAnnouncementListWhere(
  scope: AdminContentScope
): Prisma.AnnouncementWhereInput {
  return adminManageableContentWhere<Prisma.AnnouncementWhereInput>(scope);
}

function adminAnnouncementUpdateWhere(
  id: string,
  scope: AdminContentScope
): Prisma.AnnouncementWhereInput {
  return adminScopedContentUpdateWhere<Prisma.AnnouncementWhereInput>(id, scope);
}

interface AdminAnnouncementRecord {
  id: string;
  title: string;
  body: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  pinned: boolean;
  status: string;
  approvedBy: string | null;
  publishedBy: string | null;
  approvedAt: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

function toAdminAnnouncementSummary(record: AdminAnnouncementRecord): AdminAnnouncementSummary {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    visibility: toAdminAnnouncementVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    pinned: record.pinned,
    status: toAdminAnnouncementStatus(record.status),
    approvedByUserId: record.approvedBy,
    publishedByUserId: record.publishedBy,
    approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminAnnouncementVisibility(
  value: string
): AdminAnnouncementSummary["visibility"] {
  return toVisibility(value, "announcement");
}

function toAdminAnnouncementStatus(value: string): AdminAnnouncementSummary["status"] {
  return toContentStatus(value, "announcement");
}
