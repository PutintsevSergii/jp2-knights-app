import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminAnnouncementSummary,
  CreateAdminAnnouncementRequest,
  UpdateAdminAnnouncementRequest
} from "./admin-announcement.types.js";

export abstract class AdminAnnouncementRepository {
  abstract listManageableAnnouncements(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary[]>;
  abstract createAnnouncement(
    data: CreateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementSummary>;
  abstract updateAnnouncement(
    id: string,
    data: UpdateAdminAnnouncementRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary | null>;
  abstract findAnnouncementForAudit(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary | null>;
}

@Injectable()
export class PrismaAdminAnnouncementRepository implements AdminAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageableAnnouncements(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary[]> {
    const records = await this.prisma.announcement.findMany({
      where: adminAnnouncementListWhere(scopeOrganizationUnitIds),
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminAnnouncementSummary);
  }

  async createAnnouncement(
    data: CreateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementSummary> {
    const record = await this.prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        visibility: data.visibility,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        pinned: data.pinned ?? false,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        archivedAt: data.status === "ARCHIVED" ? new Date() : null
      }
    });

    return toAdminAnnouncementSummary(record);
  }

  async updateAnnouncement(
    id: string,
    data: UpdateAdminAnnouncementRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary | null> {
    const updateData: Prisma.AnnouncementUncheckedUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.targetOrganizationUnitId !== undefined) {
      updateData.targetOrganizationUnitId = data.targetOrganizationUnitId;
    }
    if (data.pinned !== undefined) updateData.pinned = data.pinned;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.status === "PUBLISHED") updateData.publishedAt = new Date();
    if (data.status === "ARCHIVED") updateData.archivedAt = new Date();
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt === null ? null : new Date(data.publishedAt);
    }
    if (data.archivedAt !== undefined) {
      updateData.archivedAt = data.archivedAt === null ? null : new Date(data.archivedAt);
    }

    const where = adminAnnouncementUpdateWhere(id, scopeOrganizationUnitIds);
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
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminAnnouncementSummary | null> {
    const record = await this.prisma.announcement.findFirst({
      where: adminAnnouncementUpdateWhere(id, scopeOrganizationUnitIds)
    });

    return record ? toAdminAnnouncementSummary(record) : null;
  }
}

export function adminAnnouncementListWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.AnnouncementWhereInput {
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

function adminAnnouncementUpdateWhere(
  id: string,
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.AnnouncementWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return { id };
  }

  return {
    id,
    targetOrganizationUnitId: { in: [...scopeOrganizationUnitIds] }
  };
}

interface AdminAnnouncementRecord {
  id: string;
  title: string;
  body: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  pinned: boolean;
  status: string;
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
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminAnnouncementVisibility(
  value: string
): AdminAnnouncementSummary["visibility"] {
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

  throw new Error("Repository returned an unknown announcement visibility.");
}

function toAdminAnnouncementStatus(value: string): AdminAnnouncementSummary["status"] {
  if (
    value === "DRAFT" ||
    value === "REVIEW" ||
    value === "APPROVED" ||
    value === "PUBLISHED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown announcement status.");
}
