import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type { BrotherProfile, BrotherTodayEventSummary } from "./brother-companion.types.js";

export abstract class BrotherCompanionRepository {
  abstract findActiveBrotherProfile(userId: string): Promise<BrotherProfile | null>;
  abstract findUpcomingEvents(
    organizationUnitIds: readonly string[],
    now?: Date
  ): Promise<BrotherTodayEventSummary[]>;
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

export function brotherUpcomingEventWhere(
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
    startAt: { gte: now },
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    AND: [
      {
        OR: visibilityWhere
      }
    ]
  };
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
