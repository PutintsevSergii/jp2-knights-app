import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { CandidateDashboardRepository } from "./candidate-dashboard.repository.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type { CandidateDashboardProfile } from "./candidate-dashboard.types.js";

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
      upcomingEvents: [
        {
          id: "66666666-6666-4666-8666-666666666666",
          title: "Candidate Gathering",
          type: "formation",
          startAt: "2026-06-01T10:00:00.000Z",
          endAt: null,
          locationLabel: "Riga",
          visibility: "CANDIDATE"
        }
      ],
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
  });

  it("blocks candidate users without an active profile", async () => {
    await expect(
      new CandidateDashboardService(dashboardRepository(null)).getDashboard(candidate)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function dashboardRepository(
  profileRecord: CandidateDashboardProfile | null
): CandidateDashboardRepository & {
  profileLookups: string[];
  eventScopes: Array<string | null>;
} {
  return {
    profileLookups: [],
    eventScopes: [],
    findActiveProfile(userId) {
      this.profileLookups.push(userId);
      return Promise.resolve(profileRecord);
    },
    findUpcomingEvents(assignedOrganizationUnitId) {
      this.eventScopes.push(assignedOrganizationUnitId);
      return Promise.resolve([
        {
          id: "66666666-6666-4666-8666-666666666666",
          title: "Candidate Gathering",
          type: "formation",
          startAt: "2026-06-01T10:00:00.000Z",
          endAt: null,
          locationLabel: "Riga",
          visibility: "CANDIDATE"
        }
      ]);
    }
  };
}
