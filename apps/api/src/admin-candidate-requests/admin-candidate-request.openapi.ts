const adminCandidateRequestSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "firstName",
    "lastName",
    "email",
    "country",
    "city",
    "messagePreview",
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
    messagePreview: { type: "string", nullable: true, maxLength: 160 },
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

export const adminCandidateProfileDetailOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "userId",
    "candidateRequestId",
    "displayName",
    "email",
    "preferredLanguage",
    "assignedOrganizationUnitId",
    "assignedOrganizationUnitName",
    "responsibleOfficerId",
    "responsibleOfficerName",
    "status",
    "createdAt",
    "updatedAt",
    "archivedAt"
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    candidateRequestId: { type: "string", nullable: true, format: "uuid" },
    displayName: { type: "string", minLength: 1, maxLength: 200 },
    email: { type: "string", format: "email", maxLength: 320 },
    preferredLanguage: { type: "string", nullable: true, minLength: 2, maxLength: 10 },
    assignedOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    assignedOrganizationUnitName: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    responsibleOfficerId: { type: "string", nullable: true, format: "uuid" },
    responsibleOfficerName: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    status: { type: "string", enum: ["active", "paused", "converted_to_brother", "archived"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileDetailResponseOpenApiSchema = {
  type: "object",
  required: ["candidateProfile"],
  properties: {
    candidateProfile: adminCandidateProfileDetailOpenApiSchema
  }
};

export const convertCandidateRequestOpenApiSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    assignedOrganizationUnitId: { type: "string", format: "uuid" },
    responsibleOfficerId: { type: "string", nullable: true, format: "uuid" }
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
