import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaPublicContentRepository } from "./public-content.repository.js";

const aboutPageRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "about-order",
  title: "About the Order",
  body: "Approved public information.",
  language: "en"
};

describe("PrismaPublicContentRepository", () => {
  it("queries only currently published PUBLIC content pages", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([aboutPageRecord]);
    const now = new Date("2026-05-02T00:00:00.000Z");

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "about-order",
        "en",
        now
      )
    ).resolves.toEqual(aboutPageRecord);
    expect(contentPageFindFirst).toHaveBeenCalledWith({
      where: {
        slug: "about-order",
        language: "en",
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      }
    });
  });

  it("falls back to English when the requested language is not published", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([null, aboutPageRecord]);

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "about-order",
        "pl",
        new Date("2026-05-02T00:00:00.000Z")
      )
    ).resolves.toEqual(aboutPageRecord);
    expect(contentPageFindFirst).toHaveBeenCalledTimes(2);
    expect(contentPageFindFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          language: "pl"
        }) as unknown
      })
    );
    expect(contentPageFindFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          language: "en"
        }) as unknown
      })
    );
  });

  it("does not repeat the fallback lookup when English is requested", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([null]);

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "missing",
        "en",
        new Date("2026-05-02T00:00:00.000Z")
      )
    ).resolves.toBeNull();
    expect(contentPageFindFirst).toHaveBeenCalledTimes(1);
  });
});

function prismaMock(results: Array<typeof aboutPageRecord | null>): {
  contentPageFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const contentPageFindFirst = vi.fn(() => Promise.resolve(results.shift() ?? null));

  return {
    contentPageFindFirst,
    prisma: {
      contentPage: {
        findFirst: contentPageFindFirst
      }
    } as unknown as PrismaService
  };
}
