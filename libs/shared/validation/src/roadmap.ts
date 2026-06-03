import { z } from "zod";
import {
  contentStatusSchema,
  roadmapAssignmentStatusSchema,
  roadmapSubmissionStatusSchema,
  roadmapTargetRoleSchema,
  sensitiveReviewRetentionBucketSchema
} from "./common.js";

const roadmapTextSchema = z.string().trim().min(1).max(200);
const roadmapBodySchema = z.string().trim().min(1).max(4000);

export const roadmapAttachmentMetadataSchema = z
  .object({
    originalFilename: z.string().trim().min(1).max(240),
    mimeType: z.string().trim().min(1).max(120),
    sizeBytes: z.number().int().min(1).max(10_000_000)
  })
  .strict();

export const roadmapSubmissionSummarySchema = z
  .object({
    id: z.uuid(),
    assignmentId: z.uuid(),
    stepId: z.uuid(),
    status: roadmapSubmissionStatusSchema,
    body: roadmapBodySchema,
    attachmentMetadata: z.array(roadmapAttachmentMetadataSchema).max(5),
    reviewComment: z.string().trim().min(1).max(2000).nullable(),
    reviewedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
  })
  .strict();

export const roadmapStepSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    description: z.string().trim().min(1).max(2000).nullable(),
    requiresSubmission: z.boolean(),
    sortOrder: z.number().int().min(0),
    status: contentStatusSchema,
    latestSubmission: roadmapSubmissionSummarySchema.nullable()
  })
  .strict();

export const roadmapStageSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    sortOrder: z.number().int().min(0),
    steps: z.array(roadmapStepSummarySchema)
  })
  .strict();

export const roadmapDefinitionSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    targetRole: roadmapTargetRoleSchema,
    language: z.string().trim().min(2).max(10),
    status: contentStatusSchema,
    publishedAt: z.iso.datetime().nullable()
  })
  .strict();

export const assignedRoadmapSchema = z
  .object({
    assignmentId: z.uuid(),
    status: roadmapAssignmentStatusSchema,
    assignedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
    organizationUnitId: z.uuid().nullable(),
    definition: roadmapDefinitionSummarySchema,
    stages: z.array(roadmapStageSummarySchema)
  })
  .strict();

export const assignedRoadmapResponseSchema = z
  .object({
    roadmap: assignedRoadmapSchema.nullable()
  })
  .strict();

export const createRoadmapSubmissionRequestSchema = z
  .object({
    stepId: z.uuid(),
    body: roadmapBodySchema,
    attachmentMetadata: z.array(roadmapAttachmentMetadataSchema).max(5).default([])
  })
  .strict();

export const roadmapSubmissionResponseSchema = z
  .object({
    submission: roadmapSubmissionSummarySchema
  })
  .strict();

export const adminRoadmapSubmissionSummarySchema = z
  .object({
    id: z.uuid(),
    assignmentId: z.uuid(),
    stepId: z.uuid(),
    submitterUserId: z.uuid(),
    submitterName: roadmapTextSchema,
    submitterEmail: z.email(),
    roadmapTitle: roadmapTextSchema,
    roadmapTargetRole: roadmapTargetRoleSchema,
    stageTitle: roadmapTextSchema,
    stepTitle: roadmapTextSchema,
    organizationUnitId: z.uuid().nullable(),
    organizationUnitName: roadmapTextSchema.nullable(),
    status: roadmapSubmissionStatusSchema,
    bodyPreview: z.string().trim().min(1).max(200).nullable(),
    attachmentCount: z.number().int().min(0).max(5),
    reviewComment: z.string().trim().min(1).max(2000).nullable(),
    reviewedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
  })
  .strict();

export const adminRoadmapSubmissionDetailSchema = adminRoadmapSubmissionSummarySchema
  .extend({
    body: roadmapBodySchema,
    attachmentMetadata: z.array(roadmapAttachmentMetadataSchema).max(5)
  })
  .strict();

export const adminRoadmapSubmissionExportSchema = adminRoadmapSubmissionDetailSchema
  .extend({
    archivedAt: z.iso.datetime().nullable()
  })
  .strict();

export const adminRoadmapSubmissionListResponseSchema = z
  .object({
    roadmapSubmissions: z.array(adminRoadmapSubmissionSummarySchema)
  })
  .strict();

