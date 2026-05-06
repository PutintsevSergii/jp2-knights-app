import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  BrotherAnnouncementListQuery,
  BrotherAnnouncementSummary,
  BrotherEventDetail,
  BrotherEventListQuery,
  BrotherEventSummary,
  BrotherPrayerCategorySummary,
  BrotherPrayerListQuery,
  BrotherPrayerSummary,
  BrotherProfile,
  BrotherTodayEventSummary
} from "./brother-companion.types.js";

export abstract class BrotherCompanionRepository {
  abstract findActiveBrotherProfile(userId: string): Promise<BrotherProfile | null>;
  abstract findUpcomingEvents(
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherTodayEventSummary[]>;
  abstract findVisibleBrotherEvents(
    query: BrotherEventListQuery,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherEventSummary[]>;
  abstract findVisibleBrotherEvent(
    id: string,
    organizationUnitIds: readonly string[],
    userId: string,
    now?: Date
  ): Promise<BrotherEventDetail | null>;
  abstract findVisibleBrotherAnnouncements(
    query: BrotherAnnouncementListQuery,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherAnnouncementSummary[]>;
  abstract findPublishedBrotherPrayerCategories(
    language: string | undefined,
    now?: Date
  ): Promise<BrotherPrayerCategorySummary[]>;
  abstract findVisibleBrotherPrayers(
    query: BrotherPrayerListQuery,
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherPrayerSummary[]>;
}

@Injectable()
export class PrismaBrotherCompanionRepository extends BrotherCompanionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveBrotherProfile(userId: string): Promise<BrotherProfile | null> {
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
      include: brotherProfileInclude
    });

    const profile = record ? toBrotherProfile(record) : null;

    return profile && profile.memberships.length > 0 ? profile : null;
  }

  findUpcomingEvents(
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherTodayEventSummary[]> {
    return this.prisma.event
      .findMany({
        where: brotherUpcomingEventWhere(organizationUnitIds, now),
        orderBy: [{ startAt: "asc" }, { title: "asc" }],
        take: 3
      })
      .then((records) => records.map(toBrotherTodayEvent));
  }

  findVisibleBrotherEvents(
    query: BrotherEventListQuery,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherEventSummary[]> {
    return this.prisma.event
      .findMany({
        where: brotherEventWhere(query, organizationUnitIds, now),
        orderBy: [{ startAt: "asc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toBrotherTodayEvent));
  }

  async findVisibleBrotherEvent(
    id: string,
    organizationUnitIds: readonly string[],
    userId: string,
    now = new Date()
  ): Promise<BrotherEventDetail | null> {
    const record = await this.prisma.event.findFirst({
      where: brotherEventDetailWhere(id, organizationUnitIds, now),
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

    return record ? toBrotherEventDetail(record) : null;
  }

  findVisibleBrotherAnnouncements(
    query: BrotherAnnouncementListQuery,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherAnnouncementSummary[]> {
    return this.prisma.announcement
      .findMany({
        where: brotherAnnouncementWhere(organizationUnitIds, now),
        orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toBrotherAnnouncementSummary));
  }

  findPublishedBrotherPrayerCategories(
    language: string | undefined,
    now = new Date()
  ): Promise<BrotherPrayerCategorySummary[]> {
    return this.prisma.prayerCategory
      .findMany({
        where: {
          language: language ?? "en",
          status: "PUBLISHED",
          archivedAt: null,
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
        },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
      })
      .then((records) => records.map(toBrotherPrayerCategorySummary));
  }

  findVisibleBrotherPrayers(
    query: BrotherPrayerListQuery,
    organizationUnitIds: readonly string[],
    now = new Date()
  ): Promise<BrotherPrayerSummary[]> {
    return this.prisma.prayer
      .findMany({
        where: brotherPrayerWhere(query, organizationUnitIds, now),
        include: brotherPrayerCategoryInclude,
        orderBy: [{ title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toBrotherPrayerSummary));
  }
}

const brotherProfileInclude = {
  roles: {
    where: {
      revokedAt: null
    },
    select: {
      role: true
    }
  },
  memberships: {
    where: {
      status: "active",
      archivedAt: null,
      organizationUnit: {
        status: "active",
        archivedAt: null
      }
    },
    include: {
      organizationUnit: true
    },
    orderBy: [{ organizationUnit: { country: "asc" } }, { organizationUnit: { city: "asc" } }]
  }
} satisfies Prisma.UserInclude;

interface BrotherProfileRecord {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  preferredLanguage: string | null;
  roles: readonly { role: "CANDIDATE" | "BROTHER" | "OFFICER" | "SUPER_ADMIN" }[];
  memberships: readonly {
    id: string;
    currentDegree: string | null;
    joinedAt: Date | null;
    organizationUnit: {
      id: string;
      type: "ORDER" | "PROVINCE" | "COMMANDERY" | "CHORAGIEW" | "OTHER";
      parentUnitId: string | null;
      name: string;
      city: string;
      country: string;
      parish: string | null;
      publicDescription: string | null;
      status: "active" | "archived";
    };
  }[];
}

interface BrotherEventRecord {
  id: string;
  title: string;
  type: string;
  startAt: Date;
  endAt: Date | null;
  locationLabel: string | null;
  visibility: string;
}

interface BrotherEventDetailRecord extends BrotherEventRecord {
  description: string | null;
  participations: readonly OwnEventParticipationRecord[];
}

interface OwnEventParticipationRecord {
  id: string;
  eventId: string;
  intentStatus: string;
  createdAt: Date;
  cancelledAt: Date | null;
}

interface BrotherAnnouncementRecord {
  id: string;
  title: string;
  body: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  pinned: boolean;
  publishedAt: Date | null;
}

const brotherPrayerCategoryInclude = {
  category: {
    select: {
      id: true,
      slug: true,
      title: true,
      language: true
    }
  }
} as const;

interface BrotherPrayerCategoryRecord {
  id: string;
  slug: string;
  title: string;
  language: string;
}

interface BrotherPrayerRecord {
  id: string;
  title: string;
  body: string;
  language: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  category: BrotherPrayerCategoryRecord | null;
}

export function brotherUpcomingEventWhere(
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.EventWhereInput {
  return brotherEventWhere({ limit: 3, offset: 0 }, organizationUnitIds, now);
}

export function brotherEventWhere(
  query: Pick<BrotherEventListQuery, "from" | "type" | "limit" | "offset">,
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

  return {
    status: "published",
    archivedAt: null,
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

export function brotherEventDetailWhere(
  id: string,
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

export function brotherAnnouncementWhere(
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.AnnouncementWhereInput {
  const visibilityWhere: Prisma.AnnouncementWhereInput[] = [
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

function toBrotherAnnouncementSummary(record: BrotherAnnouncementRecord): BrotherAnnouncementSummary {
  if (!record.publishedAt) {
    throw new Error("Repository returned an unpublished brother announcement.");
  }

  return {
    id: record.id,
    title: record.title,
    body: record.body,
    visibility: toBrotherAnnouncementVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    pinned: record.pinned,
    publishedAt: record.publishedAt.toISOString()
  };
}

export function brotherPrayerWhere(
  query: BrotherPrayerListQuery,
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.PrayerWhereInput {
  const visibilityWhere: Prisma.PrayerWhereInput[] = [
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

  const and: Prisma.PrayerWhereInput[] = [
    {
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
    },
    {
      OR: visibilityWhere
    }
  ];

  const where: Prisma.PrayerWhereInput = {
    language: query.language ?? "en",
    status: "PUBLISHED",
    archivedAt: null,
    AND: and
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q, mode: "insensitive" } },
        { body: { contains: query.q, mode: "insensitive" } }
      ]
    });
  }

  return where;
}

function toBrotherProfile(record: BrotherProfileRecord): BrotherProfile {
  return {
    id: record.id,
    displayName: record.displayName,
    email: record.email,
    phone: record.phone,
    preferredLanguage: record.preferredLanguage,
    status: "active",
    roles: record.roles.map((role) => role.role),
    memberships: record.memberships.map((membership) => ({
      id: membership.id,
      currentDegree: membership.currentDegree,
      joinedAt: membership.joinedAt ? membership.joinedAt.toISOString().slice(0, 10) : null,
      organizationUnit: {
        id: membership.organizationUnit.id,
        type: membership.organizationUnit.type,
        parentUnitId: membership.organizationUnit.parentUnitId,
        name: membership.organizationUnit.name,
        city: membership.organizationUnit.city,
        country: membership.organizationUnit.country,
        parish: membership.organizationUnit.parish,
        publicDescription: membership.organizationUnit.publicDescription,
        status: membership.organizationUnit.status
      }
    }))
  };
}

function toBrotherTodayEvent(record: BrotherEventRecord): BrotherTodayEventSummary {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt ? record.endAt.toISOString() : null,
    locationLabel: record.locationLabel,
    visibility: toBrotherEventVisibility(record.visibility)
  };
}

function toBrotherEventDetail(record: BrotherEventDetailRecord): BrotherEventDetail {
  return {
    ...toBrotherTodayEvent(record),
    description: record.description,
    currentUserParticipation: record.participations[0]
      ? toOwnEventParticipation(record.participations[0])
      : null
  };
}

function toOwnEventParticipation(
  record: OwnEventParticipationRecord
): BrotherEventDetail["currentUserParticipation"] {
  return {
    id: record.id,
    eventId: record.eventId,
    intentStatus: toParticipationStatus(record.intentStatus),
    createdAt: record.createdAt.toISOString(),
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null
  };
}

function toParticipationStatus(
  value: string
): NonNullable<BrotherEventDetail["currentUserParticipation"]>["intentStatus"] {
  if (value === "planning_to_attend" || value === "cancelled") {
    return value;
  }

  throw new Error("Repository returned an unknown event participation status.");
}

function toBrotherPrayerCategorySummary(
  record: BrotherPrayerCategoryRecord
): BrotherPrayerCategorySummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    language: record.language
  };
}

function toBrotherPrayerSummary(record: BrotherPrayerRecord): BrotherPrayerSummary {
  return {
    id: record.id,
    title: record.title,
    excerpt: excerpt(record.body),
    language: record.language,
    visibility: toBrotherPrayerVisibility(record.visibility),
    targetOrganizationUnitId: record.targetOrganizationUnitId,
    category: record.category ? toBrotherPrayerCategorySummary(record.category) : null
  };
}

function toBrotherEventVisibility(visibility: string): BrotherTodayEventSummary["visibility"] {
  if (
    visibility === "PUBLIC" ||
    visibility === "FAMILY_OPEN" ||
    visibility === "BROTHER" ||
    visibility === "ORGANIZATION_UNIT"
  ) {
    return visibility;
  }

  throw new Error("Repository returned an event visibility hidden from brothers.");
}

function toBrotherPrayerVisibility(visibility: string): BrotherPrayerSummary["visibility"] {
  if (
    visibility === "PUBLIC" ||
    visibility === "FAMILY_OPEN" ||
    visibility === "BROTHER" ||
    visibility === "ORGANIZATION_UNIT"
  ) {
    return visibility;
  }

  throw new Error("Repository returned a prayer visibility hidden from brothers.");
}

function toBrotherAnnouncementVisibility(
  visibility: string
): BrotherAnnouncementSummary["visibility"] {
  if (
    visibility === "PUBLIC" ||
    visibility === "FAMILY_OPEN" ||
    visibility === "BROTHER" ||
    visibility === "ORGANIZATION_UNIT"
  ) {
    return visibility;
  }

  throw new Error("Repository returned an announcement visibility hidden from brothers.");
}

function excerpt(value: string): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length <= 240 ? collapsed : `${collapsed.slice(0, 237)}...`;
}
