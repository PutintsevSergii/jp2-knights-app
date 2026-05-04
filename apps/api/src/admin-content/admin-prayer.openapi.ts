const contentStatusOpenApiSchema = {
  type: "string",
  enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]
};

const visibilityOpenApiSchema = {
  type: "string",
  enum: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "BROTHER", "ORGANIZATION_UNIT", "OFFICER", "ADMIN"]
};

export const adminPrayerSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "categoryId",
    "title",
    "body",
    "language",
    "visibility",
    "targetOrganizationUnitId",
    "status",
    "publishedAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    categoryId: { type: "string", nullable: true, format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 8000 },
    language: { type: "string", minLength: 2, maxLength: 10 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema,
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminPrayerListResponseOpenApiSchema = {
  type: "object",
  required: ["prayers"],
  additionalProperties: false,
  properties: {
    prayers: {
      type: "array",
      items: adminPrayerSummaryOpenApiSchema
    }
  }
};

export const adminPrayerDetailResponseOpenApiSchema = {
  type: "object",
  required: ["prayer"],
  additionalProperties: false,
  properties: {
    prayer: adminPrayerSummaryOpenApiSchema
  }
};

export const createAdminPrayerRequestOpenApiSchema = {
  type: "object",
  required: ["title", "body", "language", "visibility", "status"],
  additionalProperties: false,
  properties: {
    categoryId: { type: "string", nullable: true, format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 8000 },
    language: { type: "string", minLength: 2, maxLength: 10 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema
  }
};

export const updateAdminPrayerRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    categoryId: { type: "string", nullable: true, format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 8000 },
    language: { type: "string", minLength: 2, maxLength: 10 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: contentStatusOpenApiSchema,
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};
