import { organizationUnitSummaryOpenApiSchema } from "../organization/organization.openapi.js";

const brotherPaginationOpenApiSchema = {
  type: "object",
  required: ["limit", "offset"],
  additionalProperties: false,
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 50 },
    offset: { type: "integer", minimum: 0, maximum: 1000 }
  }
};

const brotherMembershipSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "currentDegree", "joinedAt", "organizationUnit"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    currentDegree: { type: "string", nullable: true, minLength: 1, maxLength: 120 },
    joinedAt: { type: "string", nullable: true, format: "date" },
    organizationUnit: organizationUnitSummaryOpenApiSchema
  }
};

const brotherTodayEventSummaryOpenApiSchema = {
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
      enum: ["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]
    }
  }
};

export const brotherEventListResponseOpenApiSchema = {
  type: "object",
  required: ["events", "pagination"],
  additionalProperties: false,
  properties: {
    events: {
      type: "array",
      items: brotherTodayEventSummaryOpenApiSchema
    },
    pagination: brotherPaginationOpenApiSchema
  }
};

const brotherTodayCardOpenApiSchema = {
  type: "object",
  required: ["id", "label", "body", "targetRoute", "priority"],
  additionalProperties: false,
  properties: {
    id: { type: "string", minLength: 1, maxLength: 80 },
    label: { type: "string", minLength: 1, maxLength: 120 },
    body: { type: "string", minLength: 1, maxLength: 1000 },
    targetRoute: {
      type: "string",
      enum: [
        "BrotherProfile",
        "MyOrganizationUnits",
        "BrotherEvents",
        "BrotherPrayers",
        "SilentPrayer"
      ]
    },
    priority: { type: "string", enum: ["normal", "attention"] }
  }
};

const brotherPrayerCategorySummaryOpenApiSchema = {
  type: "object",
  required: ["id", "slug", "title", "language"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string", minLength: 1, maxLength: 120 },
    title: { type: "string", minLength: 1, maxLength: 200 },
    language: { type: "string", minLength: 2, maxLength: 10 }
  }
};

const brotherPrayerSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "excerpt",
    "language",
    "visibility",
    "targetOrganizationUnitId",
    "category"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    excerpt: { type: "string", minLength: 1, maxLength: 240 },
    language: { type: "string", minLength: 2, maxLength: 10 },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]
    },
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" },
    category: {
      nullable: true,
      oneOf: [brotherPrayerCategorySummaryOpenApiSchema]
    }
  }
};

export const brotherProfileResponseOpenApiSchema = {
  type: "object",
  required: ["profile"],
  additionalProperties: false,
  properties: {
    profile: {
      type: "object",
      required: [
        "id",
        "displayName",
        "email",
        "phone",
        "preferredLanguage",
        "status",
        "roles",
        "memberships"
      ],
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid" },
        displayName: { type: "string", minLength: 1, maxLength: 200 },
        email: { type: "string", format: "email", maxLength: 320 },
        phone: { type: "string", nullable: true, minLength: 1, maxLength: 40 },
        preferredLanguage: { type: "string", nullable: true, minLength: 2, maxLength: 10 },
        status: { type: "string", enum: ["active"] },
        roles: {
          type: "array",
          items: { type: "string", enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"] }
        },
        memberships: {
          type: "array",
          minItems: 1,
          items: brotherMembershipSummaryOpenApiSchema
        }
      }
    }
  }
};

export const brotherTodayResponseOpenApiSchema = {
  type: "object",
  required: ["profileSummary", "cards", "upcomingEvents", "organizationUnits"],
  additionalProperties: false,
  properties: {
    profileSummary: {
      type: "object",
      required: ["displayName", "currentDegree", "organizationUnitName"],
      additionalProperties: false,
      properties: {
        displayName: { type: "string", minLength: 1, maxLength: 200 },
        currentDegree: { type: "string", nullable: true, minLength: 1, maxLength: 120 },
        organizationUnitName: { type: "string", nullable: true, minLength: 1, maxLength: 200 }
      }
    },
    cards: {
      type: "array",
      minItems: 1,
      items: brotherTodayCardOpenApiSchema
    },
    upcomingEvents: {
      type: "array",
      items: brotherTodayEventSummaryOpenApiSchema
    },
    organizationUnits: {
      type: "array",
      minItems: 1,
      items: organizationUnitSummaryOpenApiSchema
    }
  }
};

export const brotherPrayerListResponseOpenApiSchema = {
  type: "object",
  required: ["categories", "prayers", "pagination"],
  additionalProperties: false,
  properties: {
    categories: {
      type: "array",
      items: brotherPrayerCategorySummaryOpenApiSchema
    },
    prayers: {
      type: "array",
      items: brotherPrayerSummaryOpenApiSchema
    },
    pagination: brotherPaginationOpenApiSchema
  }
};
