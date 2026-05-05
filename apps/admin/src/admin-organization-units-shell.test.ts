import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminOrganizationUnits } from "./admin-content-fixtures.js";
import {
  adminOrganizationUnitShellRoutes,
  renderAdminOrganizationUnitRoute
} from "./admin-organization-units-shell.js";

describe("admin organization-unit shell route", () => {
  it("exposes the organization-unit shell route", () => {
    expect(adminOrganizationUnitShellRoutes).toEqual([
      {
        path: "/admin/organization-units",
        label: "Organization Units",
        screenRoute: "AdminOrganizationUnitList"
      }
    ]);
  });

  it("renders API organization units through the full HTML document shell", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    const rendered = await renderAdminOrganizationUnitRoute({
      path: "/admin/organization-units",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/organization-units",
      route: "AdminOrganizationUnitList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<!doctype html>");
    expect(rendered.document).toContain("<title>Admin Organization Units</title>");
    expect(rendered.document).toContain("Pilot Organization Unit");
    expect(rendered.document).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo organization units without backend fetch and maps failures", async () => {
    const fetchImpl = vi.fn();

    await expect(
      renderAdminOrganizationUnitRoute({
        path: "/admin/organization-units",
        runtimeMode: "demo",
        canWrite: false,
        fetchImpl
      })
    ).resolves.toMatchObject({
      state: "ready",
      statusCode: 200
    });
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminOrganizationUnitRoute({
        path: "/admin/organization-units",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
  });

  it("renders create and detail forms with scoped organization-unit fields", async () => {
    const detailFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    await expect(
      renderAdminOrganizationUnitRoute({
        path: "/admin/organization-units/new",
        runtimeMode: "api",
        canWrite: true,
        fetchImpl: detailFetch
      })
    ).resolves.toMatchObject({
      route: "AdminOrganizationUnitEditor",
      state: "ready",
      statusCode: 200
    });

    const rendered = await renderAdminOrganizationUnitRoute({
      path: "/admin/organization-units/11111111-1111-4111-8111-111111111111",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl: detailFetch
    });

    expect(rendered).toMatchObject({
      route: "AdminOrganizationUnitEditor",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("Organization Unit: Pilot Organization Unit");
    expect(rendered.document).toContain('name="city" value="Riga" required');
    expect(rendered.document).toContain('data-action="archive"');
    expect(detailFetch).toHaveBeenCalledTimes(1);
    expect(detailFetch).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("keeps create forbidden for read-only admins and returns 404 for scoped misses", async () => {
    await expect(
      renderAdminOrganizationUnitRoute({
        path: "/admin/organization-units/new",
        runtimeMode: "api",
        canWrite: false
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });

    await expect(
      renderAdminOrganizationUnitRoute({
        path: "/admin/organization-units/22222222-2222-4222-8222-222222222222",
        runtimeMode: "demo",
        canWrite: true
      })
    ).resolves.toMatchObject({
      state: "empty",
      statusCode: 404
    });
  });
});
