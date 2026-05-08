import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  CandidateAnnouncementListQuery,
  CandidateAnnouncementSummary,
  CandidateEventDetail,
  CandidateEventListQuery,
  CandidateEventSummary,
  CandidateDashboardEventSummary,
  CandidateDashboardProfile
} from "./candidate-dashboard.types.js";

export abstract class CandidateDashboardRepository {
  abstract findActiveProfile(userId: string): Promise<CandidateDashboardProfile | null>;
  abstract findUpcomingEvents(
    assignedOrganizationUnitId: string | null,
    now?: Date
  ): Promise<CandidateDashboardEventSummary[]>;
  abstract findVisibleCandidateEvents(
    query: CandidateEventListQuery,
    assignedOrganizationUnitId: string | null,
    userId: string,
    now?: Date
  ): Promise<CandidateEventSummary[]>;
  abstract findVisibleCandidateEvent(
    id: string,
    assignedOrganizationUnitId: string | null,
    userId: string,
    now?: Date
  ): Promise<CandidateEventDetail | null>;
  abstract findVisibleCandidateAnnouncements(
    query: CandidateAnnouncementListQuery,
    assignedOrganizationUnitId: string | null,
    now?: Date
  ): Promise<CandidateAnnouncementSummary[]>;
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

  findVisibleCandidateEvents(
    query: CandidateEventListQuery,
    assignedOrganizationUnitId: string | null,
    userId: string,
    now = new Date()
  ): Promise<CandidateEventSummary[]> {
    return this.prisma.event
      .findMany({
        where: candidateEventWhere(query, assignedOrganizationUnitId, now),
        include: {
          participations: {
            where: {
              userId
            },
            take: 1,
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: [{ startAt: "asc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toCandidateEventSummary));
  }

  async findVisibleCandidateEvent(
    id: string,
    assignedOrganizationUnitId: string | null,
    userId: string,
    now = new Date()
  ): Promise<CandidateEventDetail | null> {
    const record = await this.prisma.event.findFirst({
      where: candidateEventDetailWhere(id, assignedOrganizationUnitId, now),
      include: {
        participations: {
          where: {
            userId,
            cancelledAt: null
          },
          take: 1,
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    return record ? toCandidateEventDetail(record) : null;
  }

  findVisibleCandidateAnnouncements(
    query: CandidateAnnouncementListQuery,
    assignedOrganizationUnitId: string | null,
    now = new Date()
  ): Promise<CandidateAnnouncementSummary[]> {
    return this.prisma.announcement
      .findMany({
        where: candidateAnnouncementWhere(assignedOrganizationUnitId, now),
        orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toCandidateAnnouncementSummary));
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

interface CandidateEventDetailRecord extends CandidateEventRecord {
  description: string | null;
  participations: readonly OwnEventParticipationRecord[];
}

interface CandidateEventListRecord extends CandidateEventRecord {
  participations: readonly OwnEventParticipationRecord[];
}

interface OwnEventParticipationRecord {
  id: string;
  eventId: string;
  intentStatus: string;
  createdAt: Date;
  cancelledAt: Date | null;
}

interface CandidateAnnouncementRecord {
  id: string;
  title: string;
  body: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  pinned: boolean;
  publishedAt: Date | null;
}

export function candidateDashboardEventWhere(
  assignedOrganizationUnitId: string | null,
  now: Date
): Prisma.EventWhereInput {
  return candidateEventWhere({ limit: 3, offset: 0 }, assignedOrganizationUnitId, now);
}

export function candidateEventWhere(
  query: Pick<CandidateEventListQuery, "from" | "type" | "limit" | "offset">,
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
    cancelledAt: null,
    startAt: { gte: query.from ? new Date(query.from) : now },
    ...(query.type ? { type: query.type } : {}),
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    AND: [
      {
        OR: visibilityWhere
      }
    ]
  };
}

export function candidateEventDetailWhere(
  id: string,
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
    id,
    status: "published",
    archivedAt: null,
    cancelledAt: null,
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    AND: [
      {
        OR: visibilityWhere
      }
    ]
  };
}

export function candidateAnnouncementWhere(
  assignedOrganizationUnitId: string | null,
  now: Date
): Prisma.AnnouncementWhereInput {
  const visibilityWhere: Prisma.AnnouncementWhereInput[] = [
    { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } }
  ];

  if (assignedOrganizationUnitId) {
    visibilityWhere.push({
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: assignedOrganizationUnitId
    });
  }

  return {
    status: "PUBLISHED",
    archivedAt: null,
    publishedAt: { lte: now },
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

function toCandidateEventSummary(record: CandidateEventListRecord): CandidateEventSummary {
  return {
    ...toCandidateDashboardEvent(record),
    currentUserParticipation: record.participations[0]
      ? toOwnEventParticipation(record.participations[0])
      : null
  };
}

function toCandidateEventDetail(record: CandidateEventDetailRecord): CandidateEventDetail {
  return {
    ...toCandidateEventSummary(record),
    description: record.description,
  };
}

function toOwnEventParticipation(
  record: OwnEventParticipationRecord
): CandidateEventDetail["currentUserParticipation"] {
  return {
    id: record.id,
    eventId: record.eventId,
    intentStatus: toParticipationStatus(record.intentStatus),
    createdAt: record.createdAt.toISOString(),
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null
  };
}

function toCandidateAnnouncementSummary(
  record: CandidateAnnouncementRecord
): CandidateAnnouncementSummary {
  if (!record.publishedAt) {
    throw new Error("Repository returned an unpublished candidate announcement.");
  }

  return {
    id: record.id,
    title: record.title,
    body: record.body,
    visibility: toCandidateAnnouncementVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    pinned: record.pinned,
    publishedAt: record.publishedAt.toISOString()
  };
}

function toParticipationStatus(
  value: string
): NonNullable<CandidateEventDetail["currentUserParticipation"]>["intentStatus"] {
  if (value === "planning_to_attend" || value === "cancelled") {
    return value;
  }

  throw new Error("Repository returned an unknown event participation status.");
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

function toCandidateAnnouncementVisibility(
  visibility: string
): CandidateAnnouncementSummary["visibility"] {
  if (
    visibility === "PUBLIC" ||
    visibility === "FAMILY_OPEN" ||
    visibility === "CANDIDATE" ||
    visibility === "ORGANIZATION_UNIT"
  ) {
    return visibility;
  }

  throw new Error("Repository returned an announcement visibility hidden from candidates.");
}
