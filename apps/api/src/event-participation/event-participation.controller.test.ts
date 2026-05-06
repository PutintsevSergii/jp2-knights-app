import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { EventParticipationController } from "./event-participation.controller.js";
import type { EventParticipationService } from "./event-participation.service.js";
import type { EventParticipationResponse } from "./event-participation.types.js";

const eventId = "44444444-4444-4444-8444-444444444444";

const principal: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const response: EventParticipationResponse = {
  participation: {
    id: "55555555-5555-4555-8555-555555555555",
    eventId,
    intentStatus: "planning_to_attend",
    createdAt: "2026-05-06T12:00:00.000Z",
    cancelledAt: null
  }
};

describe("EventParticipationController", () => {
  it("delegates candidate and brother event participation mutations using the guard principal", async () => {
    const service = new FakeEventParticipationService();
    const controller = new EventParticipationController(
      service as unknown as EventParticipationService
    );

    await expect(controller.markCandidatePlanningToAttend({ principal }, eventId)).resolves.toEqual(
      response
    );
    await expect(controller.cancelCandidateParticipation({ principal }, eventId)).resolves.toEqual(
      response
    );
    await expect(controller.markBrotherPlanningToAttend({ principal }, eventId)).resolves.toEqual(
      response
    );
    await expect(controller.cancelBrotherParticipation({ principal }, eventId)).resolves.toEqual(
      response
    );
    expect(service.calls).toEqual([
      ["markCandidatePlanningToAttend", principal, eventId],
      ["cancelCandidateParticipation", principal, eventId],
      ["markBrotherPlanningToAttend", principal, eventId],
      ["cancelBrotherParticipation", principal, eventId]
    ]);
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new EventParticipationController(
      new FakeEventParticipationService() as unknown as EventParticipationService
    );

    expect(() => controller.markCandidatePlanningToAttend({}, eventId)).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.cancelCandidateParticipation({}, eventId)).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.markBrotherPlanningToAttend({}, eventId)).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.cancelBrotherParticipation({}, eventId)).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
  });
});

class FakeEventParticipationService implements Pick<
  EventParticipationService,
  | "markCandidatePlanningToAttend"
  | "cancelCandidateParticipation"
  | "markBrotherPlanningToAttend"
  | "cancelBrotherParticipation"
> {
  calls: Array<[string, CurrentUserPrincipal, string]> = [];

  markCandidatePlanningToAttend(input: CurrentUserPrincipal, inputEventId: string) {
    this.calls.push(["markCandidatePlanningToAttend", input, inputEventId]);
    return Promise.resolve(response);
  }

  cancelCandidateParticipation(input: CurrentUserPrincipal, inputEventId: string) {
    this.calls.push(["cancelCandidateParticipation", input, inputEventId]);
    return Promise.resolve(response);
  }

  markBrotherPlanningToAttend(input: CurrentUserPrincipal, inputEventId: string) {
    this.calls.push(["markBrotherPlanningToAttend", input, inputEventId]);
    return Promise.resolve(response);
  }

  cancelBrotherParticipation(input: CurrentUserPrincipal, inputEventId: string) {
    this.calls.push(["cancelBrotherParticipation", input, inputEventId]);
    return Promise.resolve(response);
  }
}
