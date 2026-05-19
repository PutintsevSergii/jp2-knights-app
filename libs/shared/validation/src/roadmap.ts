import { z } from "zod";
import {
  contentStatusSchema,
  roadmapAssignmentStatusSchema,
  roadmapSubmissionStatusSchema,
  roadmapTargetRoleSchema
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
export type ReviewRoadmapSubmissionRequestDto = z.infer<
  typeof reviewRoadmapSubmissionRequestSchema
>;
