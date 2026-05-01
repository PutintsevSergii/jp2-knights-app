export const apiErrorOpenApiSchema = {
  type: "object",
  required: ["error"],
  additionalProperties: false,
  properties: {
    error: {
      type: "object",
      required: ["code", "message", "details", "requestId", "timestamp"],
      additionalProperties: false,
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: {
          type: "array",
          items: {}
        },
        requestId: { type: "string" },
        timestamp: { type: "string", format: "date-time" }
      }
    }
  }
};
