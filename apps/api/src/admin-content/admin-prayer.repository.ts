import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AdminContentScope } from "../admin/admin-content-access.policy.js";
import {
  contentStatusCreateTimestamps,
  contentStatusUpdateTimestamps,
  toContentStatus,
  toVisibility
} from "../content/content-contracts.js";
import { adminManageableContentWhere } from "../content/content-visibility.where.js";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminPrayerSummary,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

export abstract class AdminPrayerRepository {
  abstract listManageablePrayers(
    scope: AdminContentScope
  ): Promise<AdminPrayerSummary[]>;
  abstract createPrayer(data: CreateAdminPrayerRequest): Promise<AdminPrayerSummary>;
  abstract updatePrayer(id: string, data: UpdateAdminPrayerRequest): Promise<AdminPrayerSummary>;
  abstract findPrayerForAudit(id: string): Promise<AdminPrayerSummary | null>;
}

@Injectable()
export class PrismaAdminPrayerRepository implements AdminPrayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listManageablePrayers(
    scope: AdminContentScope
  ): Promise<AdminPrayerSummary[]> {
    const records = await this.prisma.prayer.findMany({
      where: adminPrayerListWhere(scope),
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
        ...contentStatusCreateTimestamps(data.status)
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
    Object.assign(updateData, contentStatusUpdateTimestamps(data.status));
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

export function adminPrayerListWhere(
  scope: AdminContentScope
): Prisma.PrayerWhereInput {
  return adminManageableContentWhere<Prisma.PrayerWhereInput>(scope);
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
  return toVisibility(value, "prayer");
}

function toAdminPrayerStatus(value: string): AdminPrayerSummary["status"] {
  return toContentStatus(value, "prayer");
}
