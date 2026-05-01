import { describe, expect, it } from "vitest";
import {
  adminOrganizationUnitListResponseSchema,
  attachmentStatusSchema,
  contentStatusSchema,
  createOrganizationUnitRequestSchema,
  membershipStatusSchema,
  myOrganizationUnitsResponseSchema,
  organizationUnitStatusSchema,
  organizationUnitTypeSchema,
  parseRuntimeMode,
  publicHomeQuerySchema,
  publicHomeResponseSchema,
  roleSchema,
  updateOrganizationUnitRequestSchema,
  visibilitySchema
} from "./index.js";

describe("shared validation", () => {
  it("defaults runtime mode to api", () => {
    expect(parseRuntimeMode(undefined)).toBe("api");
  });

  it("rejects demo runtime mode in production", () => {
    expect(parseRuntimeMode("demo", { nodeEnv: "development" })).toBe("demo");
    expect(() => parseRuntimeMode("demo", { nodeEnv: "production" })).toThrow(
      "Demo runtime mode is not allowed in production."
    );
  });

  it("validates visibility values from the shared contract", () => {
    expect(visibilitySchema.parse("BROTHER")).toBe("BROTHER");
  });

  it("validates role values from the shared contract", () => {
    expect(roleSchema.parse("OFFICER")).toBe("OFFICER");
  });

  it("validates content status values from the shared contract", () => {
    expect(contentStatusSchema.parse("PUBLISHED")).toBe("PUBLISHED");
  });

  it("validates attachment status values from the shared contract", () => {
    expect(attachmentStatusSchema.parse("archived")).toBe("archived");
  });

  it("validates organization lifecycle status values from the shared contract", () => {
    expect(organizationUnitTypeSchema.parse("CHORAGIEW")).toBe("CHORAGIEW");
    expect(organizationUnitStatusSchema.parse("active")).toBe("active");
    expect(membershipStatusSchema.parse("inactive")).toBe("inactive");
  });

  it("validates organization-unit API request and response DTOs", () => {
    expect(
      createOrganizationUnitRequestSchema.parse({
        name: " Pilot Organization Unit ",
        city: "Riga",
        country: "LV",
        parish: null
      })
    ).toEqual({
      type: "CHORAGIEW",
      name: "Pilot Organization Unit",
      city: "Riga",
      country: "LV",
      parish: null
    });
    expect(updateOrganizationUnitRequestSchema.parse({ status: "archived" })).toEqual({
      status: "archived"
    });
    expect(() => updateOrganizationUnitRequestSchema.parse({})).toThrow();
    expect(() => createOrganizationUnitRequestSchema.parse({ name: "Missing city" })).toThrow();

    const unit = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "CHORAGIEW",
      parentUnitId: null,
      name: "Pilot Organization Unit",
      city: "Riga",
      country: "LV",
      parish: null,
      publicDescription: null,
      status: "active"
    };

    expect(myOrganizationUnitsResponseSchema.parse({ organizationUnits: [unit] })).toEqual({
      organizationUnits: [unit]
    });
    expect(adminOrganizationUnitListResponseSchema.parse({ organizationUnits: [unit] })).toEqual({
      organizationUnits: [unit]
    });
  });

  it("validates public home query and response DTOs", () => {
    expect(publicHomeQuerySchema.parse({ language: " en " })).toEqual({ language: "en" });
    expect(() => publicHomeQuerySchema.parse({ language: "e" })).toThrow();

    const response = {
      intro: {
        title: "JP2 App",
        body: "Public discovery content is being prepared for approval."
      },
      prayerOfDay: null,
      nextEvents: [],
      ctas: [
        {
          id: "join",
          label: "Join",
          action: "join",
          targetRoute: "JoinRequestForm"
        }
      ]
    };

    expect(publicHomeResponseSchema.parse(response)).toEqual(response);
  });
});
