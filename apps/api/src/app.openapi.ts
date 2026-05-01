export const healthStatusOpenApiSchema = {
  type: "object",
  required: ["app", "runtimeMode", "status"],
  additionalProperties: false,
  properties: {
    app: {
      type: "string",
      enum: ["api"]
    },
    runtimeMode: {
      type: "string",
      enum: ["api", "demo", "test"]
    },
    status: {
      type: "string",
      enum: ["ok"]
    }
  }
};
