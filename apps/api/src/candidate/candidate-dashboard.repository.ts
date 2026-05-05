import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  CandidateDashboardEventSummary,
  CandidateDashboardProfile
} from "./candidate-dashboard.types.js";

export abstract class CandidateDashboardRepository {
  abstract findActiveProfile(userId: string): Promise<CandidateDashboardProfile | null>;
  abstract findUpcomingEvents(
    assignedOrganizationUnitId: string | null,
    now?: Date
  ): Promise<CandidateDashboardEventSummary[]>;
}

@Injectable()
export class PrismaCandidateDashboardRepository implements CandidateDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveProfile(userId: string): Promise<CandidateDashboardProfile | null> {
    const record = await this.prisma.candidateProfile.findFirst({
      where: {
        userId,
        status: "active",
        archivedAt: null
      },
      include: candidateProfileDashboardInclude
    });

    return record ? toCandidateDashboardProfile(record) : null;
  }

  findUpcomingEvents(
    assignedOrganizationUnitId: string | null,
    now = new Date()
  ): Promise<CandidateDashboardEventSummary[]> {
    return this.prisma.event
      .findMany({
        where: candidateDashboardEventWhere(assignedOrganizationUnitId, now),
        orderBy: [{ startAt: "asc" }, { title: "asc" }],
        take: 3
      })
      .then((records) => records.map(toCandidateDashboardEvent));
  }
}

const candidateProfileDashboardInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      email: true,
      preferredLanguage: true
    }
  },
  assignedOrganizationUnit: {
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      parish: true
    }
  },
  responsibleOfficer: {
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true
    }
  }
} as const;

type CandidateProfileDashboardRecord = Prisma.CandidateProfileGetPayload<{
  include: typeof candidateProfileDashboardInclude;
}>;

interface CandidateEventRecord {
  id: string;
  title: string;
  type: string;
  startAt: Date;
  endAt: Date | null;
  locationLabel: string | null;
  visibility: string;
}

export function candidateDashboardEventWhere(
  assignedOrganizationUnitId: string | null,
  now: Date
): Prisma.EventWhereInput {
  const visibilityWhere: Prisma.EventWhereInput[] = [
    { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } }
  ];

  if (assignedOrganizationUnitId) {
    visibilityWhere.push({
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: assignedOrganizationUnitId
    });
  }

  return {
    status: "published",
    archivedAt: null,
    startAt: { gte: now },
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    AND: [
      {
        OR: visibilityWhere
      }
    ]
  };
}

function toCandidateDashboardProfile(
  record: CandidateProfileDashboardRecord
): CandidateDashboardProfile {
  return {
    id: record.id,
    userId: record.userId,
    displayName: record.user.displayName,
    email: record.user.email,
    preferredLanguage: record.user.preferredLanguage,
    status: "active",
    assignedOrganizationUnit: record.assignedOrganizationUnit
      ? {
          id: record.assignedOrganizationUnit.id,
          name: record.assignedOrganizationUnit.name,
          city: record.assignedOrganizationUnit.city,
          country: record.assignedOrganizationUnit.country,
          parish: record.assignedOrganizationUnit.parish
        }
      : null,
    responsibleOfficer: record.responsibleOfficer
      ? {
          id: record.responsibleOfficer.id,
          displayName: record.responsibleOfficer.displayName,
          email: record.responsibleOfficer.email,
          phone: record.responsibleOfficer.phone
        }
      : null
  };
}

function toCandidateDashboardEvent(record: CandidateEventRecord): CandidateDashboardEventSummary {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt ? record.endAt.toISOString() : null,
    locationLabel: record.locationLabel,
    visibility: toCandidateEventVisibility(record.visibility)
  };
}

function toCandidateEventVisibility(
  visibility: string
): CandidateDashboardEventSummary["visibility"] {
  if (
    visibility === "PUBLIC" ||
    visibility === "FAMILY_OPEN" ||
    visibility === "CANDIDATE" ||
    visibility === "ORGANIZATION_UNIT"
  ) {
    return visibility;
  }

  throw new Error("Repository returned an event visibility hidden from candidates.");
}
