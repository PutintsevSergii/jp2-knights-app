export const ROLES = ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["active", "inactive", "invited", "archived"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ORGANIZATION_UNIT_TYPES = [
  "ORDER",
  "PROVINCE",
  "COMMANDERY",
  "CHORAGIEW",
  "OTHER"
] as const;
export type OrganizationUnitType = (typeof ORGANIZATION_UNIT_TYPES)[number];

export const ORGANIZATION_UNIT_STATUSES = ["active", "archived"] as const;
export type OrganizationUnitStatus = (typeof ORGANIZATION_UNIT_STATUSES)[number];

export const MEMBERSHIP_STATUSES = ["active", "inactive", "archived"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const VISIBILITIES = [
  "PUBLIC",
  "FAMILY_OPEN",
  "CANDIDATE",
  "BROTHER",
  "ORGANIZATION_UNIT",
  "OFFICER",
  "ADMIN"
] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const CONTENT_STATUSES = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CANDIDATE_REQUEST_STATUSES = [
  "new",
  "contacted",
  "invited",
  "rejected",
  "converted_to_candidate"
] as const;
export type CandidateRequestStatus = (typeof CANDIDATE_REQUEST_STATUSES)[number];

export const CANDIDATE_PROFILE_STATUSES = [
  "active",
  "paused",
  "converted_to_brother",
  "archived"
] as const;
export type CandidateProfileStatus = (typeof CANDIDATE_PROFILE_STATUSES)[number];

export const EVENT_STATUSES = ["draft", "published", "cancelled", "archived"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const PARTICIPATION_STATUSES = ["planning_to_attend", "cancelled"] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

export const DEVICE_TOKEN_PLATFORMS = ["ios", "android", "web"] as const;
export type DeviceTokenPlatform = (typeof DEVICE_TOKEN_PLATFORMS)[number];

export const NOTIFICATION_CATEGORIES = [
  "events",
  "announcements",
  "roadmap_updates",
  "prayer_reminders"
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const ROADMAP_SUBMISSION_STATUSES = ["pending_review", "approved", "rejected"] as const;
export type RoadmapSubmissionStatus = (typeof ROADMAP_SUBMISSION_STATUSES)[number];

export const ATTACHMENT_STATUSES = ["active", "archived", "deleted"] as const;
export type AttachmentStatus = (typeof ATTACHMENT_STATUSES)[number];

export const RUNTIME_MODES = ["api", "demo", "test"] as const;
export type RuntimeMode = (typeof RUNTIME_MODES)[number];

export interface HealthStatus {
  app: "api" | "admin" | "mobile";
  runtimeMode: RuntimeMode;
  status: "ok";
}
