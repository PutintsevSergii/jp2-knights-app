export const currentUserResponseOpenApiSchema = {
  type: "object",
  required: ["user", "access"],
  additionalProperties: false,
  properties: {
    user: {
      type: "object",
      required: ["id", "email", "displayName", "preferredLanguage", "status", "roles"],
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        displayName: { type: "string" },
        preferredLanguage: { type: "string", nullable: true },
        status: {
          type: "string",
          enum: ["active", "inactive", "invited", "archived"]
        },
        roles: {
          type: "array",
          items: {
            type: "string",
            enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"]
          }
        }
      }
    },
    access: {
      type: "object",
      required: ["mobileMode", "adminLite"],
      additionalProperties: false,
      properties: {
        mobileMode: {
          type: "string",
          enum: ["public", "candidate", "brother"]
        },
        adminLite: { type: "boolean" }
      }
    }
  }
};
