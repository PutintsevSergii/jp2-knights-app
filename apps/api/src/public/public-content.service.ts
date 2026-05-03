import { Injectable, NotFoundException } from "@nestjs/common";
import { PublicContentRepository } from "./public-content.repository.js";
import type {
  PublicContentPageQuery,
  PublicContentPageResponse,
  PublicEventDetailResponse,
  PublicEventListQuery,
  PublicEventListResponse,
  PublicPrayerDetailResponse,
  PublicPrayerListQuery,
  PublicPrayerListResponse
} from "./public.types.js";

@Injectable()
export class PublicContentService {
  constructor(private readonly publicContentRepository: PublicContentRepository) {}

  async getContentPage(
    slug: string,
    query: PublicContentPageQuery
  ): Promise<PublicContentPageResponse> {
    const page = await this.publicContentRepository.findPublishedPublicContentPage(
      slug,
      query.language
    );

    if (!page) {
      throw new NotFoundException("Public content page was not found.");
    }

    return { page };
  }

  async listPrayers(query: PublicPrayerListQuery): Promise<PublicPrayerListResponse> {
    const [categories, prayers] = await Promise.all([
      this.publicContentRepository.findPublishedPublicPrayerCategories(query.language),
      this.publicContentRepository.findPublishedPublicPrayers(query)
    ]);

    return {
      categories,
      prayers,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async getPrayer(id: string): Promise<PublicPrayerDetailResponse> {
    const prayer = await this.publicContentRepository.findPublishedPublicPrayer(id);

    if (!prayer) {
      throw new NotFoundException("Public prayer was not found.");
    }

    return { prayer };
  }

  async listEvents(query: PublicEventListQuery): Promise<PublicEventListResponse> {
    const events = await this.publicContentRepository.findPublishedPublicEvents(query);

    return {
      events,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async getEvent(id: string): Promise<PublicEventDetailResponse> {
    const event = await this.publicContentRepository.findPublishedPublicEvent(id);

    if (!event) {
      throw new NotFoundException("Public event was not found.");
    }

    return { event };
  }
}
