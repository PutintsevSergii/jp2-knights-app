import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { CandidateEventController } from "./candidate-event.controller.js";
import type { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type {
  CandidateEventDetailResponse,
  CandidateEventListResponse
} from "./candidate-dashboard.types.js";

const principal: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"]
};

const eventListResponse: CandidateEventListResponse = {
  events: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      title: "Candidate Gathering",
      type: "formation",
      startAt: "2026-06-01T10:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE"
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
};

const eventDetailResponse: CandidateEventDetailResponse = {
  event: {
    ...eventListResponse.events[0]!,
    description: "Formation gathering for active candidates.",
    currentUserParticipation: {
      id: "33333333-3333-4333-8333-333333333333",
      eventId: eventListResponse.events[0]!.id,
      intentStatus: "planning_to_attend",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: null
    }
  }
};

describe("CandidateEventController", () => {
  it("delegates candidate event requests using the guard-attached principal", async () => {
    const listEvents = vi.fn(() => Promise.resolve(eventListResponse));
    const getEvent = vi.fn(() => Promise.resolve(eventDetailResponse));
    const controller = new CandidateEventController({
      listEvents,
      getEvent
    } as unknown as CandidateDashboardService);

    await expect(controller.listEvents({ principal }, { limit: 20, offset: 0 })).resolves.toEqual(
      eventListResponse
    );
    await expect(
      controller.getEvent({ principal }, "22222222-2222-4222-8222-222222222222")
    ).resolves.toEqual(eventDetailResponse);
    expect(listEvents).toHaveBeenCalledWith(principal, { limit: 20, offset: 0 });
    expect(getEvent).toHaveBeenCalledWith(
      principal,
      "22222222-2222-4222-8222-222222222222"
    );
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new CandidateEventController({
      listEvents: vi.fn(),
      getEvent: vi.fn()
    } as unknown as CandidateDashboardService);

    expect(() => controller.listEvents({}, { limit: 20, offset: 0 })).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.getEvent({}, "22222222-2222-4222-8222-222222222222")).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
  });
});
