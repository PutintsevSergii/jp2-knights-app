import {
  CONTENT_STATUSES,
  EVENT_STATUSES,
  ROADMAP_ASSIGNMENT_STATUSES,
  ROADMAP_SUBMISSION_STATUSES,
  ROADMAP_TARGET_ROLES,
  VISIBILITIES
} from "@jp2/shared-types";

export const contentStatusOpenApiSchema = {
  type: "string",
  enum: [...CONTENT_STATUSES]
};

export const eventStatusOpenApiSchema = {
  type: "string",
  enum: [...EVENT_STATUSES]
};

export const visibilityOpenApiSchema = {
  type: "string",
  enum: [...VISIBILITIES]
};

export const roadmapAssignmentStatusOpenApiSchema = {
  type: "string",
  enum: [...ROADMAP_ASSIGNMENT_STATUSES]
};

export const roadmapSubmissionStatusOpenApiSchema = {
  type: "string",
  enum: [...ROADMAP_SUBMISSION_STATUSES]
};

export const roadmapSubmissionReviewStatusOpenApiSchema = {
  type: "string",
  enum: ["approved", "rejected"]
};

export const roadmapTargetRoleOpenApiSchema = {
  type: "string",
  enum: [...ROADMAP_TARGET_ROLES]
};
