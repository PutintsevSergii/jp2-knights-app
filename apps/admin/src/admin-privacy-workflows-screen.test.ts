import { describe, expect, it } from "vitest";
import {
  buildAdminPrivacyWorkflowScreen,
  renderAdminPrivacyWorkflowRoute
} from "./admin-privacy-workflows-screen.js";

describe("admin privacy workflow screen", () => {
  it("builds Super Admin privacy workflow rows from shared retention metadata", () => {
    const screen = buildAdminPrivacyWorkflowScreen({
      runtimeMode: "api",
      canManagePrivacy: true
    });

    expect(screen).toMatchObject({
      route: "AdminPrivacyWorkflowList",
      state: "ready",
      title: "Privacy Workflows",
      demoChromeVisible: false
    });
    expect(screen.rows).toEqual([
      expect.objectContaining({
        id: "candidateRequest",
        label: "Candidate request",
        entityType: "candidate_request",
        retentionBucket: "sensitive_review",
        retentionLabel: "Sensitive review",
        requiredCapability: "archive_export_erasure",
        operations: [
          expect.objectContaining({
            id: "export",
            method: "GET",
            auditAction: "admin.candidateRequest.export",
            destructive: false
          }),
          expect.objectContaining({
            id: "erase",
            method: "POST",
            auditAction: "admin.candidateRequest.erase",
            destructive: true
          })
        ]
      }),
      expect.objectContaining({ id: "candidateProfile" }),
      expect.objectContaining({ id: "roadmapSubmission" })
    ]);
  });

  it("fails closed when privacy workflow management is not explicitly enabled", () => {
    const screen = buildAdminPrivacyWorkflowScreen({
      runtimeMode: "demo",
      canManagePrivacy: false
    });

    expect(screen).toMatchObject({
      state: "forbidden",
      title: "Access Denied",
      rows: [],
      demoChromeVisible: true
    });
    expect(
      renderAdminPrivacyWorkflowRoute({
        runtimeMode: "api",
        canManagePrivacy: false
      })
    ).toMatchObject({
      statusCode: 403,
      route: "AdminPrivacyWorkflowList",
      state: "forbidden"
    });
  });

  it("renders operation metadata without subject ids or direct erasure controls", () => {
    const rendered = renderAdminPrivacyWorkflowRoute({
      runtimeMode: "api",
      canManagePrivacy: true
    });

    expect(rendered.statusCode).toBe(200);
    expect(rendered.document).toContain("Candidate request");
    expect(rendered.document).toContain("admin.candidateRequest.export");
    expect(rendered.document).toContain('data-method="POST"');
    expect(rendered.document).toContain('data-destructive="true"');
    expect(rendered.document).not.toContain("data-request-path");
    expect(rendered.document).not.toContain("data-content-id");
  });
});
