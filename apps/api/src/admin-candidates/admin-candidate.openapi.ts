export const adminCandidateProfileOpenApiSchema = {
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

export const adminCandidateProfileListResponseOpenApiSchema = {
  type: "object",
  required: ["candidateProfiles"],
  properties: {
    candidateProfiles: {
      type: "array",
      items: adminCandidateProfileOpenApiSchema
    }
  }
};

export const adminCandidateProfileDetailResponseOpenApiSchema = {
  type: "object",
  required: ["candidateProfile"],
  properties: {
    candidateProfile: adminCandidateProfileOpenApiSchema
  }
};

export const updateAdminCandidateProfileOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["active", "paused", "archived"] },
    assignedOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    responsibleOfficerId: { type: "string", nullable: true, format: "uuid" }
  }
};
