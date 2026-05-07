const contentStatusOpenApiSchema = {
  type: "string",
  enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]
};

const visibilityOpenApiSchema = {
  type: "string",
  enum: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "BROTHER", "ORGANIZATION_UNIT", "OFFICER", "ADMIN"]
};

export const adminAnnouncementSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "body",
    "visibility",
    "targetOrganizationUnitId",
    "pinned",
    "status",
    "publishedAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 2000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    pinned: { type: "boolean" },
    status: contentStatusOpenApiSchema,
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminAnnouncementListResponseOpenApiSchema = {
  type: "object",
  required: ["announcements"],
  additionalProperties: false,
  properties: {
    announcements: {
      type: "array",
      items: adminAnnouncementSummaryOpenApiSchema
    }
  }
};

export const adminAnnouncementDetailResponseOpenApiSchema = {
  type: "object",
  required: ["announcement"],
  additionalProperties: false,
  properties: {
    announcement: adminAnnouncementSummaryOpenApiSchema
  }
};

export const createAdminAnnouncementRequestOpenApiSchema = {
  type: "object",
  required: ["title", "body", "visibility", "status"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 2000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    pinned: { type: "boolean" },
    status: contentStatusOpenApiSchema
  }
};

export const updateAdminAnnouncementRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 2000 },
    visibility: visibilityOpenApiSchema,
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    pinned: { type: "boolean" },
    status: contentStatusOpenApiSchema,
    publishedAt: { type: "string", nullable: true, format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};
