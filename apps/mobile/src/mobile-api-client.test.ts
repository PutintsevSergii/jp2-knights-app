import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildMobileApiUrl,
  requestMobileApi,
  requestPublicJsonMobileApi,
  requestPublicMobileApi
} from "./mobile-api-client.js";

describe("mobile api client primitives", () => {
  it("normalizes API URLs from a shared helper", () => {
    expect(buildMobileApiUrl("public/home", "https://api.example.test")).toBe(
      "https://api.example.test/public/home"
    );
  });

  it("adds bearer headers for private mobile requests and parses idle approval errors", async () => {
    const response = await requestMobileApi(
      "https://api.example.test/candidate/dashboard",
      {
        authToken: "token_1",
        fetchImpl: (_input, init) => {
          expect(init?.headers?.authorization).toBe("Bearer token_1");
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({})
          });
        }
      },
      "GET",
      (status, code) => new Error(`${status}:${code ?? "none"}`)
    );

    expect(response.status).toBe(200);

    await expect(
      requestMobileApi(
        "https://api.example.test/candidate/dashboard",
        {
          fetchImpl: () => Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ error: { code: "IDLE_APPROVAL_REQUIRED" } })
          })
        },
        "GET",
        (status, code) => new Error(`${status}:${code ?? "none"}`)
      )
    ).rejects.toThrow("403:IDLE_APPROVAL_REQUIRED");
  });

  it("wraps public GET and JSON POST failures with caller-specific errors", async () => {
    await expect(
      requestPublicMobileApi(
        "https://api.example.test/public/home",
        () => Promise.resolve({
          ok: false,
          status: 503,
          json: () => Promise.resolve({})
        }),
        (status) => new Error(`public:${status}`)
      )
    ).rejects.toThrow("public:503");

    await expect(
      requestPublicJsonMobileApi(
        "https://api.example.test/public/candidate-requests",
        (_input, init) => {
          expect(init?.method).toBe("POST");
          expect(init?.headers?.["content-type"]).toBe("application/json");
          expect(init?.body).toBe("{\"ok\":true}");
          return Promise.resolve({
            ok: false,
            status: 409,
            json: () => Promise.resolve({})
          });
        },
        "{\"ok\":true}",
        (status) => new Error(`json:${status}`)
      )
    ).rejects.toThrow("json:409");
  });

  it("keeps feature mobile API clients on the shared request primitive", () => {
    const apiClientFiles = readdirSync(join(process.cwd(), "apps/mobile/src")).filter(
      (fileName) => fileName.endsWith("-api.ts") && fileName !== "mobile-api-client.ts"
    );

    for (const fileName of apiClientFiles) {
      const source = readFileSync(join(process.cwd(), "apps/mobile/src", fileName), "utf8");
      expect(source).not.toMatch(
        /function getGlobalFetch|function normalizeBaseUrl|parsePrivateAccessErrorCode/
      );
    }
  });
});
