import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type { EventParticipationSummary } from "./event-participation.types.js";

export abstract class EventParticipationRepository {
  abstract findActiveCandidateOrganizationUnitId(
    userId: string
  ): Promise<string | null | undefined>;
  abstract findActiveBrotherOrganizationUnitIds(userId: string): Promise<readonly string[] | null>;
  abstract canParticipateInCandidateEvent(
    eventId: string,
    assignedOrganizationUnitId: string | null,
    now?: Date
  ): Promise<boolean>;
  abstract canParticipateInBrotherEvent(
    eventId: string,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<boolean>;
  abstract markPlanningToAttend(
    userId: string,
    eventId: string,
    now?: Date
  ): Promise<EventParticipationSummary>;
  abstract cancelOwnParticipation(
    userId: string,
    eventId: string,
    now?: Date
  ): Promise<EventParticipationSummary | null>;
}

@Injectable()
export class PrismaEventParticipationRepository extends EventParticipationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveCandidateOrganizationUnitId(
    userId: string
  ): Promise<string | null | undefined> {
    const record = await this.prisma.candidateProfile.findFirst({
      where: {
        userId,
        status: "active",
        archivedAt: null
      },
      select: {
        assignedOrganizationUnitId: true
      }
    });

    return record ? record.assignedOrganizationUnitId : undefined;
  }

  async findActiveBrotherOrganizationUnitIds(
    userId: string
  ): Promise<readonly string[] | null> {
    const record = await this.prisma.user.findFirst({
      where: {
        id: userId,
        status: "active",
        archivedAt: null,
        roles: {
          some: {
            role: "BROTHER",
            revokedAt: null
          }
        }
      },
      select: {
        memberships: {
          where: {
            status: "active",
            archivedAt: null,
            organizationUnit: {
              status: "active",
              archivedAt: null
            }
          },
          select: {
            organizationUnitId: true
          }
        }
      }
    });

    if (!record || record.memberships.length === 0) {
      return null;
    }

    return record.memberships.map((membership) => membership.organizationUnitId);
  }

  async canParticipateInCandidateEvent(
    eventId: string,
    assignedOrganizationUnitId: string | null,
    now = new Date()
  ): Promise<boolean> {
    const record = await this.prisma.event.findFirst({
      where: candidateParticipationEventWhere(eventId, assignedOrganizationUnitId, now),
      select: {
        id: true
      }
    });

    return Boolean(record);
  }

  async canParticipateInBrotherEvent(
    eventId: string,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<boolean> {
    const record = await this.prisma.event.findFirst({
      where: brotherParticipationEventWhere(eventId, organizationUnitIds, now),
      select: {
        id: true
      }
    });

    return Boolean(record);
  }

  markPlanningToAttend(
    userId: string,
    eventId: string,
    now = new Date()
  ): Promise<EventParticipationSummary> {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.eventParticipation.findFirst({
        where: {
          eventId,
          userId,
          cancelledAt: null
        }
      });

      if (existing) {
        return toEventParticipationSummary(existing);
      }

      const created = await transaction.eventParticipation.create({
        data: {
          eventId,
          userId,
          intentStatus: "planning_to_attend",
          createdAt: now
        }
      });

      return toEventParticipationSummary(created);
    });
  }

  async cancelOwnParticipation(
    userId: string,
    eventId: string,
    now = new Date()
  ): Promise<EventParticipationSummary | null> {
    const existing = await this.prisma.eventParticipation.findFirst({
      where: {
        eventId,
        userId,
        cancelledAt: null
      }
    });

    if (!existing) {
      return null;
    }

    const cancelled = await this.prisma.eventParticipation.update({
      where: {
        id: existing.id
      },
      data: {
        intentStatus: "cancelled",
        cancelledAt: now
      }
    });

    return toEventParticipationSummary(cancelled);
  }
}

export function candidateParticipationEventWhere(
  eventId: string,
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

  return publishedOpenEventWhere(eventId, now, visibilityWhere);
}

export function brotherParticipationEventWhere(
  eventId: string,
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.EventWhereInput {
  const visibilityWhere: Prisma.EventWhereInput[] = [
    { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } }
  ];

  if (organizationUnitIds.length > 0) {
    visibilityWhere.push({
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: {
        in: [...organizationUnitIds]
      }
    });
  }

  return publishedOpenEventWhere(eventId, now, visibilityWhere);
}

function publishedOpenEventWhere(
  eventId: string,
  now: Date,
  visibilityWhere: Prisma.EventWhereInput[]
): Prisma.EventWhereInput {
  return {
    id: eventId,
    status: "published",
    archivedAt: null,
    cancelledAt: null,
    startAt: { gte: now },
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    AND: [
      {
        OR: visibilityWhere
      }
    ]
  };
}

interface EventParticipationRecord {
  id: string;
  eventId: string;
  intentStatus: string;
  createdAt: Date;
  cancelledAt: Date | null;
}

function toEventParticipationSummary(record: EventParticipationRecord): EventParticipationSummary {
  return {
    id: record.id,
    eventId: record.eventId,
    intentStatus: toParticipationStatus(record.intentStatus),
    createdAt: record.createdAt.toISOString(),
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null
  };
}

function toParticipationStatus(value: string): EventParticipationSummary["intentStatus"] {
  if (value === "planning_to_attend" || value === "cancelled") {
    return value;
  }

  throw new Error("Repository returned an unknown event participation status.");
}
