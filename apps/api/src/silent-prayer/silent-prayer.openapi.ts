const silentPrayerPaginationOpenApiSchema = {
  type: "object",
  required: ["limit", "offset"],
  additionalProperties: false,
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 50 },
    offset: { type: "integer", minimum: 0, maximum: 1000 }
  }
};

const silentPrayerPresenceOpenApiSchema = {
  type: "object",
  required: ["eventId", "activeCount", "expiresAt", "socketRoom"],
  additionalProperties: false,
  properties: {
    eventId: { type: "string", format: "uuid" },
    activeCount: { type: "integer", minimum: 0 },
    expiresAt: { type: "string", format: "date-time" },
    socketRoom: { type: "string", minLength: 1, maxLength: 240 }
  }
};

const silentPrayerAggregatePresenceOpenApiSchema = {
  type: "object",
  required: ["activeCount", "expiresAt"],
  additionalProperties: false,
  properties: {
    activeCount: { type: "integer", minimum: 0 },
    expiresAt: { type: "string", format: "date-time" }
  }
};

const publicSilentPrayerEventSummaryOpenApiSchema = {
  type: "object",
  required: ["id", "title", "intention", "startsAt", "endsAt", "visibility", "activeCount"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1, maxLength: 200 },
    intention: { type: "string", nullable: true, minLength: 1, maxLength: 1000 },
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", nullable: true, format: "date-time" },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN"]
    },
    activeCount: { type: "integer", minimum: 0 }
  }
};

const brotherSilentPrayerEventSummaryOpenApiSchema = {
  ...publicSilentPrayerEventSummaryOpenApiSchema,
  required: [
    "id",
    "title",
    "intention",
    "startsAt",
    "endsAt",
    "visibility",
    "activeCount",
    "targetOrganizationUnitId"
  ],
  properties: {
    ...publicSilentPrayerEventSummaryOpenApiSchema.properties,
    visibility: {
      type: "string",
      enum: ["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]
    },
    targetOrganizationUnitId: { type: "string", nullable: true, format: "uuid" }
  }
};

export const publicSilentPrayerJoinRequestOpenApiSchema = {
  type: "object",
  required: ["anonymousSessionId"],
  additionalProperties: false,
  properties: {
    anonymousSessionId: { type: "string", minLength: 1, maxLength: 120 }
  }
};

export const publicSilentPrayerPresenceRequestOpenApiSchema = {
  type: "object",
  required: ["anonymousSessionId"],
  additionalProperties: false,
  properties: {
    anonymousSessionId: { type: "string", minLength: 1, maxLength: 120 },
    eventId: { type: "string", format: "uuid" }
  }
};

export const silentPrayerEventPresenceRequestOpenApiSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    eventId: { type: "string", format: "uuid" }
  }
};

export const publicSilentPrayerListResponseOpenApiSchema = {
  type: "object",
  required: ["sessions", "pagination"],
  additionalProperties: false,
  properties: {
    sessions: {
      type: "array",
      items: publicSilentPrayerEventSummaryOpenApiSchema
    },
    pagination: silentPrayerPaginationOpenApiSchema
  }
};

export const brotherSilentPrayerListResponseOpenApiSchema = {
  type: "object",
  required: ["sessions", "pagination"],
  additionalProperties: false,
  properties: {
    sessions: {
      type: "array",
      items: brotherSilentPrayerEventSummaryOpenApiSchema
    },
    pagination: silentPrayerPaginationOpenApiSchema
  }
};

export const publicSilentPrayerJoinResponseOpenApiSchema = {
  type: "object",
  required: ["session", "presence"],
  additionalProperties: false,
  properties: {
    session: publicSilentPrayerEventSummaryOpenApiSchema,
    presence: silentPrayerPresenceOpenApiSchema
  }
};

export const brotherSilentPrayerJoinResponseOpenApiSchema = {
  type: "object",
  required: ["session", "presence"],
  additionalProperties: false,
  properties: {
    session: brotherSilentPrayerEventSummaryOpenApiSchema,
    presence: silentPrayerPresenceOpenApiSchema
  }
};

export const silentPrayerPresenceActionResponseOpenApiSchema = {
  type: "object",
  required: ["presence"],
  additionalProperties: false,
  properties: {
    presence: silentPrayerAggregatePresenceOpenApiSchema
  }
};