export const adminRoadmapSubmissionDetailResponseSchema = z
  .object({
    roadmapSubmission: adminRoadmapSubmissionDetailSchema
  })
  .strict();

export const adminRoadmapSubmissionExportResponseSchema = z
  .object({
    roadmapSubmission: adminRoadmapSubmissionExportSchema,
    retentionBucket: sensitiveReviewRetentionBucketSchema,
    exportedAt: z.iso.datetime()
  })
  .strict();

export const adminRoadmapSubmissionErasureResponseSchema = z
  .object({
    roadmapSubmissionId: z.uuid(),
    retentionBucket: sensitiveReviewRetentionBucketSchema,
    erasedAt: z.iso.datetime(),
    archivedAt: z.iso.datetime()
  })
  .strict();

export const adminRoadmapDefinitionStepSchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    description: z.string().trim().min(1).max(2000).nullable(),
    requiresSubmission: z.boolean(),
    sortOrder: z.number().int().min(0),
    status: contentStatusSchema,
    publishedAt: z.iso.datetime().nullable()
  })
  .strict();

export const adminRoadmapDefinitionStageSchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    sortOrder: z.number().int().min(0),
    steps: z.array(adminRoadmapDefinitionStepSchema)
  })
  .strict();

export const adminRoadmapDefinitionSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    targetRole: roadmapTargetRoleSchema,
    language: z.string().trim().min(2).max(10),
    status: contentStatusSchema,
    publishedAt: z.iso.datetime().nullable(),
    stageCount: z.number().int().min(0),
    stepCount: z.number().int().min(0),
    assignmentCount: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    archivedAt: z.iso.datetime().nullable()
  })
  .strict();

export const adminRoadmapDefinitionDetailSchema = adminRoadmapDefinitionSummarySchema
  .extend({
    stages: z.array(adminRoadmapDefinitionStageSchema)
  })
  .strict();

export const adminRoadmapDefinitionListResponseSchema = z
  .object({
    roadmapDefinitions: z.array(adminRoadmapDefinitionSummarySchema)
  })
  .strict();

export const adminRoadmapDefinitionDetailResponseSchema = z
  .object({
    roadmapDefinition: adminRoadmapDefinitionDetailSchema
  })
  .strict();

export const adminRoadmapAssignmentSubmissionSchema = z
  .object({
    id: z.uuid(),
    stepId: z.uuid(),
    stageTitle: roadmapTextSchema,
    stepTitle: roadmapTextSchema,
    status: roadmapSubmissionStatusSchema,
    attachmentCount: z.number().int().min(0).max(5),
    reviewComment: z.string().trim().min(1).max(2000).nullable(),
    reviewedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
  })
  .strict();

export const adminRoadmapAssignmentSummarySchema = z
  .object({
    id: z.uuid(),
    assigneeUserId: z.uuid(),
    assigneeName: roadmapTextSchema,
    assigneeEmail: z.email(),
    roadmapDefinitionId: z.uuid(),
    roadmapTitle: roadmapTextSchema,
    roadmapTargetRole: roadmapTargetRoleSchema,
    roadmapStatus: contentStatusSchema,
    organizationUnitId: z.uuid().nullable(),
    organizationUnitName: roadmapTextSchema.nullable(),
    status: roadmapAssignmentStatusSchema,
    assignedByUserId: z.uuid().nullable(),
    assignedByName: roadmapTextSchema.nullable(),
    assignedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
    submissionCount: z.number().int().min(0),
    pendingSubmissionCount: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    archivedAt: z.iso.datetime().nullable()
  })
  .strict();

export const adminRoadmapAssignmentDetailSchema = adminRoadmapAssignmentSummarySchema
  .extend({
    submissions: z.array(adminRoadmapAssignmentSubmissionSchema)
  })
  .strict();

export const adminRoadmapAssignmentListResponseSchema = z
  .object({
    roadmapAssignments: z.array(adminRoadmapAssignmentSummarySchema)
  })
  .strict();

export const adminRoadmapAssignmentDetailResponseSchema = z
  .object({
    roadmapAssignment: adminRoadmapAssignmentDetailSchema
  })
  .strict();

