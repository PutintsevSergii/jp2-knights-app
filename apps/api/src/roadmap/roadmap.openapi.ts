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
      items: {
        type: "object",
        required: ["originalFilename", "mimeType", "sizeBytes"],
        additionalProperties: false,
        properties: {
          originalFilename: { type: "string", minLength: 1, maxLength: 240 },
          mimeType: { type: "string", minLength: 1, maxLength: 120 },
          sizeBytes: { type: "integer", minimum: 1, maximum: 10000000 }
        }
      }
    },
    reviewComment: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    reviewedAt: { type: "string", nullable: true, format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
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
