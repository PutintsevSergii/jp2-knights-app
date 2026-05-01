const organizationUnitTypeOpenApiSchema = {
  type: "string",
  enum: ["ORDER", "PROVINCE", "COMMANDERY", "CHORAGIEW", "OTHER"]
};

const organizationUnitStatusOpenApiSchema = {
  type: "string",
  enum: ["active", "archived"]
};

export const organizationUnitSummaryOpenApiSchema = {
  type: "object",
  required: [
    "id",
    "type",
    "parentUnitId",
    "name",
    "city",
    "country",
    "parish",
    "publicDescription",
    "status"
  ],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    type: organizationUnitTypeOpenApiSchema,
    parentUnitId: { type: "string", nullable: true, format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 200 },
    city: { type: "string", minLength: 1, maxLength: 200 },
    country: { type: "string", minLength: 1, maxLength: 200 },
    parish: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    publicDescription: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    status: organizationUnitStatusOpenApiSchema
  }
};

export const myOrganizationUnitsResponseOpenApiSchema = {
  type: "object",
  required: ["organizationUnits"],
  additionalProperties: false,
  properties: {
    organizationUnits: {
      type: "array",
      items: organizationUnitSummaryOpenApiSchema
    }
  }
};

export const adminOrganizationUnitListResponseOpenApiSchema = {
  type: "object",
  required: ["organizationUnits"],
  additionalProperties: false,
  properties: {
    organizationUnits: {
      type: "array",
      items: organizationUnitSummaryOpenApiSchema
    }
  }
};

export const createOrganizationUnitRequestOpenApiSchema = {
  type: "object",
  required: ["name", "city", "country"],
  additionalProperties: false,
  properties: {
    type: organizationUnitTypeOpenApiSchema,
    parentUnitId: { type: "string", nullable: true, format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 200 },
    city: { type: "string", minLength: 1, maxLength: 200 },
    country: { type: "string", minLength: 1, maxLength: 200 },
    parish: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    publicDescription: { type: "string", nullable: true, minLength: 1, maxLength: 2000 }
  }
};

export const updateOrganizationUnitRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    type: organizationUnitTypeOpenApiSchema,
    parentUnitId: { type: "string", nullable: true, format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 200 },
    city: { type: "string", minLength: 1, maxLength: 200 },
    country: { type: "string", minLength: 1, maxLength: 200 },
    parish: { type: "string", nullable: true, minLength: 1, maxLength: 200 },
    publicDescription: { type: "string", nullable: true, minLength: 1, maxLength: 2000 },
    status: organizationUnitStatusOpenApiSchema
  }
};

export const organizationUnitDetailResponseOpenApiSchema = {
  type: "object",
  required: ["organizationUnit"],
  additionalProperties: false,
  properties: {
    organizationUnit: organizationUnitSummaryOpenApiSchema
  }
};
