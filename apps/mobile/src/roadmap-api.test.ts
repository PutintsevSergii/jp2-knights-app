import { describe, expect, it, vi } from "vitest";
import {
  RoadmapHttpError,
  buildBrotherRoadmapUrl,
  buildCandidateRoadmapUrl,
  fetchBrotherRoadmap,
  fetchCandidateRoadmap,
  roadmapLoadFailureState
} from "./roadmap-api.js";
import { fallbackBrotherRoadmap, fallbackCandidateRoadmap } from "./roadmap.js";

describe("mobile roadmap API client", () => {
  it("fetches candidate and brother roadmaps with bearer auth and shared schema validation", async () => {
    const fetchImpl = vi.fn((input: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(
            input.includes("/candidate/roadmap") ? fallbackCandidateRoadmap : fallbackBrotherRoadmap
          )
      })
    );

    await expect(
      fetchCandidateRoadmap({
        baseUrl: "https://api.example.test",
        authToken: "candidate-token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackCandidateRoadmap);
    await expect(
      fetchBrotherRoadmap({
        baseUrl: "https://api.example.test",
        authToken: "brother-token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherRoadmap);

    expect(fetchImpl).toHaveBeenNthCalledWith(1, "https://api.example.test/candidate/roadmap", {
      method: "GET",
      headers: {
        authorization: "Bearer candidate-token"
      }
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "https://api.example.test/brother/roadmap", {
      method: "GET",
      headers: {
        authorization: "Bearer brother-token"
      }
    });
  });

  it("builds roadmap URLs and maps private access failures to mobile states", async () => {
    expect(buildCandidateRoadmapUrl("https://api.example.test")).toBe(
      "https://api.example.test/candidate/roadmap"
    );
    expect(buildBrotherRoadmapUrl("https://api.example.test/")).toBe(
      "https://api.example.test/brother/roadmap"
    );

    await expect(
      fetchCandidateRoadmap({
        fetchImpl: () =>
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
      })
    ).rejects.toMatchObject({
      code: "IDLE_APPROVAL_REQUIRED"
    });
    expect(roadmapLoadFailureState(new RoadmapHttpError(401))).toBe("forbidden");
    expect(roadmapLoadFailureState(new RoadmapHttpError(404))).toBe("empty");
    expect(roadmapLoadFailureState(new RoadmapHttpError(403, "IDLE_APPROVAL_REQUIRED"))).toBe(
      "idleApproval"
    );
    expect(roadmapLoadFailureState(new TypeError("offline"))).toBe("offline");
    expect(roadmapLoadFailureState(new Error("boom"))).toBe("error");
  });

  it("rejects roadmap responses that expose the wrong target role", async () => {
    await expect(
      fetchCandidateRoadmap({
        fetchImpl: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                roadmap: {
                  ...fallbackCandidateRoadmap.roadmap,
                  definition: {
                    ...fallbackCandidateRoadmap.roadmap!.definition,
                    targetRole: "OFFICER"
                  }
                }
              })
          })
      })
    ).rejects.toThrow();
  });
});
