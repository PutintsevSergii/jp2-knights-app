import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { ContentStatus, Visibility } from "@jp2/shared-types";
import { PrismaService } from "../database/prisma.service.js";

export interface AnnouncementPushRecipientTarget {
  visibility: Visibility;
  targetOrganizationUnitId: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  archivedAt: string | null;
}

export abstract class AnnouncementPushRecipientRepository {
  abstract findRecipientTokenIds(
    announcement: AnnouncementPushRecipientTarget
  ): Promise<string[]>;
}

@Injectable()
export class PrismaAnnouncementPushRecipientRepository
  implements AnnouncementPushRecipientRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findRecipientTokenIds(
    announcement: AnnouncementPushRecipientTarget
  ): Promise<string[]> {
    const userWhere = announcementPushRecipientUserWhere(announcement);

    if (!userWhere) {
      return [];
    }

    const records = await this.prisma.deviceToken.findMany({
      where: {
        revokedAt: null,
        user: userWhere
      },
      select: {
        id: true
      },
      orderBy: {
        lastSeenAt: "desc"
      }
    });

    return records.map((record) => record.id);
  }
}

export function announcementPushRecipientUserWhere(
  announcement: AnnouncementPushRecipientTarget
): Prisma.UserWhereInput | null {
  if (
    announcement.status !== "PUBLISHED" ||
    announcement.archivedAt ||
    !announcement.publishedAt
  ) {
    return null;
  }

  const audienceWhere = announcementAudienceWhere(announcement);

  if (audienceWhere.length === 0) {
    return null;
  }

  return {
    status: "active",
    archivedAt: null,
    notificationPreferences: {
      none: {
        category: "announcements",
        enabled: false
      }
    },
    OR: audienceWhere
  };
}

function announcementAudienceWhere(
  announcement: AnnouncementPushRecipientTarget
): Prisma.UserWhereInput[] {
  switch (announcement.visibility) {
    case "PUBLIC":
    case "FAMILY_OPEN":
      return [candidateRecipientWhere(), brotherRecipientWhere()];
    case "CANDIDATE":
      return [candidateRecipientWhere()];
    case "BROTHER":
      return [brotherRecipientWhere()];
    case "ORGANIZATION_UNIT":
      return announcement.targetOrganizationUnitId
        ? [
            candidateRecipientWhere(announcement.targetOrganizationUnitId),
            brotherRecipientWhere(announcement.targetOrganizationUnitId)
          ]
        : [];
    case "OFFICER":
    case "ADMIN":
      return [];
  }
}

function candidateRecipientWhere(
  organizationUnitId?: string
): Prisma.UserWhereInput {
  return {
    roles: {
      some: {
        role: "CANDIDATE",
        revokedAt: null
      }
    },
    candidateProfiles: {
      some: {
        status: "active",
        archivedAt: null,
        ...(organizationUnitId ? { assignedOrganizationUnitId: organizationUnitId } : {})
      }
    }
  };
}

function brotherRecipientWhere(organizationUnitId?: string): Prisma.UserWhereInput {
  return {
    roles: {
      some: {
        role: "BROTHER",
        revokedAt: null
      }
    },
    memberships: {
      some: {
        status: "active",
        archivedAt: null,
        ...(organizationUnitId ? { organizationUnitId } : {})
      }
    }
  };
}
