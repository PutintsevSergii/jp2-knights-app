import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminCandidateRequestDetail,
  AdminCandidateRequestSummary,
  UpdateAdminCandidateRequest
} from "./admin-candidate-request.types.js";

export abstract class AdminCandidateRequestRepository {
  abstract listCandidateRequests(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestSummary[]>;
  abstract findCandidateRequest(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestDetail | null>;
  abstract updateCandidateRequest(
    id: string,
    data: UpdateAdminCandidateRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestDetail | null>;
}

@Injectable()
export class PrismaAdminCandidateRequestRepository extends AdminCandidateRequestRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listCandidateRequests(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestSummary[]> {
    const records = await this.prisma.candidateRequest.findMany({
      where: scopedCandidateRequestWhere(scopeOrganizationUnitIds),
      include: {
        assignedOrganizationUnit: {
          select: {
            name: true
          }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return records.map(toAdminCandidateRequestSummary);
  }

  async findCandidateRequest(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestDetail | null> {
    const record = await this.prisma.candidateRequest.findFirst({
      where: {
        ...scopedCandidateRequestWhere(scopeOrganizationUnitIds),
        id
      },
      include: {
        assignedOrganizationUnit: {
          select: {
            name: true
          }
        }
      }
    });

    return record ? toAdminCandidateRequestDetail(record) : null;
  }

  async updateCandidateRequest(
    id: string,
    data: UpdateAdminCandidateRequest,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateRequestDetail | null> {
    const existing = await this.prisma.candidateRequest.findFirst({
      where: {
        ...scopedCandidateRequestWhere(scopeOrganizationUnitIds),
        id
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return null;
    }

    const updateData: Prisma.CandidateRequestUncheckedUpdateInput = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedOrganizationUnitId !== undefined) {
      updateData.assignedOrganizationUnitId = data.assignedOrganizationUnitId;
    }
    if (data.officerNote !== undefined) updateData.officerNote = data.officerNote;

    const record = await this.prisma.candidateRequest.update({
      where: { id },
      data: updateData,
      include: {
        assignedOrganizationUnit: {
          select: {
            name: true
          }
        }
      }
    });

    return toAdminCandidateRequestDetail(record);
  }
}

type CandidateRequestRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string;
  city: string;
  preferredLanguage: string | null;
  message: string | null;
  consentTextVersion: string;
  consentAt: Date;
  status: "new" | "contacted" | "invited" | "rejected" | "converted_to_candidate";
  assignedOrganizationUnitId: string | null;
  assignedOrganizationUnit: { name: string } | null;
  officerNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

function scopedCandidateRequestWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.CandidateRequestWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return {
      archivedAt: null
    };
  }

  return {
    archivedAt: null,
    assignedOrganizationUnitId: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}

function toAdminCandidateRequestSummary(
  record: CandidateRequestRecord
): AdminCandidateRequestSummary {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    country: record.country,
    city: record.city,
    status: record.status,
    assignedOrganizationUnitId: record.assignedOrganizationUnitId,
    assignedOrganizationUnitName: record.assignedOrganizationUnit?.name ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt?.toISOString() ?? null
  };
}

function toAdminCandidateRequestDetail(record: CandidateRequestRecord): AdminCandidateRequestDetail {
  return {
    ...toAdminCandidateRequestSummary(record),
    phone: record.phone,
    preferredLanguage: record.preferredLanguage,
    message: record.message,
    consentTextVersion: record.consentTextVersion,
    consentAt: record.consentAt.toISOString(),
    officerNote: record.officerNote
  };
}
