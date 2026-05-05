import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { buildAdminDashboardScreen, renderAdminDashboardRoute } from "./admin-dashboard-screen.js";
import { fallbackAdminDashboard } from "./admin-content-fixtures.js";

describe("admin dashboard screen", () => {
  it("builds metrics, tasks, and scoped navigation from the dashboard DTO", () => {
    const screen = buildAdminDashboardScreen({
      state: "ready",
      response: fallbackAdminDashboard,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AdminDashboard",
      state: "ready",
      title: "Admin Dashboard",
      demoChromeVisible: false
    });
    expect(screen.metrics.map((metric) => metric.targetRoute)).toEqual([
      "/admin/organization-units",
      "/admin/prayers",
      "/admin/events"
    ]);
    expect(screen.navigation.map((item) => item.path)).toEqual([
      "/admin/dashboard",
      "/admin/candidate-requests",
      "/admin/organization-units",
      "/admin/prayers",
      "/admin/events"
    ]);
  });

  it("renders API and demo dashboard routes", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );

    const rendered = await renderAdminDashboardRoute({
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/dashboard",
      route: "AdminDashboard",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<title>Admin Dashboard</title>");
    expect(rendered.document).toContain("/admin/prayers");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });

    const demoRendered = await renderAdminDashboardRoute({
      runtimeMode: "demo",
      fetchImpl
    });
    expect(demoRendered.document).toContain("Demo");
  });

  it("maps dashboard route failures into status documents", async () => {
    await expect(
      renderAdminDashboardRoute({
        runtimeMode: "api",
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
  });
});
