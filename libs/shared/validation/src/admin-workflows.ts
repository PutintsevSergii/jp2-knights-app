import { z } from "zod";
import {
  candidateProfileStatusSchema,
  candidateRequestStatusSchema,
  roleSchema
} from "./common.js";

export const adminCandidateRequestSummarySchema = z.object({
  id: z.uuid(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  country: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  messagePreview: z.string().trim().max(160).nullable(),
  status: candidateRequestStatusSchema,
  assignedOrganizationUnitId: z.uuid().nullable(),
  assignedOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminCandidateRequestDetailSchema = adminCandidateRequestSummarySchema.extend({
  phone: z.string().trim().min(1).max(40).nullable(),
  preferredLanguage: z.string().trim().min(2).max(10).nullable(),
  message: z.string().trim().min(1).max(2000).nullable(),
  consentTextVersion: z.string().trim().min(1).max(120),
  consentAt: z.iso.datetime(),
  officerNote: z.string().trim().min(1).max(2000).nullable()
});

export const adminCandidateRequestListResponseSchema = z.object({
  candidateRequests: z.array(adminCandidateRequestSummarySchema)
});

export const adminCandidateRequestDetailResponseSchema = z.object({
  candidateRequest: adminCandidateRequestDetailSchema
});

export const adminCandidateRequestExportResponseSchema = z.object({
  candidateRequest: adminCandidateRequestDetailSchema,
  exportedAt: z.iso.datetime()
});

export const adminCandidateRequestErasureResponseSchema = z.object({
  candidateRequestId: z.uuid(),
  erasedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime()
});

export const adminCandidateProfileSummarySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  candidateRequestId: z.uuid().nullable(),
  displayName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  preferredLanguage: z.string().trim().min(2).max(10).nullable(),
  assignedOrganizationUnitId: z.uuid().nullable(),
  assignedOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  responsibleOfficerId: z.uuid().nullable(),
  responsibleOfficerName: z.string().trim().min(1).max(200).nullable(),
  status: candidateProfileStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminCandidateProfileDetailSchema = adminCandidateProfileSummarySchema;

export const adminCandidateProfileDetailResponseSchema = z.object({
  candidateProfile: adminCandidateProfileDetailSchema
});

export const adminCandidateProfileExportResponseSchema = z.object({
  candidateProfile: adminCandidateProfileDetailSchema,
  exportedAt: z.iso.datetime()
});

export const adminCandidateProfileErasureResponseSchema = z.object({
  candidateProfileId: z.uuid(),
  userId: z.uuid(),
  erasedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime()
});

export const adminCandidateProfileListResponseSchema = z.object({
  candidateProfiles: z.array(adminCandidateProfileSummarySchema)
});

export const updateAdminCandidateProfileSchema = z
  .object({
    status: z.enum(["active", "paused", "archived"]).optional(),
    assignedOrganizationUnitId: z.uuid().nullable().optional(),
    responsibleOfficerId: z.uuid().nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one candidate profile field must be provided."
  });

export const convertCandidateRequestSchema = z
  .object({
    assignedOrganizationUnitId: z.uuid().optional(),
    responsibleOfficerId: z.uuid().nullable().optional()
  })
  .strict();

export const updateAdminCandidateRequestSchema = z
  .object({
    status: z.enum(["new", "contacted", "invited", "rejected"]).optional(),
    assignedOrganizationUnitId: z.uuid().nullable().optional(),
    officerNote: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one candidate request field must be provided."
  });

export const adminDashboardTaskSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  count: z.number().int().min(0),
  targetRoute: z.enum([
    "/admin/identity-access-reviews",
    "/admin/organization-units",
    "/admin/prayers",
    "/admin/events"
  ]),
  priority: z.enum(["normal", "attention"])
});

export const adminDashboardResponseSchema = z.object({
  scope: z.object({
    adminKind: z.enum(["SUPER_ADMIN", "OFFICER"]),
    organizationUnitIds: z.array(z.uuid())
  }),
  counts: z.object({
    identityAccessReviews: z.number().int().min(0),
    organizationUnits: z.number().int().min(0),
    prayers: z.number().int().min(0),
    events: z.number().int().min(0)
  }),
  tasks: z.array(adminDashboardTaskSchema)
});

const auditSummaryValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const adminAuditLogListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).max(5000).default(0),
    action: z.string().trim().min(1).max(160).optional(),
    entityType: z.string().trim().min(1).max(120).optional(),
    actorUserId: z.uuid().optional(),
    entityId: z.uuid().optional(),
    scopeOrganizationUnitId: z.uuid().optional(),
    createdFrom: z.iso.datetime().optional(),
    createdTo: z.iso.datetime().optional()
  })
  .strict()
  .refine(
    (query) =>
      !query.createdFrom ||
      !query.createdTo ||
      new Date(query.createdFrom).getTime() <= new Date(query.createdTo).getTime(),
    {
      path: ["createdTo"],
      message: "createdTo must be after or equal to createdFrom."
    }
  );