export const createAdminRoadmapAssignmentRequestSchema = z
  .object({
    assigneeUserId: z.uuid(),
    roadmapDefinitionId: z.uuid(),
    organizationUnitId: z.uuid().nullable().optional()
  })
  .strict();

export const reviewRoadmapSubmissionRequestSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    reviewComment: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict()
  .refine((value) => value.status === "approved" || Boolean(value.reviewComment), {
    message: "Rejected roadmap submissions require a reviewComment.",
    path: ["reviewComment"]
  });

export type RoadmapAttachmentMetadataDto = z.infer<typeof roadmapAttachmentMetadataSchema>;
export type RoadmapSubmissionSummaryDto = z.infer<typeof roadmapSubmissionSummarySchema>;
export type RoadmapStepSummaryDto = z.infer<typeof roadmapStepSummarySchema>;
export type RoadmapStageSummaryDto = z.infer<typeof roadmapStageSummarySchema>;
export type RoadmapDefinitionSummaryDto = z.infer<typeof roadmapDefinitionSummarySchema>;
export type AssignedRoadmapDto = z.infer<typeof assignedRoadmapSchema>;
export type AssignedRoadmapResponseDto = z.infer<typeof assignedRoadmapResponseSchema>;
export type CreateRoadmapSubmissionRequestDto = z.infer<
  typeof createRoadmapSubmissionRequestSchema
>;
export type RoadmapSubmissionResponseDto = z.infer<typeof roadmapSubmissionResponseSchema>;
export type AdminRoadmapSubmissionSummaryDto = z.infer<
  typeof adminRoadmapSubmissionSummarySchema
>;
export type AdminRoadmapSubmissionDetailDto = z.infer<typeof adminRoadmapSubmissionDetailSchema>;
export type AdminRoadmapSubmissionExportDto = z.infer<typeof adminRoadmapSubmissionExportSchema>;
export type AdminRoadmapSubmissionListResponseDto = z.infer<
  typeof adminRoadmapSubmissionListResponseSchema
>;
export type AdminRoadmapSubmissionDetailResponseDto = z.infer<
  typeof adminRoadmapSubmissionDetailResponseSchema
>;
export type AdminRoadmapSubmissionExportResponseDto = z.infer<
  typeof adminRoadmapSubmissionExportResponseSchema
>;
export type AdminRoadmapSubmissionErasureResponseDto = z.infer<
  typeof adminRoadmapSubmissionErasureResponseSchema
>;
export type AdminRoadmapDefinitionStepDto = z.infer<typeof adminRoadmapDefinitionStepSchema>;
export type AdminRoadmapDefinitionStageDto = z.infer<typeof adminRoadmapDefinitionStageSchema>;
export type AdminRoadmapDefinitionSummaryDto = z.infer<
  typeof adminRoadmapDefinitionSummarySchema
>;
export type AdminRoadmapDefinitionDetailDto = z.infer<typeof adminRoadmapDefinitionDetailSchema>;
export type AdminRoadmapDefinitionListResponseDto = z.infer<
  typeof adminRoadmapDefinitionListResponseSchema
>;
export type AdminRoadmapDefinitionDetailResponseDto = z.infer<
  typeof adminRoadmapDefinitionDetailResponseSchema
>;
export type AdminRoadmapAssignmentSubmissionDto = z.infer<
  typeof adminRoadmapAssignmentSubmissionSchema
>;
export type AdminRoadmapAssignmentSummaryDto = z.infer<
  typeof adminRoadmapAssignmentSummarySchema
>;
export type AdminRoadmapAssignmentDetailDto = z.infer<
  typeof adminRoadmapAssignmentDetailSchema
>;
export type AdminRoadmapAssignmentListResponseDto = z.infer<
  typeof adminRoadmapAssignmentListResponseSchema
>;
export type AdminRoadmapAssignmentDetailResponseDto = z.infer<
  typeof adminRoadmapAssignmentDetailResponseSchema
>;
export type CreateAdminRoadmapAssignmentRequestDto = z.infer<
  typeof createAdminRoadmapAssignmentRequestSchema
>;
export type ReviewRoadmapSubmissionRequestDto = z.infer<
  typeof reviewRoadmapSubmissionRequestSchema
>;
