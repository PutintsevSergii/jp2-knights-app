import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { CandidateDashboardRepository } from "./candidate-dashboard.repository.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type {
  CandidateAnnouncementSummary,
  CandidateDashboardProfile,
  CandidateEventDetail,
  CandidateEventSummary
} from "./candidate-dashboard.types.js";

const candidate: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"],
  candidateOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
};

const brother: CurrentUserPrincipal = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"]
};

const idleUser: CurrentUserPrincipal = {
  id: "77777777-7777-4777-8777-777777777777",
  email: "idle@example.test",
  displayName: "Idle User",
  status: "active",
  roles: [],
  approval: {
    state: "pending",
    expiresAt: "2026-06-04T08:00:00.000Z",
    scopeOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
  }
};

const profile: CandidateDashboardProfile = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: candidate.id,
  displayName: candidate.displayName,
  email: candidate.email,
  preferredLanguage: "en",
  status: "active",
  assignedOrganizationUnit: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Pilot Choragiew",
    city: "Riga",
    country: "Latvia",
    parish: "St. Example"
  },
  responsibleOfficer: {
    id: "55555555-5555-4555-8555-555555555555",
    displayName: "Responsible Officer",
    email: "officer@example.test",
    phone: null
  }
};

const event: CandidateEventSummary = {
  id: "66666666-6666-4666-8666-666666666666",
  title: "Candidate Gathering",
  type: "formation",
  startAt: "2026-06-01T10:00:00.000Z",
  endAt: null,
  locationLabel: "Riga",
  visibility: "CANDIDATE"
};

const eventDetail: CandidateEventDetail = {
  ...event,
  description: "Formation gathering for active candidates.",
  currentUserParticipation: {
    id: "88888888-8888-4888-8888-888888888888",
    eventId: event.id,
    intentStatus: "planning_to_attend",
    createdAt: "2026-05-06T12:00:00.000Z",
    cancelledAt: null
  }
};

const announcement: CandidateAnnouncementSummary = {
  id: "99999999-9999-4999-8999-999999999999",
  title: "Candidate Update",
  body: "A candidate-visible announcement.",
  visibility: "CANDIDATE",
  targetOrganizationUnitId: null,
  pinned: true,
  publishedAt: "2026-05-06T09:00:00.000Z"
};

