import { describe, expect, it, vi } from "vitest";
import {
  fallbackCandidateEventDetail,
  fallbackCandidateEvents,
  fallbackCandidateDashboard
} from "./candidate-dashboard.js";
import {
  buildCandidateEventDetailUrl,
  buildCandidateEventParticipationUrl,
  buildCandidateEventsUrl,
  buildCandidateDashboardUrl,
  cancelCandidateEventParticipation,
  candidateDashboardLoadFailureState,
  CandidateDashboardHttpError,
  fetchCandidateEvent,
  fetchCandidateEvents,
  fetchCandidateDashboard,
  markCandidateEventParticipation
} from "./candidate-dashboard-api.js";

describe("mobile candidate dashboard API client", () => {
  it("builds the candidate dashboard URL from the configured API base URL", () => {
    expect(buildCandidateDashboardUrl("https://api.example.test")).toBe(
      "https://api.example.test/candidate/dashboard"
    );
    expect(buildCandidateDashboardUrl("https://api.example.test/")).toBe(
      "https://api.example.test/candidate/dashboard"
    );
  });

  it("fetches candidate resources with bearer auth and validates shared DTO schemas", async () => {
    const fetchImpl = vi.fn((input: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseForCandidateUrl(input))
      })
    );

    await expect(
      fetchCandidateDashboard({
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackCandidateDashboard);
    await expect(
      fetchCandidateEvents({
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        from: "2026-06-01T00:00:00.000Z",
        type: "formation",
        limit: 10,
        offset: 5,
        fetchImpl
      })
    ).resolves.toEqual(fallbackCandidateEvents);
    await expect(
      fetchCandidateEvent({
        id: fallbackCandidateEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackCandidateEventDetail);
    await expect(
      markCandidateEventParticipation({
        id: fallbackCandidateEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual({
      participation: fallbackCandidateEventDetail.event.currentUserParticipation
    });
    await expect(
      cancelCandidateEventParticipation({
        id: fallbackCandidateEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual({
      participation: fallbackCandidateEventDetail.event.currentUserParticipation
    });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/candidate/dashboard", {
      method: "GET",
      headers: {
        authorization: "Bearer candidate-token"
      }
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/candidate/events?from=2026-06-01T00%3A00%3A00.000Z&type=formation&limit=10&offset=5",
      {
        method: "GET",
        headers: {
          authorization: "Bearer candidate-token"
        }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      "https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555",
      {
        method: "GET",
        headers: {
          authorization: "Bearer candidate-token"
        }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      4,
      "https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555/participation",
      {
        method: "POST",
        headers: {
          authorization: "Bearer candidate-token"
        }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      5,
      "https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555/participation",
      {
        method: "DELETE",
        headers: {
          authorization: "Bearer candidate-token"
        }
      }
    );
  });

  it("rejects dashboard events with brother-only visibility", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...fallbackCandidateDashboard,
            upcomingEvents: [
              {
                ...fallbackCandidateDashboard.upcomingEvents[0],
                visibility: "BROTHER"
              }
            ]
          })
      })
    );

    await expect(fetchCandidateDashboard({ fetchImpl })).rejects.toThrow();
  });

  it("maps auth and network failures into screen states", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(fetchCandidateDashboard({ fetchImpl })).rejects.toBeInstanceOf(
      CandidateDashboardHttpError
    );
    expect(candidateDashboardLoadFailureState(new CandidateDashboardHttpError(401))).toBe(
      "forbidden"
    );
    expect(candidateDashboardLoadFailureState(new TypeError("Network request failed"))).toBe(
      "offline"
    );
    expect(candidateDashboardLoadFailureState(new CandidateDashboardHttpError(404))).toBe("empty");
  });

  it("builds candidate event URLs", () => {
    expect(
      buildCandidateEventsUrl("https://api.example.test", {
        from: "2026-06-01T00:00:00.000Z",
        type: "formation",
        limit: 10,
        offset: 5
      })
    ).toBe(
      "https://api.example.test/candidate/events?from=2026-06-01T00%3A00%3A00.000Z&type=formation&limit=10&offset=5"
    );
    expect(
      buildCandidateEventDetailUrl(
        "55555555-5555-4555-8555-555555555555",
        "https://api.example.test"
      )
    ).toBe("https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555");
    expect(
      buildCandidateEventParticipationUrl(
        "55555555-5555-4555-8555-555555555555",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555/participation"
    );
  });

  it("maps idle approval API errors into an idle approval state", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            error: {
              code: "IDLE_APPROVAL_REQUIRED"
            }
          })
      })
    );

    await expect(fetchCandidateDashboard({ fetchImpl })).rejects.toMatchObject({
      code: "IDLE_APPROVAL_REQUIRED"
    });
    expect(
      candidateDashboardLoadFailureState(
        new CandidateDashboardHttpError(403, "IDLE_APPROVAL_REQUIRED")
      )
    ).toBe("idleApproval");
  });
});

function responseForCandidateUrl(input: string) {
  if (input.includes("/participation")) {
    return {
      participation: fallbackCandidateEventDetail.event.currentUserParticipation
    };
  }

  if (input.includes("/candidate/events/")) {
    return fallbackCandidateEventDetail;
  }

  if (input.includes("/candidate/events")) {
    return fallbackCandidateEvents;
  }

  return fallbackCandidateDashboard;
}
