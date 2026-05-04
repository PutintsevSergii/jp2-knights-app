import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminPrayerSummary,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

export abstract class AdminPrayerRepository {
  abstract listManageablePrayers(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminPrayerSummary[]>;
  abstract createPrayer(data: CreateAdminPrayerRequest): Promise<AdminPrayerSummary>;
  abstract updatePrayer(id: string, data: UpdateAdminPrayerRequest): Promise<AdminPrayerSummary>;
  abstract findPrayerForAudit(id: string): Promise<AdminPrayerSummary | null>;
}

@Injectable()
export class PrismaAdminPrayerRepository implements AdminPrayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageablePrayers(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminPrayerSummary[]> {
    const records = await this.prisma.prayer.findMany({
      where: adminPrayerListWhere(scopeOrganizationUnitIds),
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }]
    });

    return records.map(toAdminPrayerSummary);
  }

  async createPrayer(data: CreateAdminPrayerRequest): Promise<AdminPrayerSummary> {
    const record = await this.prisma.prayer.create({
      data: {
        categoryId: data.categoryId ?? null,
        title: data.title,
        body: data.body,
        language: data.language,
        visibility: data.visibility,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        archivedAt: data.status === "ARCHIVED" ? new Date() : null
      }
    });

    return toAdminPrayerSummary(record);
  }

  async updatePrayer(id: string, data: UpdateAdminPrayerRequest): Promise<AdminPrayerSummary> {
    const updateData: Prisma.PrayerUncheckedUpdateInput = {};

    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.targetOrganizationUnitId !== undefined) {
      updateData.targetOrganizationUnitId = data.targetOrganizationUnitId;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.status === "PUBLISHED") updateData.publishedAt = new Date();
    if (data.status === "ARCHIVED") updateData.archivedAt = new Date();
    if (data.archivedAt !== undefined) {
      updateData.archivedAt = data.archivedAt === null ? null : new Date(data.archivedAt);
    }

    const record = await this.prisma.prayer.update({
      where: { id },
      data: updateData
    });

    return toAdminPrayerSummary(record);
  }

  async findPrayerForAudit(id: string): Promise<AdminPrayerSummary | null> {
    const record = await this.prisma.prayer.findUnique({
      where: { id }
    });

    return record ? toAdminPrayerSummary(record) : null;
  }
}

function adminPrayerListWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.PrayerWhereInput {
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

interface AdminPrayerRecord {
  id: string;
  categoryId: string | null;
  title: string;
  body: string;
  language: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

function toAdminPrayerSummary(record: AdminPrayerRecord): AdminPrayerSummary {
  return {
    id: record.id,
    categoryId: record.categoryId,
    title: record.title,
    body: record.body,
    language: record.language,
    visibility: toAdminPrayerVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    status: toAdminPrayerStatus(record.status),
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toAdminPrayerVisibility(value: string): AdminPrayerSummary["visibility"] {
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

  throw new Error("Repository returned an unknown prayer visibility.");
}

function toAdminPrayerStatus(value: string): AdminPrayerSummary["status"] {
  if (
    value === "DRAFT" ||
    value === "REVIEW" ||
    value === "APPROVED" ||
    value === "PUBLISHED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown prayer status.");
}
