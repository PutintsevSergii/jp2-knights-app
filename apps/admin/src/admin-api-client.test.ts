import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AdminContentHttpError, buildAdminContentUrl, requestAdminApi } from "./admin-api-client.js";

describe("admin api client primitives", () => {
  it("builds admin API URLs with normalized base paths", () => {
    expect(buildAdminContentUrl("admin/dashboard", "https://api.example.test/api")).toBe(
      "https://api.example.test/api/admin/dashboard"
    );
  });

  it("centralizes auth headers and HTTP failure wrapping", async () => {
    const response = await requestAdminApi("admin/dashboard", {
      authToken: "token_1",
      authCookie: "session=abc",
      fetchImpl: (_input, init) => {
        expect(init?.headers?.authorization).toBe("Bearer token_1");
        expect(init?.headers?.cookie).toBe("session=abc");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      }
    });

    expect(response.status).toBe(200);

    await expect(
      requestAdminApi("admin/dashboard", {
        fetchImpl: () => Promise.resolve({
          ok: false,
          status: 403,
          json: () => Promise.resolve({})
        })
      })
    ).rejects.toBeInstanceOf(AdminContentHttpError);
  });

  it("keeps feature admin API clients on the shared request primitive", () => {
    const apiClientFiles = readdirSync(join(process.cwd(), "apps/admin/src")).filter(
      (fileName) => fileName.endsWith("-api.ts") && fileName !== "admin-content-api.ts"
    );

    for (const fileName of apiClientFiles) {
      const source = readFileSync(join(process.cwd(), "apps/admin/src", fileName), "utf8");
      expect(source).not.toMatch(/function getGlobalFetch|function buildHeaders/);
    }
  });
});
