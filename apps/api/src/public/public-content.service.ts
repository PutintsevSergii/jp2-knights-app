import { Injectable, NotFoundException } from "@nestjs/common";
import { PublicContentRepository } from "./public-content.repository.js";
import type { PublicContentPageQuery, PublicContentPageResponse } from "./public.types.js";

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
}
