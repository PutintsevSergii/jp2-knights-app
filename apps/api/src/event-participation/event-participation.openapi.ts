export const eventParticipationResponseOpenApiSchema = {
  type: "object",
  required: ["participation"],
  additionalProperties: false,
  properties: {
    participation: {
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
    }
  }
};
