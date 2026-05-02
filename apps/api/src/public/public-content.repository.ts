import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { PublicContentPage } from "./public.types.js";

export abstract class PublicContentRepository {
  abstract findPublishedPublicContentPage(
    slug: string,
    language: string | undefined,
    now?: Date
  ): Promise<PublicContentPage | null>;
}

@Injectable()
export class PrismaPublicContentRepository implements PublicContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedPublicContentPage(
    slug: string,
    language: string | undefined,
    now = new Date()
  ): Promise<PublicContentPage | null> {
    const requestedLanguage = language ?? "en";
    const record =
      (await this.findContentPageByLanguage(slug, requestedLanguage, now)) ??
      (requestedLanguage === "en" ? null : await this.findContentPageByLanguage(slug, "en", now));

    return record ? toPublicContentPage(record) : null;
  }

  private findContentPageByLanguage(
    slug: string,
    language: string,
    now: Date
  ): Promise<PublicContentPageRecord | null> {
    return this.prisma.contentPage.findFirst({
      where: {
        slug,
        language,
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      }
    });
  }
}

interface PublicContentPageRecord {
  id: string;
  slug: string;
  title: string;
  body: string;
  language: string;
}

function toPublicContentPage(record: PublicContentPageRecord): PublicContentPage {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    body: record.body,
    language: record.language
  };
}
