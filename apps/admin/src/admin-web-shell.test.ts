import { describe, expect, it, vi } from "vitest";
import { fallbackAdminDashboard, fallbackAdminPrayers } from "./admin-content-fixtures.js";
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
    expect(response.body).toContain("Morning Offering");
    expect(response.body).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo routes without backend calls and returns 404 for unknown admin routes", async () => {
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

    await expect(renderAdminWebRequest({ path: "/admin/brothers" })).resolves.toMatchObject({
      statusCode: 404
    });
  });
});
