import { describe, expect, it, vi } from "vitest";
import {
  RoadmapHttpError,
  buildBrotherRoadmapSubmissionUrl,
  buildBrotherRoadmapUrl,
  buildCandidateRoadmapUrl,
  fetchBrotherRoadmap,
  fetchCandidateRoadmap,
  roadmapLoadFailureState,
  submitBrotherRoadmapStep
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
    expect(buildBrotherRoadmapSubmissionUrl("step/1", "https://api.example.test")).toBe(
      "https://api.example.test/brother/roadmap/steps/step%2F1/submissions"
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

  it("submits brother roadmap steps with route/body step agreement and schema validation", async () => {
    const stepId = fallbackBrotherRoadmap.roadmap!.stages[0]!.steps[0]!.id;
    const fetchImpl = vi.fn((_input: string, init) => {
      expect(init).toEqual({
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer brother-token"
        },
        body: JSON.stringify({
          stepId,
          body: "A short formation reflection.",
          attachmentMetadata: []
        })
      });

      return Promise.resolve({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            submission: {
              ...fallbackBrotherRoadmap.roadmap!.stages[0]!.steps[0]!.latestSubmission,
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              stepId,
              body: "A short formation reflection.",
              status: "pending_review",
              createdAt: "2026-05-11T09:00:00.000Z",
              updatedAt: "2026-05-11T09:00:00.000Z"
            }
          })
      });
    });

    await expect(
      submitBrotherRoadmapStep({
        baseUrl: "https://api.example.test",
        authToken: "brother-token",
        stepId,
        body: " A short formation reflection. ",
        fetchImpl
      })
    ).resolves.toMatchObject({
      submission: {
        stepId,
        body: "A short formation reflection.",
        status: "pending_review"
      }
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://api.example.test/brother/roadmap/steps/${stepId}/submissions`,
      expect.any(Object)
    );
  });

  it("rejects invalid brother roadmap submission payloads before making a request", async () => {
    const fetchImpl = vi.fn();

    await expect(
      submitBrotherRoadmapStep({
        stepId: "not-a-uuid",
        body: "",
        fetchImpl
      })
    ).rejects.toThrow();

    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
