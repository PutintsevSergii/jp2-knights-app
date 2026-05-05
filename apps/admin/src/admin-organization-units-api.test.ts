import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import {
  createAdminOrganizationUnit,
  fetchAdminOrganizationUnits,
  updateAdminOrganizationUnit
} from "./admin-organization-units-api.js";
import { fallbackAdminOrganizationUnits } from "./admin-content-fixtures.js";

describe("admin organization-unit API client", () => {
  it("loads and validates admin organization units", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    await expect(
      fetchAdminOrganizationUnits({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      })
    ).resolves.toEqual(fallbackAdminOrganizationUnits);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("sends create and update requests through shared DTO contracts", async () => {
    const detailPayload = {
      organizationUnit: fallbackAdminOrganizationUnits.organizationUnits[0]
    };
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(detailPayload)
      })
    );

    await expect(
      createAdminOrganizationUnit(
        {
          type: "CHORAGIEW",
          name: "New Unit",
          city: "Vilnius",
          country: "LT"
        },
        {
          baseUrl: "https://api.example.test",
          authToken: "token_1",
          fetchImpl
        }
      )
    ).resolves.toEqual(detailPayload);
    await expect(
      updateAdminOrganizationUnit(
        "11111111-1111-4111-8111-111111111111",
        {
          status: "archived"
        },
        {
          baseUrl: "https://api.example.test",
          authToken: "token_1",
          fetchImpl
        }
      )
    ).resolves.toEqual(detailPayload);
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "https://api.example.test/admin/organization-units", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer token_1"
      },
      body: JSON.stringify({
        type: "CHORAGIEW",
        name: "New Unit",
        city: "Vilnius",
        country: "LT"
      })
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/admin/organization-units/11111111-1111-4111-8111-111111111111",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token_1"
        },
        body: JSON.stringify({ status: "archived" })
      }
    );
  });

  it("rejects non-OK responses and invalid payloads", async () => {
    await expect(
      fetchAdminOrganizationUnits({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({})
          })
      })
    ).rejects.toBeInstanceOf(AdminContentHttpError);

    await expect(
      fetchAdminOrganizationUnits({
        fetchImpl: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ organizationUnits: [{ id: "not-a-uuid" }] })
          })
      })
    ).rejects.toThrow();
  });
});
