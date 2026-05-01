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
