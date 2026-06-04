import { notificationPreferenceSettingsOpenApiSchema } from "../auth/auth.openapi.js";
import {
  contentStatusOpenApiSchema,
  eventStatusOpenApiSchema,
  participationStatusOpenApiSchema,
  roadmapAssignmentStatusOpenApiSchema,
  roadmapTargetRoleOpenApiSchema,
  visibilityOpenApiSchema
} from "../openapi/shared-openapi-schemas.js";

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

export const adminCandidateProfileProviderAccountExportOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "provider",
    "providerSubject",
    "email",
    "emailVerified",
    "phone",
    "displayName",
    "photoUrl",
    "lastSignInAt",
    "createdAt",
    "updatedAt",
    "revokedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    provider: { type: "string", minLength: 1, maxLength: 80 },
    providerSubject: { type: "string", minLength: 1, maxLength: 200 },
    email: { type: "string", nullable: true, format: "email", maxLength: 320 },
    emailVerified: { type: "boolean", nullable: true },
    phone: { type: "string", nullable: true, minLength: 1, maxLength: 40 },
    displayName: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    photoUrl: { type: "string", nullable: true, format: "uri", maxLength: 2048 },
    lastSignInAt: { type: "string", nullable: true, format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    revokedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileDeviceTokenExportOpenApiSchema = {
  type: "object",
  required: ["id", "platform", "lastSeenAt", "createdAt", "updatedAt", "revokedAt"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    platform: { type: "string", enum: ["ios", "android", "web"] },
    lastSeenAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    revokedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileUserRoleExportOpenApiSchema = {
  type: "object",
  required: ["id", "role", "createdBy", "createdAt", "revokedAt"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    role: { type: "string", enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"] },
    createdBy: { type: "string", nullable: true, format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    revokedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileIdentityAccessReviewExportOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "providerAccountId",
    "status",
    "scopeOrganizationUnitId",
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
    providerAccountId: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["pending", "confirmed", "rejected", "expired"] },
    scopeOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    requestedRole: {
      type: "string",
      nullable: true,
      enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"]
    },
    assignedRole: {
      type: "string",
      nullable: true,
      enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"]
    },
    expiresAt: { type: "string", format: "date-time" },
    decidedBy: { type: "string", nullable: true, format: "uuid" },
    decidedAt: { type: "string", nullable: true, format: "date-time" },
    decisionNote: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

export const adminCandidateProfileMembershipExportOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "organizationUnitId",
    "status",
    "currentDegree",
    "joinedAt",
    "createdAt",
    "updatedAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    organizationUnitId: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["active", "archived", "inactive"] },
    currentDegree: { type: "string", nullable: true, minLength: 1, maxLength: 120 },
    joinedAt: { type: "string", nullable: true, format: "date" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileOfficerAssignmentExportOpenApiSchema = {
  type: "object",
  required: ["id", "organizationUnitId", "title", "startsAt", "endsAt", "createdBy", "createdAt"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    organizationUnitId: { type: "string", format: "uuid" },
    title: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    startsAt: { type: "string", format: "date" },
    endsAt: { type: "string", nullable: true, format: "date" },
    createdBy: { type: "string", nullable: true, format: "uuid" },
    createdAt: { type: "string", format: "date-time" }
  }
};

export const adminCandidateProfileRoadmapAssignmentExportOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "roadmapDefinitionId",
    "roadmapTargetRole",
    "roadmapStatus",
    "organizationUnitId",
    "status",
    "assignedByUserId",
    "assignedAt",
    "completedAt",
    "submissionCount",
    "pendingSubmissionCount",
    "createdAt",
    "updatedAt",
    "archivedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    roadmapDefinitionId: { type: "string", format: "uuid" },
    roadmapTargetRole: roadmapTargetRoleOpenApiSchema,
    roadmapStatus: contentStatusOpenApiSchema,
    organizationUnitId: { type: "string", nullable: true, format: "uuid" },
    status: roadmapAssignmentStatusOpenApiSchema,
    assignedByUserId: { type: "string", nullable: true, format: "uuid" },
    assignedAt: { type: "string", format: "date-time" },
    completedAt: { type: "string", nullable: true, format: "date-time" },
    submissionCount: { type: "integer", minimum: 0 },
    pendingSubmissionCount: { type: "integer", minimum: 0 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    archivedAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileEventParticipationExportOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "eventId",
    "eventTitle",
    "eventType",
    "eventVisibility",
    "eventStatus",
    "eventTargetOrganizationUnitId",
    "eventStartAt",
    "eventEndAt",
    "intentStatus",
    "createdAt",
    "updatedAt",
    "cancelledAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    eventId: { type: "string", format: "uuid" },
    eventTitle: { type: "string", minLength: 1, maxLength: 200 },
    eventType: { type: "string", minLength: 1, maxLength: 120 },
    eventVisibility: visibilityOpenApiSchema,
    eventStatus: eventStatusOpenApiSchema,
    eventTargetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    eventStartAt: { type: "string", format: "date-time" },
    eventEndAt: { type: "string", nullable: true, format: "date-time" },
    intentStatus: participationStatusOpenApiSchema,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const adminCandidateProfileExportResponseOpenApiSchema = {
  type: "object",
  required: [
    "candidateProfile",
    "providerAccounts",
    "deviceTokens",
    "userRoles",
    "identityAccessReviews",
    "memberships",
    "officerAssignments",
    "roadmapAssignments",
    "eventParticipations",
    "notificationPreferences",
    "retentionBucket",
    "exportedAt"
  ],
  properties: {
    candidateProfile: adminCandidateProfileOpenApiSchema,
    providerAccounts: {
      type: "array",
      items: adminCandidateProfileProviderAccountExportOpenApiSchema
    },
    deviceTokens: {
      type: "array",
      items: adminCandidateProfileDeviceTokenExportOpenApiSchema
    },
    userRoles: {
      type: "array",
      items: adminCandidateProfileUserRoleExportOpenApiSchema
    },
    identityAccessReviews: {
      type: "array",
      items: adminCandidateProfileIdentityAccessReviewExportOpenApiSchema
    },
    memberships: {
      type: "array",
      items: adminCandidateProfileMembershipExportOpenApiSchema
    },
    officerAssignments: {
      type: "array",
      items: adminCandidateProfileOfficerAssignmentExportOpenApiSchema
    },
    roadmapAssignments: {
      type: "array",
      items: adminCandidateProfileRoadmapAssignmentExportOpenApiSchema
    },
    eventParticipations: {
      type: "array",
      items: adminCandidateProfileEventParticipationExportOpenApiSchema
    },
    notificationPreferences: notificationPreferenceSettingsOpenApiSchema,
    retentionBucket: { type: "string", enum: ["sensitive_review"] },
    exportedAt: { type: "string", format: "date-time" }
  }
};

export const adminCandidateProfileErasureResponseOpenApiSchema = {
  type: "object",
  required: ["candidateProfileId", "userId", "retentionBucket", "erasedAt", "archivedAt"],
  properties: {
    candidateProfileId: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    retentionBucket: { type: "string", enum: ["sensitive_review"] },
    erasedAt: { type: "string", format: "date-time" },
    archivedAt: { type: "string", format: "date-time" }
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
