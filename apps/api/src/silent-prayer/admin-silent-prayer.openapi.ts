const contentStatusOpenApiSchema = {
  type: "string",
  enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]
};

const visibilityOpenApiSchema = {
  type: "string",
  enum: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "BROTHER", "ORGANIZATION_UNIT", "OFFICER", "ADMIN"]
};

export const adminSilentPrayerEventSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "intention",
    "visibility",
    "targetOrganizationUnitId",
    "status",
    "startsAt",
    "endsAt",
    "approvedAt",
    "publishedAt",
    "cancelledAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    intention: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema,
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", nullable: true, format: "date-time" },
    approvedAt: { type: "string", nullable: true, format: "date-time" },
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminSilentPrayerEventListResponseOpenApiSchema = {
  type: "object",
  required: ["silentPrayerEvents"],
  additionalProperties: false,
  properties: {
    silentPrayerEvents: {
      type: "array",
      items: adminSilentPrayerEventSummaryOpenApiSchema
    }
  }
};

export const adminSilentPrayerEventDetailResponseOpenApiSchema = {
  type: "object",
  required: ["silentPrayerEvent"],
  additionalProperties: false,
  properties: {
    silentPrayerEvent: adminSilentPrayerEventSummaryOpenApiSchema
  }
};

export const createAdminSilentPrayerEventRequestOpenApiSchema = {
  type: "object",
  required: ["title", "visibility", "status", "startsAt"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    intention: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema,
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const updateAdminSilentPrayerEventRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    intention: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema,
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", nullable: true, format: "date-time" },
    approvedAt: { type: "string", nullable: true, format: "date-time" },
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};
