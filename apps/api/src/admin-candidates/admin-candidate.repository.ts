import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateProfileSummary,
  UpdateAdminCandidateProfile
} from "./admin-candidate.types.js";

export abstract class AdminCandidateRepository {
  abstract listCandidateProfiles(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileSummary[]>;
  abstract findCandidateProfile(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null>;
  abstract updateCandidateProfile(
    id: string,
    data: UpdateAdminCandidateProfile,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null>;
}

@Injectable()
export class PrismaAdminCandidateRepository extends AdminCandidateRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listCandidateProfiles(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileSummary[]> {
    const records = await this.prisma.candidateProfile.findMany({
      where: scopedCandidateProfileWhere(scopeOrganizationUnitIds),
      include: candidateProfileInclude,
      orderBy: [{ updatedAt: "desc" }]
    });

    return records.map(toAdminCandidateProfile);
  }

  async findCandidateProfile(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null> {
    const record = await this.prisma.candidateProfile.findFirst({
      where: {
        ...scopedCandidateProfileWhere(scopeOrganizationUnitIds),
        id
      },
      include: candidateProfileInclude
    });

    return record ? toAdminCandidateProfile(record) : null;
  }

  async updateCandidateProfile(
    id: string,
    data: UpdateAdminCandidateProfile,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null> {
    const existing = await this.prisma.candidateProfile.findFirst({
      where: {
        ...scopedCandidateProfileWhere(scopeOrganizationUnitIds),
        id
      },
      select: { id: true }
    });

    if (!existing) {
      return null;
    }

    const updateData: Prisma.CandidateProfileUncheckedUpdateInput = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
      updateData.archivedAt = data.status === "archived" ? new Date() : null;
    }
    if (data.assignedOrganizationUnitId !== undefined) {
      updateData.assignedOrganizationUnitId = data.assignedOrganizationUnitId;
    }
    if (data.responsibleOfficerId !== undefined) {
      updateData.responsibleOfficerId = data.responsibleOfficerId;
    }

    const record = await this.prisma.candidateProfile.update({
      where: { id },
      data: updateData,
      include: candidateProfileInclude
    });

    return toAdminCandidateProfile(record);
  }
}

type CandidateProfileRecord = {
  id: string;
  userId: string;
  candidateRequestId: string | null;
  assignedOrganizationUnitId: string | null;
  assignedOrganizationUnit: { name: string } | null;
  responsibleOfficerId: string | null;
  responsibleOfficer: { displayName: string } | null;
  status: "active" | "paused" | "converted_to_brother" | "archived";
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  user: {
    displayName: string;
    email: string;
    preferredLanguage: string | null;
  };
};

const candidateProfileInclude = {
  user: {
    select: {
      displayName: true,
      email: true,
      preferredLanguage: true
    }
  },
  assignedOrganizationUnit: {
    select: {
      name: true
    }
  },
  responsibleOfficer: {
    select: {
      displayName: true
    }
  }
} as const;

export function scopedCandidateProfileWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.CandidateProfileWhereInput {
  const activeWhere: Prisma.CandidateProfileWhereInput = {
    archivedAt: null
  };

  if (scopeOrganizationUnitIds === null) {
    return activeWhere;
  }

  return {
    ...activeWhere,
    assignedOrganizationUnitId: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}

function toAdminCandidateProfile(record: CandidateProfileRecord): AdminCandidateProfileDetail {
  return {
    id: record.id,
    userId: record.userId,
    candidateRequestId: record.candidateRequestId,
    displayName: record.user.displayName,
    email: record.user.email,
    preferredLanguage: record.user.preferredLanguage,
    assignedOrganizationUnitId: record.assignedOrganizationUnitId,
    assignedOrganizationUnitName: record.assignedOrganizationUnit?.name ?? null,
    responsibleOfficerId: record.responsibleOfficerId,
    responsibleOfficerName: record.responsibleOfficer?.displayName ?? null,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt?.toISOString() ?? null
  };
}
