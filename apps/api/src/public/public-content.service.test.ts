import { NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { PublicContentRepository } from "./public-content.repository.js";
import { PublicContentService } from "./public-content.service.js";
import type { PublicContentPage } from "./public.types.js";

const aboutPage: PublicContentPage = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "about-order",
  title: "About the Order",
  body: "Approved public information.",
  language: "en"
};

describe("PublicContentService", () => {
  it("returns published public content page details", async () => {
    await expect(
      new PublicContentService(repository(aboutPage)).getContentPage("about-order", {
        language: "en"
      })
    ).resolves.toEqual({ page: aboutPage });
  });

  it("returns 404 when the public page is missing or not visible", async () => {
    await expect(
      new PublicContentService(repository(null)).getContentPage("private-page", {})
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function repository(page: PublicContentPage | null): PublicContentRepository {
  return {
    findPublishedPublicContentPage: () => Promise.resolve(page)
  };
}
