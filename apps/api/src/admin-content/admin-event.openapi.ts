import {
  eventStatusOpenApiSchema,
  visibilityOpenApiSchema
} from "../openapi/shared-openapi-schemas.js";

export const adminEventSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "description",
    "type",
    "startAt",
    "endAt",
    "locationLabel",
    "visibility",
    "targetOrganizationUnitId",
    "status",
    "approvedByUserId",
    "publishedByUserId",
    "approvedAt",
    "publishedAt",
    "cancelledAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    type: { type: "string", minLength: 1, maxLength: 80 },
    startAt: { type: "string", format: "date-time" },
    endAt: { type: "string", nullable: true, format: "date-time" },
    locationLabel: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: eventStatusOpenApiSchema,
    approvedByUserId: { type: "string", nullable: true, format: "uuid" },
    publishedByUserId: { type: "string", nullable: true, format: "uuid" },
    approvedAt: { type: "string", nullable: true, format: "date-time" },
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminEventListResponseOpenApiSchema = {
  type: "object",
  required: ["events"],
  additionalProperties: false,
  properties: {
    events: {
      type: "array",
      items: adminEventSummaryOpenApiSchema
    }
  }
};

export const adminEventDetailResponseOpenApiSchema = {
  type: "object",
  required: ["event"],
  additionalProperties: false,
  properties: {
    event: adminEventSummaryOpenApiSchema
  }
};

export const createAdminEventRequestOpenApiSchema = {
  type: "object",
  required: ["title", "type", "startAt", "visibility", "status"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    type: { type: "string", minLength: 1, maxLength: 80 },
    startAt: { type: "string", format: "date-time" },
    endAt: { type: "string", nullable: true, format: "date-time" },
    locationLabel: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: eventStatusOpenApiSchema
  }
};

export const updateAdminEventRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    type: { type: "string", minLength: 1, maxLength: 80 },
    startAt: { type: "string", format: "date-time" },
    endAt: { type: "string", nullable: true, format: "date-time" },
    locationLabel: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: eventStatusOpenApiSchema,
    approvedAt: { type: "string", nullable: true, format: "date-time" },
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};
