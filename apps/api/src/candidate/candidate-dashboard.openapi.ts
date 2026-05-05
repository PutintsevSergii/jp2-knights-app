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
