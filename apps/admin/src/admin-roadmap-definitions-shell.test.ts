import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapDefinitions } from "./admin-content-fixtures.js";
import { renderAdminRoadmapDefinitionRoute } from "./admin-roadmap-definitions-shell.js";

const roadmapDefinition = fallbackAdminRoadmapDefinitions[0]!;

describe("admin roadmap definitions shell", () => {
  it("renders API-mode list and detail routes", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
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
          })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapDefinition })
      });

    const list = await renderAdminRoadmapDefinitionRoute({
      path: "/admin/roadmap-definitions",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      fetchImpl
    });
    const detail = await renderAdminRoadmapDefinitionRoute({
      path: `/admin/roadmap-definitions/${roadmapDefinition.id}`,
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      fetchImpl
    });

    expect(list).toMatchObject({
      route: "AdminRoadmapDefinitionList",
      state: "ready",
      statusCode: 200
    });
    expect(list.document).toContain("Brother Formation Roadmap");
    expect(detail).toMatchObject({
      route: "AdminRoadmapDefinitionDetail",
      state: "ready",
      statusCode: 200
    });
    expect(detail.document).toContain("Meet your officer");
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/admin/roadmap-definitions",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/admin/roadmap-definitions/${roadmapDefinition.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders demo routes without backend calls and maps failures", async () => {
    const fetchImpl = vi.fn();

    const demo = await renderAdminRoadmapDefinitionRoute({
      path: "/admin/roadmap-definitions",
      runtimeMode: "demo",
      fetchImpl
    });
    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Brother Formation Roadmap");
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminRoadmapDefinitionRoute({
        path: "/admin/roadmap-definitions",
        runtimeMode: "api",
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
  });
});
