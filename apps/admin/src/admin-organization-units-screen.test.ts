import { describe, expect, it } from "vitest";
import { fallbackAdminOrganizationUnits } from "./admin-content-fixtures.js";
import {
  buildAdminOrganizationUnitEditorScreen,
  buildAdminOrganizationUnitListScreen
} from "./admin-organization-units-screen.js";

describe("admin organization-unit screen model", () => {
  it("maps organization-unit DTOs into scoped rows and Super Admin actions", () => {
    const screen = buildAdminOrganizationUnitListScreen({
      state: "ready",
      response: fallbackAdminOrganizationUnits,
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminOrganizationUnitList",
      state: "ready",
      title: "Organization Units"
    });
    expect(screen.rows[0]).toMatchObject({
      title: "Pilot Organization Unit",
      primaryMeta: "CHORAGIEW / Riga, LV",
      status: "active",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual(["edit", "archive"]);
  });

  it("keeps officer/demo and failure states read-only", () => {
    expect(
      buildAdminOrganizationUnitListScreen({
        state: "ready",
        response: fallbackAdminOrganizationUnits,
        runtimeMode: "demo",
        canWrite: false
      })
    ).toMatchObject({
      demoChromeVisible: true,
      actions: [{ id: "refresh" }],
      rows: [{ actions: [] }]
    });

    expect(
      buildAdminOrganizationUnitListScreen({
        state: "forbidden",
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      title: "Access Denied",
      actions: [],
      rows: []
    });
  });

  it("builds create, edit, and readonly form models", () => {
    const createScreen = buildAdminOrganizationUnitEditorScreen({
      state: "ready",
      runtimeMode: "api",
      canWrite: true,
      mode: "create"
    });
    expect(createScreen).toMatchObject({
      route: "AdminOrganizationUnitEditor",
      mode: "create",
      organizationUnitId: null
    });
    expect(createScreen.fields.find((field) => field.name === "type")).toMatchObject({
      value: "CHORAGIEW",
      readOnly: false
    });
    expect(createScreen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);

    const editScreen = buildAdminOrganizationUnitEditorScreen({
      state: "ready",
      organizationUnit: fallbackAdminOrganizationUnits.organizationUnits[0],
      runtimeMode: "api",
      canWrite: true,
      mode: "edit"
    });
    expect(editScreen).toMatchObject({
      mode: "edit",
      organizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(editScreen.actions.map((action) => action.id)).toEqual(["edit", "refresh", "archive"]);

    const readonlyScreen = buildAdminOrganizationUnitEditorScreen({
      state: "ready",
      organizationUnit: fallbackAdminOrganizationUnits.organizationUnits[0],
      runtimeMode: "api",
      canWrite: false,
      mode: "edit"
    });
    expect(readonlyScreen.mode).toBe("readonly");
    expect(readonlyScreen.fields.every((field) => field.readOnly)).toBe(true);
  });
});
