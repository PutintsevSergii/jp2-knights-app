import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapDefinitions } from "./admin-content-fixtures.js";
import {
  fetchAdminRoadmapDefinition,
  fetchAdminRoadmapDefinitions
} from "./admin-roadmap-definitions-api.js";

const roadmapDefinition = fallbackAdminRoadmapDefinitions[0]!;
const listPayload = {
  roadmapDefinitions: [
    {
      id: roadmapDefinition.id,
      title: roadmapDefinition.title,
      targetRole: roadmapDefinition.targetRole,
      language: roadmapDefinition.language,
      status: roadmapDefinition.status,
      publishedAt: roadmapDefinition.publishedAt,
      stageCount: roadmapDefinition.stageCount,
      stepCount: roadmapDefinition.stepCount,
      assignmentCount: roadmapDefinition.assignmentCount,
      createdAt: roadmapDefinition.createdAt,
      updatedAt: roadmapDefinition.updatedAt,
      archivedAt: roadmapDefinition.archivedAt
    }
  ]
};

describe("admin roadmap definitions API client", () => {
  it("fetches and validates list and detail responses", async () => {
    const listFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(listPayload)
      })
    );
    const detailFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapDefinition })
      })
    );

    await expect(
      fetchAdminRoadmapDefinitions({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: listFetch
      })
    ).resolves.toEqual(listPayload);
    await expect(
      fetchAdminRoadmapDefinition(roadmapDefinition.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: detailFetch
      })
    ).resolves.toEqual({ roadmapDefinition });

    expect(listFetch).toHaveBeenCalledWith("https://api.example.test/admin/roadmap-definitions", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(detailFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-definitions/${roadmapDefinition.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("maps non-OK responses", async () => {
    const forbiddenFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(
      fetchAdminRoadmapDefinitions({ fetchImpl: forbiddenFetch })
    ).rejects.toBeInstanceOf(AdminContentHttpError);
  });
});
