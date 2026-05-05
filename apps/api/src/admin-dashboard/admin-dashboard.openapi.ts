export const adminDashboardTaskOpenApiSchema = {
  type: "object",
  required: ["id", "label", "count", "targetRoute", "priority"],
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    count: { type: "integer", minimum: 0 },
    targetRoute: {
      type: "string",
      enum: [
        "/admin/identity-access-reviews",
        "/admin/organization-units",
        "/admin/prayers",
        "/admin/events"
      ]
    },
    priority: {
      type: "string",
      enum: ["normal", "attention"]
    }
  }
};

export const adminDashboardResponseOpenApiSchema = {
  type: "object",
  required: ["scope", "counts", "tasks"],
  properties: {
    scope: {
      type: "object",
      required: ["adminKind", "organizationUnitIds"],
      properties: {
        adminKind: {
          type: "string",
          enum: ["SUPER_ADMIN", "OFFICER"]
        },
        organizationUnitIds: {
          type: "array",
          items: { type: "string", format: "uuid" }
        }
      }
    },
    counts: {
      type: "object",
      required: ["identityAccessReviews", "organizationUnits", "prayers", "events"],
      properties: {
        identityAccessReviews: { type: "integer", minimum: 0 },
        organizationUnits: { type: "integer", minimum: 0 },
        prayers: { type: "integer", minimum: 0 },
        events: { type: "integer", minimum: 0 }
      }
    },
    tasks: {
      type: "array",
      items: adminDashboardTaskOpenApiSchema
    }
  }
};
