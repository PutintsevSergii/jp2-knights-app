const candidateDashboardOrganizationUnitOpenApiSchema = {
  type: "object",
  required: ["id", "name", "city", "country", "parish"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 200 },
    city: { type: "string", minLength: 1, maxLength: 200 },
    country: { type: "string", minLength: 1, maxLength: 200 },
    parish: { type: "string", nullable: true, minLength: 1, maxLength: 200 }
  }
};

const candidateDashboardOfficerOpenApiSchema = {
  type: "object",
  required: ["id", "displayName", "email", "phone"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    displayName: { type: "string", minLength: 1, maxLength: 200 },
    email: { type: "string", format: "email", maxLength: 320 },
    phone: { type: "string", nullable: true, minLength: 1, maxLength: 40 }
  }
};

const candidateDashboardEventSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "type", "startAt", "endAt", "locationLabel", "visibility"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    type: { type: "string", minLength: 1, maxLength: 80 },
    startAt: { type: "string", format: "date-time" },
    endAt: { type: "string", nullable: true, format: "date-time" },
    locationLabel: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "ORGANIZATION_UNIT"]
    }
  }
};

const candidatePaginationOpenApiSchema = {
  type: "object",
  required: ["limit", "offset"],
  additionalProperties: false,
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 50 },
    offset: { type: "integer", minimum: 0, maximum: 1000 }
  }
};

const ownEventParticipationOpenApiSchema = {
  type: "object",
  required: ["id", "eventId", "intentStatus", "createdAt", "cancelledAt"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    eventId: { type: "string", format: "uuid" },
    intentStatus: {
      type: "string",
      enum: ["planning_to_attend", "cancelled"]
    },
    createdAt: { type: "string", format: "date-time" },
    cancelledAt: { type: "string", nullable: true, format: "date-time" }
  }
};

export const candidateEventListResponseOpenApiSchema = {
  type: "object",
  required: ["events", "pagination"],
  additionalProperties: false,
  properties: {
    events: {
      type: "array",
      items: candidateDashboardEventSummaryOpenApiSchema
    },
    pagination: candidatePaginationOpenApiSchema
  }
};

export const candidateEventDetailResponseOpenApiSchema = {
  type: "object",
  required: ["event"],
  additionalProperties: false,
  properties: {
    event: {
      type: "object",
      required: [
        "id",
        "title",
        "type",
        "startAt",
        "endAt",
        "locationLabel",
        "visibility",
        "description",
        "currentUserParticipation"
      ],
      additionalProperties: false,
      properties: {
        ...candidateDashboardEventSummaryOpenApiSchema.properties,
        description: { type: "string", nullable: true, minLength: 1, maxLength: 8000 },
        currentUserParticipation: {
          nullable: true,
          oneOf: [ownEventParticipationOpenApiSchema]
        }
      }
    }
  }
};

const candidateAnnouncementSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "body",
    "visibility",
    "targetOrganizationUnitId",
    "pinned",
    "publishedAt"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 2000 },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "ORGANIZATION_UNIT"]
    },
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    pinned: { type: "boolean" },
    publishedAt: { type: "string", format: "date-time" }
  }
};

export const candidateAnnouncementListResponseOpenApiSchema = {
  type: "object",
  required: ["announcements", "pagination"],
  additionalProperties: false,
  properties: {
    announcements: {
      type: "array",
      items: candidateAnnouncementSummaryOpenApiSchema
    },
    pagination: candidatePaginationOpenApiSchema
  }
};

const candidateDashboardAnnouncementSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "body", "publishedAt"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    body: { type: "string", minLength: 1, maxLength: 2000 },
    publishedAt: { type: "string", format: "date-time" }
  }
};

export const candidateDashboardResponseOpenApiSchema = {
  type: "object",
  required: ["profile", "nextStep", "upcomingEvents", "announcements"],
  additionalProperties: false,
  properties: {
    profile: {
      type: "object",
      required: [
        "id",
        "userId",
        "displayName",
        "email",
        "preferredLanguage",
        "status",
        "assignedOrganizationUnit",
        "responsibleOfficer"
      ],
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid" },
        userId: { type: "string", format: "uuid" },
        displayName: { type: "string", minLength: 1, maxLength: 200 },
        email: { type: "string", format: "email", maxLength: 320 },
        preferredLanguage: { type: "string", nullable: true, minLength: 2, maxLength: 10 },
        status: { type: "string", enum: ["active"] },
        assignedOrganizationUnit: {
          nullable: true,
          oneOf: [candidateDashboardOrganizationUnitOpenApiSchema]
        },
        responsibleOfficer: {
          nullable: true,
          oneOf: [candidateDashboardOfficerOpenApiSchema]
        }
      }
    },
    nextStep: {
      type: "object",
      required: ["id", "label", "body", "targetRoute", "priority"],
      additionalProperties: false,
      properties: {
        id: { type: "string", minLength: 1, maxLength: 80 },
        label: { type: "string", minLength: 1, maxLength: 120 },
        body: { type: "string", minLength: 1, maxLength: 1000 },
        targetRoute: {
          type: "string",
          enum: ["CandidateContact", "CandidateRoadmap", "CandidateEvents"]
        },
        priority: { type: "string", enum: ["normal", "attention"] }
      }
    },
    upcomingEvents: {
      type: "array",
      items: candidateDashboardEventSummaryOpenApiSchema
    },
    announcements: {
      type: "array",
      items: candidateDashboardAnnouncementSummaryOpenApiSchema
    }
  }
};
