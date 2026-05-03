import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  PublicContentPage,
  PublicEventDetail,
  PublicEventListQuery,
  PublicEventSummary,
  PublicPrayerCategorySummary,
  PublicPrayerDetail,
  PublicPrayerListQuery,
  PublicPrayerSummary
} from "./public.types.js";

export abstract class PublicContentRepository {
  abstract findPublishedPublicContentPage(
    slug: string,
    language: string | undefined,
    now?: Date
  ): Promise<PublicContentPage | null>;
  abstract findPublishedPublicPrayerCategories(
    language: string | undefined,
    now?: Date
  ): Promise<PublicPrayerCategorySummary[]>;
  abstract findPublishedPublicPrayers(
    query: PublicPrayerListQuery,
    now?: Date
  ): Promise<PublicPrayerSummary[]>;
  abstract findPublishedPublicPrayer(id: string, now?: Date): Promise<PublicPrayerDetail | null>;
  abstract findPublishedPublicEvents(
    query: PublicEventListQuery,
    now?: Date
  ): Promise<PublicEventSummary[]>;
  abstract findPublishedPublicEvent(id: string, now?: Date): Promise<PublicEventDetail | null>;
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

  findPublishedPublicPrayerCategories(
    language: string | undefined,
    now = new Date()
  ): Promise<PublicPrayerCategorySummary[]> {
    return this.prisma.prayerCategory
      .findMany({
        where: {
          language: language ?? "en",
          status: "PUBLISHED",
          archivedAt: null,
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
        },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
      })
      .then((records) => records.map(toPublicPrayerCategorySummary));
  }

  findPublishedPublicPrayers(
    query: PublicPrayerListQuery,
    now = new Date()
  ): Promise<PublicPrayerSummary[]> {
    return this.prisma.prayer
      .findMany({
        where: publishedPublicPrayerWhere(query, now),
        include: publicPrayerCategoryInclude,
        orderBy: [{ title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toPublicPrayerSummary));
  }

  async findPublishedPublicPrayer(id: string, now = new Date()): Promise<PublicPrayerDetail | null> {
    const record = await this.prisma.prayer.findFirst({
      where: {
        id,
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      include: publicPrayerCategoryInclude
    });

    return record ? toPublicPrayerDetail(record) : null;
  }

  findPublishedPublicEvents(
    query: PublicEventListQuery,
    now = new Date()
  ): Promise<PublicEventSummary[]> {
    return this.prisma.event
      .findMany({
        where: publishedPublicEventWhere(query, now),
        orderBy: [{ startAt: "asc" }, { title: "asc" }],
        take: query.limit,
        skip: query.offset
      })
      .then((records) => records.map(toPublicEventSummary));
  }

  async findPublishedPublicEvent(id: string, now = new Date()): Promise<PublicEventDetail | null> {
    const record = await this.prisma.event.findFirst({
      where: {
        id,
        visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
        status: "published",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      }
    });

    return record ? toPublicEventDetail(record) : null;
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

const publicPrayerCategoryInclude = {
  category: {
    select: {
      id: true,
      slug: true,
      title: true,
      language: true
    }
  }
} as const;

interface PublicPrayerRecord {
  id: string;
  title: string;
  body: string;
  language: string;
  category: PublicPrayerCategoryRecord | null;
}

interface PublicPrayerCategoryRecord {
  id: string;
  slug: string;
  title: string;
  language: string;
}

interface PublicEventRecord {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startAt: Date;
  endAt: Date | null;
  locationLabel: string | null;
  visibility: string;
}

function publishedPublicPrayerWhere(query: PublicPrayerListQuery, now: Date): Prisma.PrayerWhereInput {
  const and: Prisma.PrayerWhereInput[] = [
    {
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
    }
  ];
  const where: Prisma.PrayerWhereInput = {
    language: query.language ?? "en",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    archivedAt: null,
    AND: and
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q, mode: "insensitive" } },
        { body: { contains: query.q, mode: "insensitive" } }
      ]
    });
  }

  return where;
}

function publishedPublicEventWhere(query: PublicEventListQuery, now: Date): Prisma.EventWhereInput {
  return {
    visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
    status: "published",
    archivedAt: null,
    startAt: { gte: query.from ? new Date(query.from) : now },
    ...(query.type ? { type: query.type } : {}),
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
  };
}

function toPublicPrayerCategorySummary(
  record: PublicPrayerCategoryRecord
): PublicPrayerCategorySummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    language: record.language
  };
}

function toPublicPrayerSummary(record: PublicPrayerRecord): PublicPrayerSummary {
  return {
    id: record.id,
    title: record.title,
    excerpt: excerpt(record.body),
    language: record.language,
    category: record.category ? toPublicPrayerCategorySummary(record.category) : null
  };
}

function toPublicPrayerDetail(record: PublicPrayerRecord): PublicPrayerDetail {
  return {
    ...toPublicPrayerSummary(record),
    body: record.body
  };
}

function toPublicEventSummary(record: PublicEventRecord): PublicEventSummary {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt ? record.endAt.toISOString() : null,
    locationLabel: record.locationLabel,
    visibility: toPublicEventVisibility(record.visibility)
  };
}

function toPublicEventDetail(record: PublicEventRecord): PublicEventDetail {
  return {
    ...toPublicEventSummary(record),
    description: record.description
  };
}

function excerpt(value: string): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length <= 240 ? collapsed : `${collapsed.slice(0, 237)}...`;
}

function toPublicEventVisibility(value: string): "PUBLIC" | "FAMILY_OPEN" {
  if (value === "PUBLIC" || value === "FAMILY_OPEN") {
    return value;
  }

  throw new Error("Repository returned a non-public event visibility.");
}
