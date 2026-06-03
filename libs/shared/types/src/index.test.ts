import { describe, expect, it } from "vitest";
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_METADATA,
  EVENT_STATUS_METADATA,
  DEVICE_TOKEN_PLATFORMS,
  MEMBERSHIP_STATUSES,
  NOTIFICATION_CATEGORIES,
  ORGANIZATION_UNIT_STATUSES,
  ORGANIZATION_UNIT_TYPES,
  PARTICIPATION_STATUSES,
  RETENTION_BUCKETS,
  RETENTION_BUCKET_METADATA,
  ROADMAP_ASSIGNMENT_STATUSES,
  ROADMAP_ASSIGNMENT_STATUS_METADATA,
  ROADMAP_SUBMISSION_STATUSES,
  ROADMAP_SUBMISSION_STATUS_METADATA,
  ROADMAP_TARGET_ROLES,
  RUNTIME_MODES,
  VISIBILITIES
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
  });
});
