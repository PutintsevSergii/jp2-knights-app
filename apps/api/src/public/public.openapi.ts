const publicHomeCtaOpenApiSchema = {
  type: "object",
  required: ["id", "label", "action", "targetRoute"],
  additionalProperties: false,
  properties: {
    id: { type: "string", minLength: 1, maxLength: 50 },
    label: { type: "string", minLength: 1, maxLength: 80 },
    action: {
      type: "string",
      enum: ["learn", "pray", "events", "join", "login"]
    },
    targetRoute: { type: "string", minLength: 1, maxLength: 80 }
  }
};

const publicHomeEventSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "startAt", "locationLabel", "visibility"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    startAt: { type: "string", format: "date-time" },
    locationLabel: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN"]
    }
  }
};

export const publicHomeResponseOpenApiSchema = {
  type: "object",
  required: ["intro", "prayerOfDay", "nextEvents", "ctas"],
  additionalProperties: false,
  properties: {
    intro: {
      type: "object",
      required: ["title", "body"],
      additionalProperties: false,
      properties: {
        title: { type: "string", minLength: 1, maxLength: 120 },
        body: { type: "string", minLength: 1, maxLength: 1000 }
      }
    },
    prayerOfDay: {
      nullable: true,
      oneOf: [
        {
          type: "object",
          required: ["title", "body"],
          additionalProperties: false,
          properties: {
            title: { type: "string", minLength: 1, maxLength: 200 },
            body: { type: "string", minLength: 1, maxLength: 4000 }
          }
        }
      ]
    },
    nextEvents: {
      type: "array",
      items: publicHomeEventSummaryOpenApiSchema
    },
    ctas: {
      type: "array",
      minItems: 1,
      items: publicHomeCtaOpenApiSchema
    }
  }
};

export const publicContentPageResponseOpenApiSchema = {
  type: "object",
  required: ["page"],
  additionalProperties: false,
  properties: {
    page: {
      type: "object",
      required: ["id", "slug", "title", "body", "language"],
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid" },
        slug: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        title: { type: "string", minLength: 1, maxLength: 200 },
        body: { type: "string", minLength: 1, maxLength: 12000 },
        language: { type: "string", minLength: 2, maxLength: 10 }
      }
    }
  }
};

const publicPaginationOpenApiSchema = {
  type: "object",
  required: ["limit", "offset"],
  additionalProperties: false,
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 50 },
    offset: { type: "integer", minimum: 0, maximum: 1000 }
  }
};

const publicPrayerCategorySummaryOpenApiSchema = {
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

const publicPrayerSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "excerpt", "language", "category"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    excerpt: { type: "string", minLength: 1, maxLength: 240 },
    language: { type: "string", minLength: 2, maxLength: 10 },
    category: {
      nullable: true,
      oneOf: [publicPrayerCategorySummaryOpenApiSchema]
    }
  }
};

export const publicPrayerListResponseOpenApiSchema = {
  type: "object",
  required: ["categories", "prayers", "pagination"],
  additionalProperties: false,
  properties: {
    categories: {
      type: "array",
      items: publicPrayerCategorySummaryOpenApiSchema
    },
    prayers: {
      type: "array",
      items: publicPrayerSummaryOpenApiSchema
    },
    pagination: publicPaginationOpenApiSchema
  }
};

export const publicPrayerDetailResponseOpenApiSchema = {
  type: "object",
  required: ["prayer"],
  additionalProperties: false,
  properties: {
    prayer: {
      ...publicPrayerSummaryOpenApiSchema,
      required: ["id", "title", "excerpt", "language", "category", "body"],
      properties: {
        ...publicPrayerSummaryOpenApiSchema.properties,
        body: { type: "string", minLength: 1, maxLength: 8000 }
      }
    }
  }
};

const publicEventSummaryOpenApiSchema = {
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
      enum: ["PUBLIC", "FAMILY_OPEN"]
    }
  }
};

export const publicEventListResponseOpenApiSchema = {
  type: "object",
  required: ["events", "pagination"],
  additionalProperties: false,
  properties: {
    events: {
      type: "array",
      items: publicEventSummaryOpenApiSchema
    },
    pagination: publicPaginationOpenApiSchema
  }
};

export const publicEventDetailResponseOpenApiSchema = {
  type: "object",
  required: ["event"],
  additionalProperties: false,
  properties: {
    event: {
      ...publicEventSummaryOpenApiSchema,
      required: [
        "id",
        "title",
        "type",
        "startAt",
        "endAt",
        "locationLabel",
        "visibility",
        "description"
      ],
      properties: {
        ...publicEventSummaryOpenApiSchema.properties,
        description: { type: "string", nullable: true, minLength: 1, maxLength: 8000 }
      }
    }
  }
};

export const createPublicCandidateRequestOpenApiSchema = {
  type: "object",
  required: [
    "firstName",
    "lastName",
    "email",
    "country",
    "city",
    "consentAccepted",
    "consentTextVersion"
  ],
  additionalProperties: false,
  properties: {
    firstName: { type: "string", minLength: 1, maxLength: 120 },
    lastName: { type: "string", minLength: 1, maxLength: 120 },
    email: { type: "string", format: "email", maxLength: 320 },
    phone: { type: "string", nullable: true, minLength: 1, maxLength: 40 },
    country: { type: "string", minLength: 1, maxLength: 120 },
    city: { type: "string", minLength: 1, maxLength: 120 },
    preferredLanguage: { type: "string", nullable: true, minLength: 2, maxLength: 10 },
    message: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    consentAccepted: { type: "boolean", const: true },
    consentTextVersion: { type: "string", minLength: 1, maxLength: 120 },
    idempotencyKey: { type: "string", minLength: 1, maxLength: 120 }
  }
};

export const publicCandidateRequestResponseOpenApiSchema = {
  type: "object",
  required: ["request"],
  additionalProperties: false,
  properties: {
    request: {
      type: "object",
      required: ["id", "status"],
      additionalProperties: false,
      properties: {
        id: { type: "string", format: "uuid" },
        status: { type: "string", enum: ["new"] }
      }
    }
  }
};
