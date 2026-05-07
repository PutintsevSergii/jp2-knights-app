import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  announcementPushRecipientUserWhere,
  PrismaAnnouncementPushRecipientRepository
} from "./announcement-push-recipient.repository.js";

const publishedPublicAnnouncement = {
  visibility: "PUBLIC" as const,
  targetOrganizationUnitId: null,
  status: "PUBLISHED" as const,
  publishedAt: "2026-05-07T10:00:00.000Z",
  archivedAt: null
};

const organizationUnitId = "11111111-1111-4111-8111-111111111111";

describe("PrismaAnnouncementPushRecipientRepository", () => {
  it("selects active non-revoked token ids for announcement recipients", async () => {
    const { deviceTokenFindMany, prisma } = prismaMock(["token_1", "token_2"]);

    await expect(
      new PrismaAnnouncementPushRecipientRepository(prisma).findRecipientTokenIds(
        publishedPublicAnnouncement
      )
    ).resolves.toEqual(["token_1", "token_2"]);
    expect(deviceTokenFindMany).toHaveBeenCalledWith({
      where: {
        revokedAt: null,
        user: announcementPushRecipientUserWhere(publishedPublicAnnouncement)
      },
      select: {
        id: true
      },
      orderBy: {
        lastSeenAt: "desc"
      }
    });
  });

  it("does not query tokens when the announcement is not push-deliverable", async () => {
    const { deviceTokenFindMany, prisma } = prismaMock(["token_1"]);

    await expect(
      new PrismaAnnouncementPushRecipientRepository(prisma).findRecipientTokenIds({
        ...publishedPublicAnnouncement,
        status: "DRAFT"
      })
    ).resolves.toEqual([]);
    await expect(
      new PrismaAnnouncementPushRecipientRepository(prisma).findRecipientTokenIds({
        ...publishedPublicAnnouncement,
        visibility: "ADMIN"
      })
    ).resolves.toEqual([]);
    expect(deviceTokenFindMany).not.toHaveBeenCalled();
  });
});

describe("announcementPushRecipientUserWhere", () => {
  it("targets active candidates and brothers for public announcements while respecting opt-outs", () => {
    expect(announcementPushRecipientUserWhere(publishedPublicAnnouncement)).toEqual({
      status: "active",
      archivedAt: null,
      notificationPreferences: {
        none: {
          category: "announcements",
          enabled: false
        }
      },
      OR: [candidateRecipientWhere(), brotherRecipientWhere()]
    });
  });

  it("targets only candidates for candidate announcements", () => {
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "CANDIDATE"
      })
    ).toEqual({
      status: "active",
      archivedAt: null,
      notificationPreferences: {
        none: {
          category: "announcements",
          enabled: false
        }
      },
      OR: [candidateRecipientWhere()]
    });
  });

  it("targets only brothers for brother announcements", () => {
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "BROTHER"
      })
    ).toEqual({
      status: "active",
      archivedAt: null,
      notificationPreferences: {
        none: {
          category: "announcements",
          enabled: false
        }
      },
      OR: [brotherRecipientWhere()]
    });
  });

  it("targets candidate profiles and brother memberships in the announcement organization unit", () => {
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: organizationUnitId
      })
    ).toEqual({
      status: "active",
      archivedAt: null,
      notificationPreferences: {
        none: {
          category: "announcements",
          enabled: false
        }
      },
      OR: [
        candidateRecipientWhere(organizationUnitId),
        brotherRecipientWhere(organizationUnitId)
      ]
    });
  });

  it("does not target unpublished, archived, unscoped organization-unit, officer, or admin announcements", () => {
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        publishedAt: null
      })
    ).toBeNull();
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        archivedAt: "2026-05-07T12:00:00.000Z"
      })
    ).toBeNull();
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "ORGANIZATION_UNIT"
      })
    ).toBeNull();
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "OFFICER"
      })
    ).toBeNull();
    expect(
      announcementPushRecipientUserWhere({
        ...publishedPublicAnnouncement,
        visibility: "ADMIN"
      })
    ).toBeNull();
  });
});

function candidateRecipientWhere(organizationUnitId?: string) {
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

function brotherRecipientWhere(organizationUnitId?: string) {
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

function prismaMock(tokenIds: string[]) {
  const deviceTokenFindMany = vi.fn(() =>
    Promise.resolve(tokenIds.map((id) => ({ id })))
  );

  return {
    deviceTokenFindMany,
    prisma: {
      deviceToken: {
        findMany: deviceTokenFindMany
      }
    } as unknown as PrismaService
  };
}
