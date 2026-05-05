export const adminIdentityAccessReviewOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "userId",
    "displayName",
    "email",
    "provider",
    "providerSubject",
    "status",
    "scopeOrganizationUnitId",
    "scopeOrganizationUnitName",
    "requestedRole",
    "assignedRole",
    "expiresAt",
    "decidedBy",
    "decidedAt",
    "decisionNote",
    "createdAt",
    "updatedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    displayName: { type: "string" },
    email: { type: "string", format: "email" },
    provider: { type: "string" },
    providerSubject: { type: "string" },
    status: {
      type: "string",
      enum: ["pending", "confirmed", "rejected", "expired"]
    },
    scopeOrganizationUnitId: { type: "string", format: "uuid", nullable: true },
    scopeOrganizationUnitName: { type: "string", nullable: true },
    requestedRole: {
      type: "string",
      enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"],
      nullable: true
    },
    assignedRole: {
      type: "string",
      enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"],
      nullable: true
    },
    expiresAt: { type: "string", format: "date-time" },
    decidedBy: { type: "string", format: "uuid", nullable: true },
    decidedAt: { type: "string", format: "date-time", nullable: true },
    decisionNote: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

export const adminIdentityAccessReviewListResponseOpenApiSchema = {
  type: "object",
  required: ["identityAccessReviews"],
  additionalProperties: false,
  properties: {
    identityAccessReviews: {
      type: "array",
      items: adminIdentityAccessReviewOpenApiSchema
    }
  }
};

export const adminIdentityAccessReviewDetailResponseOpenApiSchema = {
  type: "object",
  required: ["identityAccessReview"],
  additionalProperties: false,
  properties: {
    identityAccessReview: adminIdentityAccessReviewOpenApiSchema
  }
};

export const confirmIdentityAccessReviewOpenApiSchema = {
  type: "object",
  required: ["assignedRole", "organizationUnitId"],
  additionalProperties: false,
  properties: {
    assignedRole: {
      type: "string",
      enum: ["CANDIDATE", "BROTHER", "OFFICER"]
    },
    organizationUnitId: { type: "string", format: "uuid" },
    note: { type: "string", nullable: true }
  }
};

export const rejectIdentityAccessReviewOpenApiSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    note: { type: "string", nullable: true }
  }
};

export const expireIdentityAccessReviewsResponseOpenApiSchema = {
  type: "object",
  required: ["expired"],
  additionalProperties: false,
  properties: {
    expired: { type: "integer", minimum: 0 }
  }
};
