import { describe, expect, it } from "vitest";
import { fallbackAdminRoadmapSubmissions } from "./admin-content-fixtures.js";
import {
  buildAdminRoadmapSubmissionDetailScreen,
  buildAdminRoadmapSubmissionListScreen
} from "./admin-roadmap-submissions-screen.js";

const roadmapSubmission = fallbackAdminRoadmapSubmissions[0]!;

describe("admin roadmap submission screens", () => {
  it("builds list rows with scoped review actions", () => {
    const screen = buildAdminRoadmapSubmissionListScreen({
      state: "ready",
      response: {
        roadmapSubmissions: [
          {
            id: roadmapSubmission.id,
            assignmentId: roadmapSubmission.assignmentId,
            stepId: roadmapSubmission.stepId,
            submitterUserId: roadmapSubmission.submitterUserId,
            submitterName: roadmapSubmission.submitterName,
            submitterEmail: roadmapSubmission.submitterEmail,
            roadmapTitle: roadmapSubmission.roadmapTitle,
            roadmapTargetRole: roadmapSubmission.roadmapTargetRole,
            stageTitle: roadmapSubmission.stageTitle,
            stepTitle: roadmapSubmission.stepTitle,
            organizationUnitId: roadmapSubmission.organizationUnitId,
            organizationUnitName: roadmapSubmission.organizationUnitName,
            status: roadmapSubmission.status,
            bodyPreview: roadmapSubmission.bodyPreview,
            attachmentCount: roadmapSubmission.attachmentCount,
            reviewComment: roadmapSubmission.reviewComment,
            reviewedAt: roadmapSubmission.reviewedAt,
            createdAt: roadmapSubmission.createdAt,
            updatedAt: roadmapSubmission.updatedAt
          }
        ]
      },
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminRoadmapSubmissionList",
      state: "ready",
      title: "Roadmap Submissions",
      demoChromeVisible: false
    });
    expect(screen.rows[0]).toMatchObject({
      title: "Meet your officer",
      statusLabel: "PENDING REVIEW",
      attachmentLabel: "1 attachment"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "view",
      "approve",
      "reject"
    ]);
  });

  it("builds detail fields with review-only controls writable", () => {
    const screen = buildAdminRoadmapSubmissionDetailScreen({
      state: "ready",
      roadmapSubmission,
      runtimeMode: "demo",
      canWrite: true
    });

    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.fields.find((field) => field.name === "body")?.readOnly).toBe(true);
    expect(screen.fields.find((field) => field.name === "reviewStatus")?.readOnly).toBe(false);
    expect(screen.fields.find((field) => field.name === "reviewCommentInput")?.readOnly).toBe(false);
    expect(screen.actions.map((action) => action.id)).toEqual(["approve", "reject", "refresh"]);
  });

  it("maps forbidden and empty states without leaking review actions", () => {
    expect(
      buildAdminRoadmapSubmissionListScreen({
        state: "forbidden",
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      state: "forbidden",
      rows: [],
      actions: []
    });

    expect(
      buildAdminRoadmapSubmissionDetailScreen({
        state: "ready",
        runtimeMode: "api",
        canWrite: false
      })
    ).toMatchObject({
      state: "empty",
      fields: []
    });
  });
});
