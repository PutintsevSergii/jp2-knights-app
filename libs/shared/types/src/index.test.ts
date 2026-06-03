import { describe, expect, it } from "vitest";
import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_PRIVACY_WORKFLOWS,
  type AdminPrivacyWorkflowTarget,
  CONTENT_STATUSES,
  CONTENT_STATUS_METADATA,
  EVENT_STATUS_METADATA,
  DEVICE_TOKEN_PLATFORMS,
  MEMBERSHIP_STATUSES,
  NOTIFICATION_CATEGORIES,
  ORGANIZATION_UNIT_STATUSES,
  ORGANIZATION_UNIT_TYPES,
  PARTICIPATION_STATUSES,
  PRIVACY_WORKFLOW_RETENTION_BUCKETS,
  RETENTION_BUCKETS,
  RETENTION_BUCKET_METADATA,
  ROADMAP_ASSIGNMENT_STATUSES,
  ROADMAP_ASSIGNMENT_STATUS_METADATA,
  ROADMAP_SUBMISSION_STATUSES,
  ROADMAP_SUBMISSION_STATUS_METADATA,
  ROADMAP_TARGET_ROLES,
  RUNTIME_MODES,
  VISIBILITIES,
  adminPrivacyWorkflowOperationPath
} from "./index.js";

