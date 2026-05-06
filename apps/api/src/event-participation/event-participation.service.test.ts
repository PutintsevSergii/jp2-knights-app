import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { EventParticipationRepository } from "./event-participation.repository.js";
import { EventParticipationService } from "./event-participation.service.js";
import type { EventParticipationSummary } from "./event-participation.types.js";

const eventId = "44444444-4444-4444-8444-444444444444";
const organizationUnitId = "11111111-1111-4111-8111-111111111111";

const candidate: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"],
  candidateOrganizationUnitId: organizationUnitId
};

const brother: CurrentUserPrincipal = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnitId]
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
    scopeOrganizationUnitId: organizationUnitId
  }
};

const planningIntent: EventParticipationSummary = {
  id: "55555555-5555-4555-8555-555555555555",
  eventId,
  intentStatus: "planning_to_attend",
  createdAt: "2026-05-06T12:00:00.000Z",
  cancelledAt: null
};

const cancelledIntent: EventParticipationSummary = {
  ...planningIntent,
  intentStatus: "cancelled",
  cancelledAt: "2026-05-06T13:00:00.000Z"
};

describe("EventParticipationService", () => {
  it("marks candidate participation only after active profile and event visibility checks", async () => {
    const repository = repositoryWith();

    await expect(
      new EventParticipationService(repository).markCandidatePlanningToAttend(candidate, eventId)
    ).resolves.toEqual({
      participation: planningIntent
    });
    expect(repository.candidateProfileLookups).toEqual([candidate.id]);
    expect(repository.candidateVisibilityChecks).toEqual([[eventId, organizationUnitId]]);
    expect(repository.markedPlanning).toEqual([[candidate.id, eventId]]);
  });

  it("marks brother participation using active membership organization-unit scope", async () => {
    const repository = repositoryWith();

    await expect(
      new EventParticipationService(repository).markBrotherPlanningToAttend(brother, eventId)
    ).resolves.toEqual({
      participation: planningIntent
    });
    expect(repository.brotherProfileLookups).toEqual([brother.id]);
    expect(repository.brotherVisibilityChecks).toEqual([[eventId, [organizationUnitId]]]);
    expect(repository.markedPlanning).toEqual([[brother.id, eventId]]);
  });

  it("cancels only the current user's active participation intent", async () => {
    const repository = repositoryWith({ cancelled: cancelledIntent });

    await expect(
      new EventParticipationService(repository).cancelBrotherParticipation(brother, eventId)
    ).resolves.toEqual({
      participation: cancelledIntent
    });
    expect(repository.cancelledPlanning).toEqual([[brother.id, eventId]]);
  });

  it("fails as not found when a visible participation target or active intent is absent", async () => {
    await expect(
      new EventParticipationService(repositoryWith({ candidateEventVisible: false }))
        .markCandidatePlanningToAttend(candidate, eventId)
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      new EventParticipationService(repositoryWith({ cancelled: null })).cancelCandidateParticipation(
        candidate,
        eventId
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("blocks wrong roles, idle users, and principals without active private profiles", async () => {
    await expect(
      new EventParticipationService(repositoryWith()).markCandidatePlanningToAttend(brother, eventId)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new EventParticipationService(repositoryWith()).markBrotherPlanningToAttend(candidate, eventId)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new EventParticipationService(repositoryWith()).markBrotherPlanningToAttend(idleUser, eventId)
    ).rejects.toMatchObject({
      response: {
        code: IDLE_APPROVAL_REQUIRED_CODE
      }
    });
    await expect(
      new EventParticipationService(repositoryWith({ candidateOrganizationUnitId: undefined }))
        .markCandidatePlanningToAttend(candidate, eventId)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new EventParticipationService(repositoryWith({ brotherOrganizationUnitIds: null }))
        .markBrotherPlanningToAttend(brother, eventId)
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function repositoryWith(
  options: {
    candidateOrganizationUnitId?: string | null | undefined;
    brotherOrganizationUnitIds?: readonly string[] | null;
    candidateEventVisible?: boolean;
    brotherEventVisible?: boolean;
    marked?: EventParticipationSummary;
    cancelled?: EventParticipationSummary | null;
  } = {}
): EventParticipationRepository & {
  candidateProfileLookups: string[];
  brotherProfileLookups: string[];
  candidateVisibilityChecks: Array<[string, string | null]>;
  brotherVisibilityChecks: Array<[string, readonly string[]]>;
  markedPlanning: string[][];
  cancelledPlanning: string[][];
} {
  return {
    candidateProfileLookups: [],
    brotherProfileLookups: [],
    candidateVisibilityChecks: [],
    brotherVisibilityChecks: [],
    markedPlanning: [],
    cancelledPlanning: [],
    findActiveCandidateOrganizationUnitId(userId) {
      this.candidateProfileLookups.push(userId);
      return Promise.resolve(
        Object.hasOwn(options, "candidateOrganizationUnitId")
          ? options.candidateOrganizationUnitId
          : organizationUnitId
      );
    },
    findActiveBrotherOrganizationUnitIds(userId) {
      this.brotherProfileLookups.push(userId);
      return Promise.resolve(
        Object.hasOwn(options, "brotherOrganizationUnitIds")
          ? (options.brotherOrganizationUnitIds ?? null)
          : [organizationUnitId]
      );
    },
    canParticipateInCandidateEvent(inputEventId, assignedOrganizationUnitId) {
      this.candidateVisibilityChecks.push([inputEventId, assignedOrganizationUnitId]);
      return Promise.resolve(options.candidateEventVisible ?? true);
    },
    canParticipateInBrotherEvent(inputEventId, organizationUnitIds) {
      this.brotherVisibilityChecks.push([inputEventId, organizationUnitIds]);
      return Promise.resolve(options.brotherEventVisible ?? true);
    },
    markPlanningToAttend(userId, inputEventId) {
      this.markedPlanning.push([userId, inputEventId]);
      return Promise.resolve(options.marked ?? planningIntent);
    },
    cancelOwnParticipation(userId, inputEventId) {
      this.cancelledPlanning.push([userId, inputEventId]);
      return Promise.resolve(options.cancelled === undefined ? cancelledIntent : options.cancelled);
    }
  };
}