describe("CandidateDashboardService", () => {
  it("builds a dashboard from the active candidate profile and scoped events", async () => {
    const repository = dashboardRepository(profile);

    await expect(
      new CandidateDashboardService(repository).getDashboard(candidate)
    ).resolves.toEqual({
      profile,
      nextStep: {
        id: "review-roadmap",
        label: "Review your candidate path",
        body: "Stay in touch with Responsible Officer and review upcoming candidate steps.",
        targetRoute: "CandidateRoadmap",
        priority: "normal"
      },
      upcomingEvents: [event],
      announcements: []
    });
    expect(repository.profileLookups).toEqual([candidate.id]);
    expect(repository.eventScopes).toEqual([profile.assignedOrganizationUnit?.id]);
  });

  it("returns an assignment next step when the active profile is unassigned", async () => {
    const unassignedProfile: CandidateDashboardProfile = {
      ...profile,
      assignedOrganizationUnit: null,
      responsibleOfficer: null
    };

    const dashboard = await new CandidateDashboardService(
      dashboardRepository(unassignedProfile)
    ).getDashboard(candidate);

    expect(dashboard.nextStep).toMatchObject({
      id: "await-assignment",
      targetRoute: "CandidateContact",
      priority: "attention"
    });
  });

  it("blocks non-candidate principals", async () => {
    await expect(
      new CandidateDashboardService(dashboardRepository(profile)).getDashboard(brother)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lists candidate-visible events using the active profile assignment", async () => {
    const repository = dashboardRepository(profile);

    await expect(
      new CandidateDashboardService(repository).listEvents(candidate, {
        from: "2026-05-01T00:00:00.000Z",
        type: "formation",
        limit: 20,
        offset: 0
      })
    ).resolves.toEqual({
      events: [event],
      pagination: {
        limit: 20,
        offset: 0
      }
    });
    expect(repository.eventListScopes).toEqual([profile.assignedOrganizationUnit?.id]);
  });

  it("returns candidate-visible event detail with only the current user's participation", async () => {
    const repository = dashboardRepository(profile);

    await expect(
      new CandidateDashboardService(repository).getEvent(candidate, event.id)
    ).resolves.toEqual({
      event: eventDetail
    });
    expect(repository.eventDetailScopes).toEqual([
      {
        eventId: event.id,
        assignedOrganizationUnitId: profile.assignedOrganizationUnit?.id,
        userId: candidate.id
      }
    ]);
  });

  it("lists candidate-visible announcements using the active profile assignment", async () => {
    const repository = dashboardRepository(profile);

    await expect(
      new CandidateDashboardService(repository).listAnnouncements(candidate, {
        limit: 10,
        offset: 5
      })
    ).resolves.toEqual({
      announcements: [announcement],
      pagination: {
        limit: 10,
        offset: 5
      }
    });
    expect(repository.announcementScopes).toEqual([profile.assignedOrganizationUnit?.id]);
  });

  it("returns not found for event details hidden from the active candidate", async () => {
    await expect(
      new CandidateDashboardService(dashboardRepository(profile, null)).getEvent(
        candidate,
        event.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("blocks idle users with the approval-required code before loading private data", async () => {
    const repository = dashboardRepository(profile);

    await expect(
      new CandidateDashboardService(repository).getDashboard(idleUser)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new CandidateDashboardService(repository).getDashboard(idleUser)
    ).rejects.toMatchObject({
      response: {
        code: IDLE_APPROVAL_REQUIRED_CODE
      }
    });
    expect(repository.profileLookups).toEqual([]);
    expect(repository.eventScopes).toEqual([]);
    expect(repository.eventListScopes).toEqual([]);
    expect(repository.eventDetailScopes).toEqual([]);
    expect(repository.announcementScopes).toEqual([]);
  });

  it("blocks candidate users without an active profile", async () => {
    await expect(
      new CandidateDashboardService(dashboardRepository(null)).getDashboard(candidate)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function dashboardRepository(
  profileRecord: CandidateDashboardProfile | null,
  detail: CandidateEventDetail | null = eventDetail
): CandidateDashboardRepository & {
  profileLookups: string[];
  eventScopes: Array<string | null>;
  eventListScopes: Array<string | null>;
  announcementScopes: Array<string | null>;
  eventDetailScopes: Array<{
    eventId: string;
    assignedOrganizationUnitId: string | null;
    userId: string;
  }>;
} {
  return {
    profileLookups: [],
    eventScopes: [],
    eventListScopes: [],
    announcementScopes: [],
    eventDetailScopes: [],
    findActiveProfile(userId) {
      this.profileLookups.push(userId);
      return Promise.resolve(profileRecord);
    },
    findUpcomingEvents(assignedOrganizationUnitId) {
      this.eventScopes.push(assignedOrganizationUnitId);
      return Promise.resolve([event]);
    },
    findVisibleCandidateEvents(_query, assignedOrganizationUnitId) {
      this.eventListScopes.push(assignedOrganizationUnitId);
      return Promise.resolve([event]);
    },
    findVisibleCandidateEvent(eventId, assignedOrganizationUnitId, userId) {
      this.eventDetailScopes.push({
        eventId,
        assignedOrganizationUnitId,
        userId
      });
      return Promise.resolve(detail);
    },
    findVisibleCandidateAnnouncements(_query, assignedOrganizationUnitId) {
      this.announcementScopes.push(assignedOrganizationUnitId);
      return Promise.resolve([announcement]);
    }
  };
}
