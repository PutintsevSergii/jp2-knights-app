import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { adminContentShellRoutes, renderAdminContentRoute } from "./admin-content-shell.js";

const prayerPayload = {
  prayers: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      categoryId: null,
      title: "Morning Offering",
      body: "A public morning prayer.",
      language: "en",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    }
  ]
};

describe("admin content shell routes", () => {
  it("exposes prayer and event shell routes", () => {
    expect(adminContentShellRoutes).toEqual([
      {
        path: "/admin/prayers",
        label: "Prayers",
        screenRoute: "AdminPrayerList"
      },
      {
        path: "/admin/events",
        label: "Events",
        screenRoute: "AdminEventList"
      }
    ]);
  });

  it("renders the prayer route through the API client and full HTML document shell", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(prayerPayload)
      })
    );

    const rendered = await renderAdminContentRoute({
      path: "/admin/prayers",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/prayers",
      route: "AdminPrayerList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<!doctype html>");
    expect(rendered.document).toContain("<title>Admin Prayers</title>");
    expect(rendered.document).toContain("Morning Offering");
    expect(rendered.document).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo events without a backend fetch and marks demo chrome", async () => {
    const fetchImpl = vi.fn();
    const rendered = await renderAdminContentRoute({
      path: "/admin/events",
      runtimeMode: "demo",
      canWrite: false,
      fetchImpl
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(rendered).toMatchObject({
      path: "/admin/events",
      route: "AdminEventList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<title>Admin Events</title>");
    expect(rendered.document).toContain("Open Evening");
    expect(rendered.document).toContain("Demo");
    expect(rendered.document).not.toContain('data-action="create"');
  });

  it("maps API failures into rendered route status codes", async () => {
    await expect(
      renderAdminContentRoute({
        path: "/admin/events",
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
    await expect(
      renderAdminContentRoute({
        path: "/admin/events",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new TypeError("Network request failed");
        }
      })
    ).resolves.toMatchObject({
      state: "offline",
      statusCode: 503
    });
  });
});
