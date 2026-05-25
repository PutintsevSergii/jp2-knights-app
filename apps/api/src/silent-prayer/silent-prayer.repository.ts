import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  BrotherSilentPrayerEventSummary,
  PublicSilentPrayerEventSummary,
  SilentPrayerListQuery
} from "./silent-prayer.types.js";

export abstract class SilentPrayerRepository {
  abstract findPublicSessions(
    query: SilentPrayerListQuery,
    now?: Date
  ): Promise<PublicSilentPrayerEventSummary[]>;
  abstract findPublicJoinableSession(
    id: string,
    now?: Date
  ): Promise<PublicSilentPrayerEventSummary | null>;
  abstract findBrotherSessions(
    query: SilentPrayerListQuery,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherSilentPrayerEventSummary[]>;
  abstract findBrotherJoinableSession(
    id: string,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherSilentPrayerEventSummary | null>;
  abstract findActiveBrotherOrganizationUnitIds(userId: string): Promise<readonly string[] | null>;
}

@Injectable()
export class PrismaSilentPrayerRepository implements SilentPrayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublicSessions(
    query: SilentPrayerListQuery,
    now = new Date()
  ): Promise<PublicSilentPrayerEventSummary[]> {
    return this.prisma.silentPrayerEvent
      .findMany({
        where: publicSilentPrayerWhere(now),
        orderBy: [{ startsAt: "asc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toPublicSilentPrayerEventSummary));
  }

  async findPublicJoinableSession(
    id: string,
    now = new Date()
  ): Promise<PublicSilentPrayerEventSummary | null> {
    const record = await this.prisma.silentPrayerEvent.findFirst({
      where: {
        id,
        ...publicSilentPrayerWhere(now)
      }
    });

    return record ? toPublicSilentPrayerEventSummary(record) : null;
  }

  findBrotherSessions(
    query: SilentPrayerListQuery,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherSilentPrayerEventSummary[]> {
    return this.prisma.silentPrayerEvent
      .findMany({
        where: brotherSilentPrayerWhere(organizationUnitIds, now),
        orderBy: [{ startsAt: "asc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toBrotherSilentPrayerEventSummary));
  }

  async findBrotherJoinableSession(
    id: string,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherSilentPrayerEventSummary | null> {
    const record = await this.prisma.silentPrayerEvent.findFirst({
      where: {
        id,
        ...brotherSilentPrayerWhere(organizationUnitIds, now)
      }
    });

    return record ? toBrotherSilentPrayerEventSummary(record) : null;
  }

  async findActiveBrotherOrganizationUnitIds(userId: string): Promise<readonly string[] | null> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
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
    });

    return memberships.length > 0
      ? memberships.map((membership) => membership.organizationUnitId)
      : null;
  }
}

interface SilentPrayerEventRecord {
  id: string;
  title: string;
  intention: string | null;
  startsAt: Date;
  endsAt: Date | null;
  visibility: string;
  targetOrganizationUnitId: string | null;
}

function publicSilentPrayerWhere(now: Date): Prisma.SilentPrayerEventWhereInput {
  return {
    visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
    status: "PUBLISHED",
    archivedAt: null,
    cancelledAt: null,
    startsAt: { lte: now },
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } }
    ],
    AND: [
      {
        OR: [{ endsAt: null }, { endsAt: { gt: now } }]
      }
    ]
  };
}

function brotherSilentPrayerWhere(
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.SilentPrayerEventWhereInput {
  return {
    status: "PUBLISHED",
    archivedAt: null,
    cancelledAt: null,
    startsAt: { lte: now },
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } }
    ],
    AND: [
      {
        OR: [{ endsAt: null }, { endsAt: { gt: now } }]
      },
      {
        OR: [
          { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
          {
            visibility: "ORGANIZATION_UNIT",
            targetOrganizationUnitId: { in: [...organizationUnitIds] }
          }
        ]
      }
    ]
  };
}

function toPublicSilentPrayerEventSummary(
  record: SilentPrayerEventRecord
): PublicSilentPrayerEventSummary {
  return {
    id: record.id,
    title: record.title,
    intention: record.intention,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt ? record.endsAt.toISOString() : null,
    visibility: toPublicSilentPrayerVisibility(record.visibility),
    activeCount: 0
  };
}

function toBrotherSilentPrayerEventSummary(
  record: SilentPrayerEventRecord
): BrotherSilentPrayerEventSummary {
  return {
    ...toPublicSilentPrayerEventBase(record),
    visibility: toBrotherSilentPrayerVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    activeCount: 0
  };
}

function toPublicSilentPrayerEventBase(record: SilentPrayerEventRecord) {
  return {
    id: record.id,
    title: record.title,
    intention: record.intention,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt ? record.endsAt.toISOString() : null
  };
}

function toPublicSilentPrayerVisibility(value: string): "PUBLIC" | "FAMILY_OPEN" {
  if (value === "PUBLIC" || value === "FAMILY_OPEN") {
    return value;
  }

  throw new Error("Repository returned non-public silent-prayer visibility.");
}

function toBrotherSilentPrayerVisibility(
  value: string
): "PUBLIC" | "FAMILY_OPEN" | "BROTHER" | "ORGANIZATION_UNIT" {
  if (
    value === "PUBLIC" ||
    value === "FAMILY_OPEN" ||
    value === "BROTHER" ||
    value === "ORGANIZATION_UNIT"
  ) {
    return value;
  }

  throw new Error("Repository returned non-brother silent-prayer visibility.");
}
