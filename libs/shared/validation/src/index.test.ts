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
  roleSchema,
  updateOrganizationUnitRequestSchema,
  visibilitySchema
} from "./index.js";

describe("shared validation", () => {
  it("defaults runtime mode to api", () => {
    expect(parseRuntimeMode(undefined)).toBe("api");
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
});
