import { describe, expect, it, vi } from "vitest";
import {
  buildPublicContentPageUrl,
  fetchPublicContentPage,
  PublicContentPageHttpError,
  publicContentPageLoadFailureState
} from "./public-content-api.js";

const aboutOrderPayload = {
  page: {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "about-order",
    title: "About the Order",
    body: "Approved public information.",
    language: "en"
  }
};

describe("mobile public content page API client", () => {
  it("builds public content page URLs from the configured API base URL", () => {
    expect(buildPublicContentPageUrl("about-order", "https://api.example.test", "pl")).toBe(
      "https://api.example.test/public/content-pages/about-order?language=pl"
    );
    expect(buildPublicContentPageUrl("about-order", "https://api.example.test/")).toBe(
      "https://api.example.test/public/content-pages/about-order"
    );
  });

  it("fetches and validates public content page data with the shared DTO schema", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(aboutOrderPayload)
      })
    );

    await expect(
      fetchPublicContentPage({
        slug: "about-order",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(aboutOrderPayload);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/public/content-pages/about-order"
    );
  });

  it("rejects invalid page payloads and maps request failures into screen states", async () => {
    const invalidPayloadFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            page: {
              ...aboutOrderPayload.page,
              slug: "About Order"
            }
          })
      })
    );
    const httpFailureFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      })
    );

    await expect(
      fetchPublicContentPage({ slug: "about-order", fetchImpl: invalidPayloadFetch })
    ).rejects.toThrow();
    await expect(
      fetchPublicContentPage({ slug: "about-order", fetchImpl: httpFailureFetch })
    ).rejects.toBeInstanceOf(PublicContentPageHttpError);
    expect(publicContentPageLoadFailureState(new PublicContentPageHttpError(404))).toBe("error");
    expect(publicContentPageLoadFailureState(new TypeError("Network request failed"))).toBe(
      "offline"
    );
  });
});