describe("shared types", () => {
  it("keeps public visibility as an explicit contract value", () => {
    expect(VISIBILITIES).toContain("PUBLIC");
  });

  it("documents demo runtime mode for fixture-backed app launches", () => {
    expect(RUNTIME_MODES).toContain("demo");
  });

  it("keeps content workflow statuses uppercase for public contracts", () => {
    expect(CONTENT_STATUSES).toEqual(["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
  });

  it("keeps operational statuses in snake_case", () => {
    expect(PARTICIPATION_STATUSES).toContain("planning_to_attend");
  });

  it("keeps notification categories and token platforms explicit", () => {
    expect(NOTIFICATION_CATEGORIES).toEqual([
      "events",
      "announcements",
      "roadmap_updates",
      "prayer_reminders"
    ]);
    expect(DEVICE_TOKEN_PLATFORMS).toEqual(["ios", "android", "web"]);
  });

  it("keeps organization lifecycle statuses shared for API and admin code", () => {
    expect(ORGANIZATION_UNIT_TYPES).toContain("CHORAGIEW");
    expect(ORGANIZATION_UNIT_STATUSES).toEqual(["active", "archived"]);
    expect(MEMBERSHIP_STATUSES).toEqual(["active", "inactive", "archived"]);
  });

  it("keeps roadmap lifecycle contracts explicit", () => {
    expect(ROADMAP_TARGET_ROLES).toEqual(["CANDIDATE", "BROTHER"]);
    expect(ROADMAP_ASSIGNMENT_STATUSES).toEqual(["active", "completed", "archived"]);
    expect(ROADMAP_SUBMISSION_STATUSES).toEqual(["pending_review", "approved", "rejected"]);
  });

  it("keeps shared status metadata in parity with status contracts", () => {
    expect(Object.keys(CONTENT_STATUS_METADATA)).toEqual([...CONTENT_STATUSES]);
    expect(Object.keys(EVENT_STATUS_METADATA)).toEqual([
      "draft",
      "published",
      "cancelled",
      "archived"
    ]);
    expect(Object.keys(ROADMAP_ASSIGNMENT_STATUS_METADATA)).toEqual([
      ...ROADMAP_ASSIGNMENT_STATUSES
    ]);
    expect(Object.keys(ROADMAP_SUBMISSION_STATUS_METADATA)).toEqual([
      ...ROADMAP_SUBMISSION_STATUSES
    ]);
    expect(ROADMAP_SUBMISSION_STATUS_METADATA.pending_review.terminal).toBe(false);
    expect(ROADMAP_SUBMISSION_STATUS_METADATA.approved.labelKey).toBe("roadmap.status.approved");
  });

  it("keeps retention buckets explicit without legal-duration defaults", () => {
    expect(RETENTION_BUCKETS).toEqual([
      "short_lived_presence",
      "short_lived_technical",
      "operational",
      "community_record",
      "sensitive_review",
      "audit"
    ]);
    expect(Object.keys(RETENTION_BUCKET_METADATA)).toEqual([...RETENTION_BUCKETS]);
    expect(RETENTION_BUCKET_METADATA.sensitive_review).toMatchObject({
      requiredCapability: "archive_export_erasure",
      durationPolicy: "deployment_configured_after_legal_review"
    });
    expect(RETENTION_BUCKET_METADATA.audit).toMatchObject({
      requiredCapability: "append_only_redaction",
      durationPolicy: "append_only_redacted"
    });
    expect(PRIVACY_WORKFLOW_RETENTION_BUCKETS).toMatchObject({
      candidateRequest: "sensitive_review",
      candidateProfile: "sensitive_review",
      roadmapSubmission: "sensitive_review",
      deviceToken: "operational"
    });
  });

  it("keeps Super Admin privacy workflow metadata centralized", () => {
    expect(Object.keys(ADMIN_PRIVACY_WORKFLOWS)).toEqual([
      "candidateRequest",
      "candidateProfile",
      "roadmapSubmission"
    ]);

    for (const target of Object.keys(
      ADMIN_PRIVACY_WORKFLOWS
    ) as AdminPrivacyWorkflowTarget[]) {
      const workflow = ADMIN_PRIVACY_WORKFLOWS[target];

      expect(workflow.retentionBucket).toBe(PRIVACY_WORKFLOW_RETENTION_BUCKETS[target]);
      expect(workflow.operations.export).toMatchObject({
        method: "GET",
        destructive: false,
        requiredRole: "SUPER_ADMIN"
      });
      expect(workflow.operations.erase).toMatchObject({
        method: "POST",
        destructive: true,
        requiredRole: "SUPER_ADMIN"
      });
      expect(ADMIN_AUDIT_ACTIONS).toContain(workflow.operations.export.auditAction);
      expect(ADMIN_AUDIT_ACTIONS).toContain(workflow.operations.erase.auditAction);
    }

    expect(
      adminPrivacyWorkflowOperationPath("candidateRequest", "request/unsafe", "erase")
    ).toBe("admin/candidate-requests/request%2Funsafe/erase");
    expect(
      adminPrivacyWorkflowOperationPath("roadmapSubmission", "submission-1", "export")
    ).toBe("admin/roadmap-submissions/submission-1/export");
  });

  it("keeps known admin audit actions explicit for Admin Lite filters", () => {
    expect(ADMIN_AUDIT_ACTIONS).toEqual([
      "admin.candidateRequest.export",
      "admin.candidateRequest.erase",
      "admin.candidateRequest.update",
      "admin.candidateRequest.convert",
      "admin.candidateProfile.export",
      "admin.candidateProfile.erase",
      "admin.candidateProfile.update",
      "admin.roadmapSubmission.export",
      "admin.roadmapSubmission.erase",
      "admin.roadmapSubmission.approved",
      "admin.roadmapSubmission.rejected",
      "admin.roadmapAssignment.create",
      "admin.identityAccess.confirm",
      "admin.identityAccess.reject",
      "admin.organizationUnit.create",
      "admin.organizationUnit.update",
      "admin.prayer.create",
      "admin.prayer.approve",
      "admin.prayer.publish",
      "admin.prayer.archive",
      "admin.prayer.update",
      "admin.event.create",
      "admin.event.approve",
      "admin.event.publish",
      "admin.event.cancel",
      "admin.event.archive",
      "admin.event.update",
      "admin.announcement.create",
      "admin.announcement.approve",
      "admin.announcement.publish",
      "admin.announcement.push_dispatch",
      "admin.announcement.archive",
      "admin.announcement.update",
      "admin.silent_prayer_event.create",
      "admin.silent_prayer_event.approve",
      "admin.silent_prayer_event.publish",
      "admin.silent_prayer_event.archive",
      "admin.silent_prayer_event.update"
    ]);
    expect(new Set(ADMIN_AUDIT_ACTIONS).size).toBe(ADMIN_AUDIT_ACTIONS.length);
  });
});
