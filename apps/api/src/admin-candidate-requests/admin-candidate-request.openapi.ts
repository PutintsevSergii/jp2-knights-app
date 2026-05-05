const adminCandidateRequestSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "firstName",
    "lastName",
    "email",
    "country",
    "city",
    "status",
    "assignedOrganizationUnitId",
    "assignedOrganizationUnitName",
    "createdAt",
    "updatedAt",
    "archivedAt"
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    firstName: { type: "string", minLength: 1, maxLength: 120 },
    lastName: { type: "string", minLength: 1, maxLength: 120 },
    email: { type: "string", format: "email", maxLength: 320 },
    country: { type: "string", minLength: 1, maxLength: 120 },
    city: { type: "string", minLength: 1, maxLength: 120 },
    status: {
      type: "string",
      enum: ["new", "contacted", "invited", "rejected", "converted_to_candidate"]
    },
    assignedOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    assignedOrganizationUnitName: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateRequestDetailOpenApiSchema = {
  allOf: [
    adminCandidateRequestSummaryOpenApiSchema,
    {
      type: "object",
      required: [
        "phone",
        "preferredLanguage",
        "message",
        "consentTextVersion",
        "consentAt",
        "officerNote"
      ],
      properties: {
        phone: { type: "string", nullable: true, minLength: 1, maxLength: 40 },
        preferredLanguage: { type: "string", nullable: true, minLength: 2, maxLength: 10 },
        message: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
        consentTextVersion: { type: "string", minLength: 1, maxLength: 120 },
        consentAt: { type: "string", format: "date-time" },
        officerNote: { type: "string", nullable: true, minLength: 1, maxLength: 2000 }
      }
    }
  ]
};

export const adminCandidateRequestListResponseOpenApiSchema = {
  type: "object",
  required: ["candidateRequests"],
  properties: {
    candidateRequests: {
      type: "array",
      items: adminCandidateRequestSummaryOpenApiSchema
    }
  }
};

export const adminCandidateRequestDetailResponseOpenApiSchema = {
  type: "object",
  required: ["candidateRequest"],
  properties: {
    candidateRequest: adminCandidateRequestDetailOpenApiSchema
  }
};

export const updateAdminCandidateRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["new", "contacted", "invited", "rejected"] },
    assignedOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    officerNote: { type: "string", nullable: true, minLength: 1, maxLength: 2000 }
  }
};
