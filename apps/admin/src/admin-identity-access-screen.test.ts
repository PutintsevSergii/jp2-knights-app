import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminIdentityAccessReviews } from "./admin-content-fixtures.js";
import {
  buildAdminIdentityAccessScreen,
  renderAdminIdentityAccessRoute
} from "./admin-identity-access-screen.js";

describe("admin identity access screen", () => {
  it("builds ready, empty, and forbidden screen states", () => {
    expect(
      buildAdminIdentityAccessScreen({
        state: "ready",
        reviews: fallbackAdminIdentityAccessReviews.identityAccessReviews,
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      route: "AdminIdentityAccessReviews",
      state: "ready",
      canWrite: true,
      demoChromeVisible: false
    });
    expect(
      buildAdminIdentityAccessScreen({
        state: "ready",
        reviews: [],
        runtimeMode: "demo"
      })
    ).toMatchObject({
      state: "empty",
      demoChromeVisible: true
    });
    expect(
      buildAdminIdentityAccessScreen({
        state: "forbidden",
        runtimeMode: "api"
      })
    ).toMatchObject({
      state: "forbidden",
      reviews: []
    });
  });

  it("renders API and demo routes with safe action metadata", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminIdentityAccessReviews)
      })
    );

    const rendered = await renderAdminIdentityAccessRoute({
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/identity-access-reviews",
      route: "AdminIdentityAccessReviews",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("Piotr Kowalski");
    expect(rendered.document).toContain('data-action="confirm"');
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/identity-access-reviews",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );

    const demoRendered = await renderAdminIdentityAccessRoute({
      runtimeMode: "demo",
      fetchImpl
    });
    expect(demoRendered.document).toContain("Demo");
  });

  it("maps API failures to status documents", async () => {
    await expect(
      renderAdminIdentityAccessRoute({
        runtimeMode: "api",
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
    await expect(
      renderAdminIdentityAccessRoute({
        runtimeMode: "api",
        fetchImpl: () => {
          throw new TypeError("offline");
        }
      })
    ).resolves.toMatchObject({
      state: "error",
      statusCode: 503
    });
  });
});
