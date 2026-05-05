import { describe, expect, it, vi } from "vitest";
import {
  fallbackAdminDashboard,
  fallbackAdminOrganizationUnits,
  fallbackAdminPrayers
} from "./admin-content-fixtures.js";
import { renderAdminWebRequest } from "./admin-web-shell.js";

describe("admin web shell", () => {
  it("mounts the dashboard at /admin and /admin/dashboard", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );

    await expect(
      renderAdminWebRequest(
        {
          path: "/admin",
          headers: {
            authorization: "Bearer token_1"
          }
        },
        {
          runtimeMode: "api",
          baseUrl: "https://api.example.test",
          fetchImpl
        }
      )
    ).resolves.toMatchObject({
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts content routes and forwards write capability as render-only state", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminPrayers)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/prayers?ignored=true",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("JP2 Admin Lite");
    expect(response.body).toContain('href="/admin/prayers" aria-current="page"');
    expect(response.body).toContain('href="/admin/organization-units"');
    expect(response.body).toContain("Morning Offering");
    expect(response.body).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts the organization-unit admin route", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/organization-units",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("Pilot Organization Unit");
    expect(response.body).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts organization-unit create and detail form routes", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    const createResponse = await renderAdminWebRequest(
      { path: "/admin/organization-units/new" },
      {
        runtimeMode: "api",
        canWrite: true,
        fetchImpl
      }
    );

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toContain("Create Organization Unit");
    expect(fetchImpl).not.toHaveBeenCalled();

    const detailResponse = await renderAdminWebRequest(
      {
        path: "/admin/organization-units/11111111-1111-4111-8111-111111111111",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("JP2 Admin Lite");
    expect(detailResponse.body).toContain(
      'href="/admin/organization-units" aria-current="page"'
    );
    expect(detailResponse.body).toContain("Organization Unit: Pilot Organization Unit");
    expect(detailResponse.body).toContain('data-action="archive"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo routes without backend calls and returns mounted 404 for unknown admin routes", async () => {
    const fetchImpl = vi.fn();

    await expect(
      renderAdminWebRequest(
        { path: "/admin/events" },
        {
          runtimeMode: "demo",
          fetchImpl
        }
      )
    ).resolves.toMatchObject({
      statusCode: 200
    });
    expect(fetchImpl).not.toHaveBeenCalled();

    const notFound = await renderAdminWebRequest({ path: "/admin/brothers" });

    expect(notFound.statusCode).toBe(404);
    expect(notFound.body).toContain("JP2 Admin Lite");
    expect(notFound.body).toContain("The requested Admin Lite route is not available.");
  });
});
