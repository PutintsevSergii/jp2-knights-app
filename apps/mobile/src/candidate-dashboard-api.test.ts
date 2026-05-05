import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateDashboard } from "./candidate-dashboard.js";
import {
  buildCandidateDashboardUrl,
  candidateDashboardLoadFailureState,
  CandidateDashboardHttpError,
  fetchCandidateDashboard
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

  it("fetches with bearer auth and validates the shared DTO schema", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackCandidateDashboard)
      })
    );

    await expect(
      fetchCandidateDashboard({
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackCandidateDashboard);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/candidate/dashboard", {
      method: "GET",
      headers: {
        authorization: "Bearer candidate-token"
      }
    });
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
