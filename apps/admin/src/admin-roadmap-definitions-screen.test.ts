import { describe, expect, it } from "vitest";
import { fallbackAdminRoadmapDefinitions } from "./admin-content-fixtures.js";
import {
  buildAdminRoadmapDefinitionDetailScreen,
  buildAdminRoadmapDefinitionListScreen
} from "./admin-roadmap-definitions-screen.js";

const roadmapDefinition = fallbackAdminRoadmapDefinitions[0]!;

describe("admin roadmap definition screens", () => {
  it("builds read-only roadmap definition list rows", () => {
    const screen = buildAdminRoadmapDefinitionListScreen({
      state: "ready",
      response: {
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
      },
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AdminRoadmapDefinitionList",
      state: "ready",
      title: "Roadmap Definitions"
    });
    expect(screen.rows[0]).toMatchObject({
      title: "Brother Formation Roadmap",
      countsLabel: "1 stage · 1 step · 1 assignment",
      statusLabel: "Published"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual(["view"]);
  });

  it("builds read-only detail sections from stages and steps", () => {
    const screen = buildAdminRoadmapDefinitionDetailScreen({
      state: "ready",
      roadmapDefinition,
      runtimeMode: "demo"
    });

    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.title).toBe("Roadmap Definition: Brother Formation Roadmap");
    expect(screen.sections.map((section) => section.title)).toEqual([
      "Discernment",
      "Meet your officer"
    ]);
    expect(screen.actions.map((action) => action.id)).toEqual(["refresh"]);
  });

  it("maps forbidden and empty states without edit actions", () => {
    expect(
      buildAdminRoadmapDefinitionListScreen({
        state: "forbidden",
        runtimeMode: "api"
      })
    ).toMatchObject({
      state: "forbidden",
      rows: [],
      actions: []
    });

    expect(
      buildAdminRoadmapDefinitionDetailScreen({
        state: "ready",
        runtimeMode: "api"
      })
    ).toMatchObject({
      state: "empty",
      sections: []
    });
  });
});
