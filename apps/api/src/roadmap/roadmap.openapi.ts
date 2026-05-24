const roadmapAttachmentMetadataOpenApiSchema = {
  type: "object",
  required: ["originalFilename", "mimeType", "sizeBytes"],
  additionalProperties: false,
  properties: {
    originalFilename: { type: "string", minLength: 1, maxLength: 240 },
    mimeType: { type: "string", minLength: 1, maxLength: 120 },
    sizeBytes: { type: "integer", minimum: 1, maximum: 10000000 }
  }
};

const roadmapSubmissionSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "assignmentId",
    "stepId",
    "status",
    "body",
    "attachmentMetadata",
    "reviewComment",
    "reviewedAt",
    "createdAt",
    "updatedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    assignmentId: { type: "string", format: "uuid" },
    stepId: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["pending_review", "approved", "rejected"] },
    body: { type: "string", minLength: 1, maxLength: 4000 },
    attachmentMetadata: {
      type: "array",
      maxItems: 5,
      items: roadmapAttachmentMetadataOpenApiSchema
    },
    reviewComment: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    reviewedAt: { type: "string", nullable: true, format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const adminRoadmapSubmissionSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "assignmentId",
    "stepId",
    "submitterUserId",
    "submitterName",
    "submitterEmail",
    "roadmapTitle",
    "roadmapTargetRole",
    "stageTitle",
    "stepTitle",
    "organizationUnitId",
    "organizationUnitName",
    "status",
    "bodyPreview",
    "attachmentCount",
    "reviewComment",
    "reviewedAt",
    "createdAt",
    "updatedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    assignmentId: { type: "string", format: "uuid" },
    stepId: { type: "string", format: "uuid" },
    submitterUserId: { type: "string", format: "uuid" },
    submitterName: { type: "string", minLength: 1, maxLength: 200 },
    submitterEmail: { type: "string", format: "email" },
    roadmapTitle: { type: "string", minLength: 1, maxLength: 200 },
    roadmapTargetRole: { type: "string", enum: ["CANDIDATE", "BROTHER"] },
    stageTitle: { type: "string", minLength: 1, maxLength: 200 },
    stepTitle: { type: "string", minLength: 1, maxLength: 200 },
    organizationUnitId: { type: "string", nullable: true, format: "uuid" },
    organizationUnitName: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    status: { type: "string", enum: ["pending_review", "approved", "rejected"] },
    bodyPreview: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    attachmentCount: { type: "integer", minimum: 0, maximum: 5 },
    reviewComment: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    reviewedAt: { type: "string", nullable: true, format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const adminRoadmapSubmissionDetailOpenApiSchema = {
  ...adminRoadmapSubmissionSummaryOpenApiSchema,
  required: [
    ...adminRoadmapSubmissionSummaryOpenApiSchema.required,
    "body",
    "attachmentMetadata"
  ],
  properties: {
    ...adminRoadmapSubmissionSummaryOpenApiSchema.properties,
    body: { type: "string", minLength: 1, maxLength: 4000 },
    attachmentMetadata: {
      type: "array",
      maxItems: 5,
      items: roadmapAttachmentMetadataOpenApiSchema
    }
  }
};

export const createRoadmapSubmissionRequestOpenApiSchema = {
  type: "object",
  required: ["stepId", "body"],
  additionalProperties: false,
  properties: {
    stepId: { type: "string", format: "uuid" },
    body: { type: "string", minLength: 1, maxLength: 4000 },
    attachmentMetadata: {
      type: "array",
      maxItems: 5,
      items: roadmapAttachmentMetadataOpenApiSchema,
      default: []
    }
  }
};

export const roadmapSubmissionResponseOpenApiSchema = {
  type: "object",
  required: ["submission"],
  additionalProperties: false,
  properties: {
    submission: roadmapSubmissionSummaryOpenApiSchema
  }
};

export const adminRoadmapSubmissionListResponseOpenApiSchema = {
  type: "object",
  required: ["roadmapSubmissions"],
  additionalProperties: false,
  properties: {
    roadmapSubmissions: {
      type: "array",
      items: adminRoadmapSubmissionSummaryOpenApiSchema
    }
  }
};

export const adminRoadmapSubmissionDetailResponseOpenApiSchema = {
  type: "object",
  required: ["roadmapSubmission"],
  additionalProperties: false,
  properties: {
    roadmapSubmission: adminRoadmapSubmissionDetailOpenApiSchema
  }
};

export const reviewRoadmapSubmissionRequestOpenApiSchema = {
  type: "object",
  required: ["status"],
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["approved", "rejected"] },
    reviewComment: { type: "string", nullable: true, minLength: 1, maxLength: 2000 }
  }
};

const roadmapStepSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "description",
    "requiresSubmission",
    "sortOrder",
    "status",
    "latestSubmission"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    requiresSubmission: { type: "boolean" },
    sortOrder: { type: "integer", minimum: 0 },
    status: { type: "string", enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] },
    latestSubmission: {
      nullable: true,
      oneOf: [roadmapSubmissionSummaryOpenApiSchema]
    }
  }
};

const roadmapStageSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "sortOrder", "steps"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    sortOrder: { type: "integer", minimum: 0 },
    steps: {
      type: "array",
      items: roadmapStepSummaryOpenApiSchema
    }
  }
};

const assignedRoadmapOpenApiSchema = {
  type: "object",
  required: [
    "assignmentId",
    "status",
    "assignedAt",
    "completedAt",
    "organizationUnitId",
    "definition",
    "stages"
  ],
  additionalProperties: false,
  properties: {
    assignmentId: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["active", "completed", "archived"] },
    assignedAt: { type: "string", format: "date-time" },
    completedAt: { type: "string", nullable: true, format: "date-time" },
    organizationUnitId: { type: "string", nullable: true, format: "uuid" },
    definition: {
      type: "object",
      required: ["id", "title", "targetRole", "language", "status", "publishedAt"],
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid" },
        title: { type: "string", minLength: 1, maxLength: 200 },
        targetRole: { type: "string", enum: ["CANDIDATE", "BROTHER"] },
        language: { type: "string", minLength: 2, maxLength: 10 },
        status: { type: "string", enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] },
        publishedAt: { type: "string", nullable: true, format: "date-time" }
      }
    },
    stages: {
      type: "array",
      items: roadmapStageSummaryOpenApiSchema
    }
  }
};

export const assignedRoadmapResponseOpenApiSchema = {
  type: "object",
  required: ["roadmap"],
  additionalProperties: false,
  properties: {
    roadmap: {
      nullable: true,
      oneOf: [assignedRoadmapOpenApiSchema]
    }
  }
};
