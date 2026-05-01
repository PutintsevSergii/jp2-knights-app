import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { OrganizationController } from "./organization.controller.js";
import type { OrganizationService } from "./organization.service.js";
import type {
  CreateOrganizationUnitRequest,
  OrganizationUnitSummary,
  UpdateOrganizationUnitRequest
} from "./organization.types.js";

const organizationUnit: OrganizationUnitSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW",
  parentUnitId: null,
  name: "Pilot Organization Unit",
  city: "Riga",
  country: "LV",
  parish: null,
  publicDescription: "Pilot",
  status: "active"
};

const principal = {
  id: "brother_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active" as const,
  roles: ["BROTHER" as const]
};

describe("OrganizationController", () => {
  it("delegates brother organization-unit reads using the guard-attached principal", async () => {
    const controller = new OrganizationController({
      getMyOrganizationUnits: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ organizationUnits: [organizationUnit] });
      }
    } as unknown as OrganizationService);

    await expect(controller.getMyOrganizationUnits({ principal })).resolves.toEqual({
      organizationUnits: [organizationUnit]
    });
  });

  it("delegates admin organization-unit listing using the guard-attached principal", async () => {
    const controller = new OrganizationController({
      listAdminOrganizationUnits: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ organizationUnits: [organizationUnit] });
      }
    } as unknown as OrganizationService);

    await expect(controller.listAdminOrganizationUnits({ principal })).resolves.toEqual({
      organizationUnits: [organizationUnit]
    });
  });

  it("delegates admin organization-unit create and update commands", async () => {
    const controller = new OrganizationController({
      createAdminOrganizationUnit: (
        receivedPrincipal: CurrentUserPrincipal,
        body: CreateOrganizationUnitRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body).toEqual({ type: "CHORAGIEW", name: "New", city: "Riga", country: "LV" });
        return Promise.resolve({ organizationUnit });
      },
      updateAdminOrganizationUnit: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateOrganizationUnitRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(organizationUnit.id);
        expect(body).toEqual({ status: "archived" });
        return Promise.resolve({ organizationUnit: { ...organizationUnit, status: "archived" } });
      }
    } as unknown as OrganizationService);

    await expect(
      controller.createAdminOrganizationUnit(
        { principal },
        {
          type: "CHORAGIEW",
          name: "New",
          city: "Riga",
          country: "LV"
        }
      )
    ).resolves.toEqual({ organizationUnit });
    await expect(
      controller.updateAdminOrganizationUnit(
        { principal },
        organizationUnit.id,
        {
          status: "archived"
        }
      )
    ).resolves.toEqual({ organizationUnit: { ...organizationUnit, status: "archived" } });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new OrganizationController({} as OrganizationService);

    expect(() => controller.getMyOrganizationUnits({})).toThrow("CurrentUserGuard");
    expect(() => controller.listAdminOrganizationUnits({})).toThrow("CurrentUserGuard");
    expect(() =>
      controller.createAdminOrganizationUnit(
        {},
        {
          type: "CHORAGIEW",
          name: "Blocked",
          city: "Riga",
          country: "LV"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() => controller.updateAdminOrganizationUnit({}, organizationUnit.id, {})).toThrow(
      "CurrentUserGuard"
    );
  });
});
