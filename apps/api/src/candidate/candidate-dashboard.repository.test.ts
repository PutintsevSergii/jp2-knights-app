import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  candidateAnnouncementWhere,
  candidateEventDetailWhere,
  candidateEventWhere,
  candidateDashboardEventWhere,
  PrismaCandidateDashboardRepository
} from "./candidate-dashboard.repository.js";

describe("candidateDashboardEventWhere", () => {
  it("allows public, family-open, candidate, and assigned organization-unit events only", () => {
    expect(
      candidateDashboardEventWhere(
        "11111111-1111-4111-8111-111111111111",
        new Date("2026-05-05T00:00:00.000Z")
      )
    ).toEqual({
      status: "published",
      archivedAt: null,
      cancelledAt: null,
      startAt: { gte: new Date("2026-05-05T00:00:00.000Z") },
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date("2026-05-05T00:00:00.000Z") } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
            }
          ]
        }
      ]
    });
  });

  it("does not include organization-unit events for unassigned candidates", () => {
    expect(candidateDashboardEventWhere(null, new Date("2026-05-05T00:00:00.000Z"))).toEqual(
      expect.objectContaining({
        AND: [
          {
            OR: [{ visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } }]
          }
        ]
      })
    );
  });
});

describe("candidateEventWhere", () => {
  it("applies filters and excludes cancelled, archived, unpublished, and hidden events", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(
      candidateEventWhere(
        {
          from: "2026-06-01T00:00:00.000Z",
          type: "formation",
          limit: 20,
          offset: 0
        },
        "11111111-1111-4111-8111-111111111111",
        now
      )
    ).toEqual({
      status: "published",
      archivedAt: null,
      cancelledAt: null,
      startAt: { gte: new Date("2026-06-01T00:00:00.000Z") },
      type: "formation",
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
            }
          ]
        }
      ]
    });
  });
});

describe("candidateEventDetailWhere", () => {
  it("limits detail reads to published non-cancelled candidate-visible events", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(
      candidateEventDetailWhere(
        "44444444-4444-4444-8444-444444444444",
        "11111111-1111-4111-8111-111111111111",
        now
      )
    ).toEqual({
      id: "44444444-4444-4444-8444-444444444444",
      status: "published",
      archivedAt: null,
      cancelledAt: null,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
            }
          ]
        }
      ]
    });
  });
});

describe("candidateAnnouncementWhere", () => {
  it("limits announcements to published candidate-visible and assigned organization-unit messages", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(
      candidateAnnouncementWhere("11111111-1111-4111-8111-111111111111", now)
    ).toEqual({
      status: "PUBLISHED",
      archivedAt: null,
      publishedAt: { lte: now },
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
            }
          ]
        }
      ]
    });
    expect(candidateAnnouncementWhere(null, now)).toEqual({
      status: "PUBLISHED",
      archivedAt: null,
      publishedAt: { lte: now },
      AND: [
        {
          OR: [{ visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } }]
        }
      ]
    });
  });
});

