const auditSummaryOpenApiSchema = {
  type: "object",
  additionalProperties: {
    oneOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }]
  }
};

export const adminAuditLogSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "actorUserId",
    "actorDisplayName",
    "action",
    "entityType",
    "entityId",
    "scopeOrganizationUnitId",
    "beforeSummary",
    "afterSummary",
    "requestId",
    "createdAt"
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    actorUserId: { type: "string", format: "uuid", nullable: true },
    actorDisplayName: { type: "string", nullable: true },
    action: { type: "string" },
    entityType: { type: "string" },
    entityId: { type: "string", format: "uuid" },
    scopeOrganizationUnitId: { type: "string", format: "uuid", nullable: true },
    beforeSummary: { ...auditSummaryOpenApiSchema, nullable: true },
    afterSummary: { ...auditSummaryOpenApiSchema, nullable: true },
    requestId: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

export const adminAuditLogListResponseOpenApiSchema = {
  type: "object",
  required: ["auditLogs", "pagination"],
  properties: {
    auditLogs: {
      type: "array",
      items: adminAuditLogSummaryOpenApiSchema
    },
    pagination: {
      type: "object",
      required: ["limit", "offset", "total"],
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 100 },
        offset: { type: "integer", minimum: 0, maximum: 5000 },
        total: { type: "integer", minimum: 0 }
      }
    }
  }
};
