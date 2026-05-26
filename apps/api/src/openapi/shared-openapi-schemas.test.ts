import { describe, expect, it } from "vitest";
import {
  CONTENT_STATUSES,
  EVENT_STATUSES,
  ROADMAP_ASSIGNMENT_STATUSES,
  ROADMAP_SUBMISSION_STATUSES,
  ROADMAP_TARGET_ROLES,
  VISIBILITIES
} from "@jp2/shared-types";
import {
  contentStatusOpenApiSchema,
  eventStatusOpenApiSchema,
  roadmapAssignmentStatusOpenApiSchema,
  roadmapSubmissionStatusOpenApiSchema,
  roadmapTargetRoleOpenApiSchema,
  visibilityOpenApiSchema
} from "./shared-openapi-schemas.js";

describe("shared OpenAPI schemas", () => {
  it("keeps enum schemas in parity with shared type constants", () => {
    expect(visibilityOpenApiSchema.enum).toEqual(VISIBILITIES);
    expect(contentStatusOpenApiSchema.enum).toEqual(CONTENT_STATUSES);
    expect(eventStatusOpenApiSchema.enum).toEqual(EVENT_STATUSES);
    expect(roadmapAssignmentStatusOpenApiSchema.enum).toEqual(ROADMAP_ASSIGNMENT_STATUSES);
    expect(roadmapSubmissionStatusOpenApiSchema.enum).toEqual(ROADMAP_SUBMISSION_STATUSES);
    expect(roadmapTargetRoleOpenApiSchema.enum).toEqual(ROADMAP_TARGET_ROLES);
  });
});