describe("PrismaCandidateDashboardRepository", () => {
  it("maps active candidate profile assignment and responsible officer contact fields", async () => {
    const { candidateProfileFindFirst, prisma } = prismaMock();
    candidateProfileFindFirst.mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      user: {
        displayName: "Demo Candidate",
        email: "candidate@example.test",
        preferredLanguage: "en"
      },
      assignedOrganizationUnit: {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Pilot Choragiew",
        city: "Riga",
        country: "Latvia",
        parish: null
      },
      responsibleOfficer: {
        id: "44444444-4444-4444-8444-444444444444",
        displayName: "Responsible Officer",
        email: "officer@example.test",
        phone: null
      }
    });

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findActiveProfile(
        "22222222-2222-4222-8222-222222222222"
      )
    ).resolves.toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      displayName: "Demo Candidate",
      email: "candidate@example.test",
      preferredLanguage: "en",
      status: "active",
      assignedOrganizationUnit: {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Pilot Choragiew",
        city: "Riga",
        country: "Latvia",
        parish: null
      },
      responsibleOfficer: {
        id: "44444444-4444-4444-8444-444444444444",
        displayName: "Responsible Officer",
        email: "officer@example.test",
        phone: null
      }
    });
    expect(candidateProfileFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "22222222-2222-4222-8222-222222222222",
          status: "active",
          archivedAt: null
        }
      })
    );
  });

  it("returns null when no active candidate profile exists", async () => {
    const { prisma } = prismaMock();

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findActiveProfile(
        "22222222-2222-4222-8222-222222222222"
      )
    ).resolves.toBeNull();
  });

  it("maps upcoming candidate-visible events and rejects hidden visibility leaks", async () => {
    const { eventFindMany, prisma } = prismaMock();
    eventFindMany.mockResolvedValueOnce([
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Candidate Gathering",
        type: "formation",
        startAt: new Date("2026-06-01T10:00:00.000Z"),
        endAt: null,
        locationLabel: "Riga",
        visibility: "ORGANIZATION_UNIT"
      }
    ]);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findUpcomingEvents(
        "33333333-3333-4333-8333-333333333333",
        new Date("2026-05-05T00:00:00.000Z")
      )
    ).resolves.toEqual([
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Candidate Gathering",
        type: "formation",
        startAt: "2026-06-01T10:00:00.000Z",
        endAt: null,
        locationLabel: "Riga",
        visibility: "ORGANIZATION_UNIT"
      }
    ]);

    eventFindMany.mockResolvedValueOnce([
      {
        id: "66666666-6666-4666-8666-666666666666",
        title: "Brother Gathering",
        type: "private",
        startAt: new Date("2026-06-02T10:00:00.000Z"),
        endAt: null,
        locationLabel: null,
        visibility: "BROTHER"
      }
    ]);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findUpcomingEvents(null)
    ).rejects.toThrow("Repository returned an event visibility hidden from candidates.");
  });

  it("maps paginated candidate-visible events", async () => {
    const { eventFindMany, prisma } = prismaMock();
    eventFindMany.mockResolvedValueOnce([
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Candidate Gathering",
        type: "formation",
        startAt: new Date("2026-06-01T10:00:00.000Z"),
        endAt: null,
        locationLabel: "Riga",
        visibility: "CANDIDATE",
        participations: [
          {
            id: "77777777-7777-4777-8777-777777777777",
            eventId: "55555555-5555-4555-8555-555555555555",
            intentStatus: "planning_to_attend",
            createdAt: new Date("2026-05-06T12:00:00.000Z"),
            cancelledAt: null
          }
        ]
      }
    ]);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateEvents(
        {
          from: "2026-06-01T00:00:00.000Z",
          type: "formation",
          limit: 10,
          offset: 5
        },
        "33333333-3333-4333-8333-333333333333",
        "22222222-2222-4222-8222-222222222222"
      )
    ).resolves.toEqual([
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Candidate Gathering",
        type: "formation",
        startAt: "2026-06-01T10:00:00.000Z",
        endAt: null,
        locationLabel: "Riga",
        visibility: "CANDIDATE",
        currentUserParticipation: {
          id: "77777777-7777-4777-8777-777777777777",
          eventId: "55555555-5555-4555-8555-555555555555",
          intentStatus: "planning_to_attend",
          createdAt: "2026-05-06T12:00:00.000Z",
          cancelledAt: null
        }
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
      where: expect.any(Object) as unknown,
      include: {
        participations: {
          where: {
            userId: "22222222-2222-4222-8222-222222222222"
          },
          take: 1,
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 10,
      skip: 5
    });
  });

  it("maps candidate-visible event detail with current-user participation only", async () => {
    const { eventFindFirst, prisma } = prismaMock();
    eventFindFirst.mockResolvedValueOnce({
      id: "55555555-5555-4555-8555-555555555555",
      title: "Candidate Gathering",
      description: "Formation gathering for active candidates.",
      type: "formation",
      startAt: new Date("2026-06-01T10:00:00.000Z"),
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE",
      participations: [
        {
          id: "77777777-7777-4777-8777-777777777777",
          eventId: "55555555-5555-4555-8555-555555555555",
          intentStatus: "planning_to_attend",
          createdAt: new Date("2026-05-06T12:00:00.000Z"),
          cancelledAt: null
        }
      ]
    });

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateEvent(
        "55555555-5555-4555-8555-555555555555",
        "33333333-3333-4333-8333-333333333333",
        "22222222-2222-4222-8222-222222222222",
        new Date("2026-05-05T00:00:00.000Z")
      )
    ).resolves.toEqual({
      id: "55555555-5555-4555-8555-555555555555",
      title: "Candidate Gathering",
      description: "Formation gathering for active candidates.",
      type: "formation",
      startAt: "2026-06-01T10:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE",
      currentUserParticipation: {
        id: "77777777-7777-4777-8777-777777777777",
        eventId: "55555555-5555-4555-8555-555555555555",
        intentStatus: "planning_to_attend",
        createdAt: "2026-05-06T12:00:00.000Z",
        cancelledAt: null
      }
    });
    expect(eventFindFirst).toHaveBeenCalledWith({
      where: expect.any(Object) as unknown,
      include: {
        participations: {
          where: {
            userId: "22222222-2222-4222-8222-222222222222",
            cancelledAt: null
          },
          take: 1,
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
  });

  it("returns null for hidden event detail ids and rejects invalid participation status leaks", async () => {
    const { eventFindFirst, prisma } = prismaMock();
    eventFindFirst.mockResolvedValueOnce(null);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateEvent(
        "55555555-5555-4555-8555-555555555555",
        null,
        "22222222-2222-4222-8222-222222222222"
      )
    ).resolves.toBeNull();

    eventFindFirst.mockResolvedValueOnce({
      id: "55555555-5555-4555-8555-555555555555",
      title: "Candidate Gathering",
      description: null,
      type: "formation",
      startAt: new Date("2026-06-01T10:00:00.000Z"),
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE",
      participations: [
        {
          id: "77777777-7777-4777-8777-777777777777",
          eventId: "55555555-5555-4555-8555-555555555555",
          intentStatus: "waitlisted",
          createdAt: new Date("2026-05-06T12:00:00.000Z"),
          cancelledAt: null
        }
      ]
    });

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateEvent(
        "55555555-5555-4555-8555-555555555555",
        null,
        "22222222-2222-4222-8222-222222222222"
      )
    ).rejects.toThrow("Repository returned an unknown event participation status.");
  });

  it("maps candidate-visible announcements and rejects hidden visibility leaks", async () => {
    const { announcementFindMany, prisma } = prismaMock();
    announcementFindMany.mockResolvedValueOnce([
      {
        id: "99999999-9999-4999-8999-999999999999",
        title: "Candidate Update",
        body: "A candidate-visible announcement.",
        visibility: "CANDIDATE",
        targetOrganizationUnitId: null,
        pinned: true,
        publishedAt: new Date("2026-05-06T09:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateAnnouncements(
        {
          limit: 10,
          offset: 5
        },
        "33333333-3333-4333-8333-333333333333",
        new Date("2026-05-06T10:00:00.000Z")
      )
    ).resolves.toEqual([
      {
        id: "99999999-9999-4999-8999-999999999999",
        title: "Candidate Update",
        body: "A candidate-visible announcement.",
        visibility: "CANDIDATE",
        targetOrganizationUnitId: null,
        pinned: true,
        publishedAt: "2026-05-06T09:00:00.000Z"
      }
    ]);
    expect(announcementFindMany).toHaveBeenCalledWith({
      where: candidateAnnouncementWhere(
        "33333333-3333-4333-8333-333333333333",
        new Date("2026-05-06T10:00:00.000Z")
      ),
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { title: "asc" }],
      take: 10,
      skip: 5
    });

    announcementFindMany.mockResolvedValueOnce([
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        title: "Brother Update",
        body: "Hidden from candidates.",
        visibility: "BROTHER",
        targetOrganizationUnitId: null,
        pinned: false,
        publishedAt: new Date("2026-05-06T09:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaCandidateDashboardRepository(prisma).findVisibleCandidateAnnouncements(
        { limit: 20, offset: 0 },
        null
      )
    ).rejects.toThrow("Repository returned an announcement visibility hidden from candidates.");
  });
});

function prismaMock(): {
  candidateProfileFindFirst: ReturnType<typeof vi.fn>;
  eventFindMany: ReturnType<typeof vi.fn>;
  eventFindFirst: ReturnType<typeof vi.fn>;
  announcementFindMany: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const candidateProfileFindFirst = vi.fn(() => Promise.resolve(null));
  const eventFindMany = vi.fn(() => Promise.resolve([]));
  const eventFindFirst = vi.fn(() => Promise.resolve(null));
  const announcementFindMany = vi.fn(() => Promise.resolve([]));

  return {
    candidateProfileFindFirst,
    eventFindMany,
    eventFindFirst,
    announcementFindMany,
    prisma: {
      candidateProfile: {
        findFirst: candidateProfileFindFirst
      },
      event: {
        findMany: eventFindMany,
        findFirst: eventFindFirst
      },
      announcement: {
        findMany: announcementFindMany
      }
    } as unknown as PrismaService
  };
}