export const adminAuditLogSummarySchema = z.object({
  id: z.uuid(),
  actorUserId: z.uuid().nullable(),
  actorDisplayName: z.string().trim().min(1).max(200).nullable(),
  action: z.string().trim().min(1).max(160),
  entityType: z.string().trim().min(1).max(120),
  entityId: z.uuid(),
  scopeOrganizationUnitId: z.uuid().nullable(),
  beforeSummary: z.record(z.string(), auditSummaryValueSchema).nullable(),
  afterSummary: z.record(z.string(), auditSummaryValueSchema).nullable(),
  requestId: z.string().trim().min(1).max(120).nullable(),
  createdAt: z.iso.datetime()
});

export const adminAuditLogListResponseSchema = z.object({
  auditLogs: z.array(adminAuditLogSummarySchema),
  pagination: z.object({
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().min(0).max(5000),
    total: z.number().int().min(0)
  })
});

export const identityAccessReviewStatusSchema = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "expired"
]);

export const adminIdentityAccessReviewSummarySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  displayName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  provider: z.string().trim().min(1).max(80),
  providerSubject: z.string().trim().min(1).max(200),
  status: identityAccessReviewStatusSchema,
  scopeOrganizationUnitId: z.uuid().nullable(),
  scopeOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  requestedRole: roleSchema.nullable(),
  assignedRole: roleSchema.nullable(),
  expiresAt: z.iso.datetime(),
  decidedBy: z.uuid().nullable(),
  decidedAt: z.iso.datetime().nullable(),
  decisionNote: z.string().trim().min(1).max(2000).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export const adminIdentityAccessReviewListResponseSchema = z.object({
  identityAccessReviews: z.array(adminIdentityAccessReviewSummarySchema)
});

export const adminIdentityAccessReviewDetailResponseSchema = z.object({
  identityAccessReview: adminIdentityAccessReviewSummarySchema
});

export const confirmIdentityAccessReviewSchema = z
  .object({
    assignedRole: z.enum(["CANDIDATE", "BROTHER", "OFFICER"]),
    organizationUnitId: z.uuid(),
    note: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict();

export const rejectIdentityAccessReviewSchema = z
  .object({
    note: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict();

export type AdminCandidateRequestSummaryDto = z.infer<typeof adminCandidateRequestSummarySchema>;
export type AdminCandidateRequestDetailDto = z.infer<typeof adminCandidateRequestDetailSchema>;
export type AdminCandidateRequestListResponseDto = z.infer<
  typeof adminCandidateRequestListResponseSchema
>;
export type AdminCandidateRequestDetailResponseDto = z.infer<
  typeof adminCandidateRequestDetailResponseSchema
>;
export type AdminCandidateRequestExportResponseDto = z.infer<
  typeof adminCandidateRequestExportResponseSchema
>;
export type AdminCandidateRequestErasureResponseDto = z.infer<
  typeof adminCandidateRequestErasureResponseSchema
>;
export type AdminCandidateProfileSummaryDto = z.infer<typeof adminCandidateProfileSummarySchema>;
export type AdminCandidateProfileDetailDto = z.infer<typeof adminCandidateProfileDetailSchema>;
export type AdminCandidateProfileDetailResponseDto = z.infer<
  typeof adminCandidateProfileDetailResponseSchema
>;
export type AdminCandidateProfileExportResponseDto = z.infer<
  typeof adminCandidateProfileExportResponseSchema
>;
export type AdminCandidateProfileErasureResponseDto = z.infer<
  typeof adminCandidateProfileErasureResponseSchema
>;
export type AdminCandidateProfileListResponseDto = z.infer<
  typeof adminCandidateProfileListResponseSchema
>;
export type UpdateAdminCandidateProfileDto = z.infer<typeof updateAdminCandidateProfileSchema>;
export type ConvertCandidateRequestDto = z.infer<typeof convertCandidateRequestSchema>;
export type UpdateAdminCandidateRequestDto = z.infer<typeof updateAdminCandidateRequestSchema>;
export type AdminDashboardTaskDto = z.infer<typeof adminDashboardTaskSchema>;
export type AdminDashboardResponseDto = z.infer<typeof adminDashboardResponseSchema>;
export type AdminAuditLogSummaryDto = z.infer<typeof adminAuditLogSummarySchema>;
export type AdminAuditLogListQueryDto = z.infer<typeof adminAuditLogListQuerySchema>;
export type AdminAuditLogListResponseDto = z.infer<typeof adminAuditLogListResponseSchema>;
export type AdminIdentityAccessReviewSummaryDto = z.infer<
  typeof adminIdentityAccessReviewSummarySchema
>;
export type AdminIdentityAccessReviewListResponseDto = z.infer<
  typeof adminIdentityAccessReviewListResponseSchema
>;
export type AdminIdentityAccessReviewDetailResponseDto = z.infer<
  typeof adminIdentityAccessReviewDetailResponseSchema
>;
export type ConfirmIdentityAccessReviewDto = z.infer<typeof confirmIdentityAccessReviewSchema>;
export type RejectIdentityAccessReviewDto = z.infer<typeof rejectIdentityAccessReviewSchema>;
