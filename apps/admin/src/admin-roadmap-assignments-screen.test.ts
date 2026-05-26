import { describe, expect, it } from "vitest";
import { fallbackAdminRoadmapAssignments } from "./admin-content-fixtures.js";
import {
  buildAdminRoadmapAssignmentEditorScreen,
  buildAdminRoadmapAssignmentDetailScreen,
  buildAdminRoadmapAssignmentListScreen
} from "./admin-roadmap-assignments-screen.js";

const roadmapAssignment = fallbackAdminRoadmapAssignments[0]!;

describe("admin roadmap assignment screens", () => {
  it("builds read-only roadmap assignment list rows", () => {
    const screen = buildAdminRoadmapAssignmentListScreen({
      state: "ready",
      response: {
        roadmapAssignments: [
          {
            id: roadmapAssignment.id,
            assigneeUserId: roadmapAssignment.assigneeUserId,
            assigneeName: roadmapAssignment.assigneeName,
            assigneeEmail: roadmapAssignment.assigneeEmail,
            roadmapDefinitionId: roadmapAssignment.roadmapDefinitionId,
            roadmapTitle: roadmapAssignment.roadmapTitle,
            roadmapTargetRole: roadmapAssignment.roadmapTargetRole,
            roadmapStatus: roadmapAssignment.roadmapStatus,
            organizationUnitId: roadmapAssignment.organizationUnitId,
            organizationUnitName: roadmapAssignment.organizationUnitName,
            status: roadmapAssignment.status,
            assignedByUserId: roadmapAssignment.assignedByUserId,
            assignedByName: roadmapAssignment.assignedByName,
            assignedAt: roadmapAssignment.assignedAt,
            completedAt: roadmapAssignment.completedAt,
            submissionCount: roadmapAssignment.submissionCount,
            pendingSubmissionCount: roadmapAssignment.pendingSubmissionCount,
            createdAt: roadmapAssignment.createdAt,
            updatedAt: roadmapAssignment.updatedAt,
            archivedAt: roadmapAssignment.archivedAt
          }
        ]
      },
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AdminRoadmapAssignmentList",
      state: "ready",
      title: "Roadmap Assignments"
    });
    expect(screen.rows[0]).toMatchObject({
      title: "Brother Formation Roadmap",
      assignee: "Demo Brother <brother@example.test>",
      countsLabel: "1 submissions · 1 pending",
      statusLabel: "Active"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual(["view"]);
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
  });

  it("builds detail sections without submission bodies", () => {
    const screen = buildAdminRoadmapAssignmentDetailScreen({
      state: "ready",
      roadmapAssignment,
      runtimeMode: "demo"
    });

    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.title).toBe("Roadmap Assignment: Demo Brother");
    expect(screen.sections.map((section) => section.title)).toEqual([
      "Assignment",
      "Submission Status"
    ]);
    expect(screen.sections.map((section) => section.body).join(" ")).not.toContain(
      "Reflection text for officer review"
    );
    expect(screen.actions.map((action) => action.id)).toEqual(["refresh"]);
  });

  it("builds create-assignment form fields over the POST contract", () => {
    const screen = buildAdminRoadmapAssignmentEditorScreen({
      state: "ready",
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AdminRoadmapAssignmentEditor",
      state: "ready",
      title: "Create Roadmap Assignment",
      mode: "create"
    });
    expect(screen.fields.map((field) => field.name)).toEqual([
      "assigneeUserId",
      "roadmapDefinitionId",
      "organizationUnitId"
    ]);
    expect(screen.fields.map((field) => field.required)).toEqual([true, true, false]);
    expect(screen.fields.every((field) => field.readOnly === false)).toBe(true);
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
  });

  it("maps forbidden and empty states without edit actions", () => {
    expect(
      buildAdminRoadmapAssignmentListScreen({
        state: "forbidden",
        runtimeMode: "api"
      })
    ).toMatchObject({
      state: "forbidden",
      rows: [],
      actions: []
    });

    expect(
      buildAdminRoadmapAssignmentDetailScreen({
        state: "ready",
        runtimeMode: "api"
      })
    ).toMatchObject({
      state: "empty",
      sections: []
    });

    expect(
      buildAdminRoadmapAssignmentEditorScreen({
        state: "forbidden",
        runtimeMode: "api"
      })
    ).toMatchObject({
      route: "AdminRoadmapAssignmentEditor",
      state: "forbidden",
      fields: [],
      actions: []
    });
  });
});
