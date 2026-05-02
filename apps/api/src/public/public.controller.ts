import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  publicContentPageQuerySchema,
  publicContentPageSlugSchema,
  publicHomeQuerySchema
} from "@jp2/shared-validation";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  publicContentPageResponseOpenApiSchema,
  publicHomeResponseOpenApiSchema
} from "./public.openapi.js";
import { PublicContentService } from "./public-content.service.js";
import { PublicHomeService } from "./public-home.service.js";
import type {
  PublicContentPageQuery,
  PublicContentPageResponse,
  PublicHomeQuery,
  PublicHomeResponse
} from "./public.types.js";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(
    private readonly publicHomeService: PublicHomeService,
    private readonly publicContentService: PublicContentService
  ) {}

  @Get("home")
  @ApiOkResponse({
    description: "Public home discovery payload with no private content.",
    schema: publicHomeResponseOpenApiSchema
  })
  @ApiQuery({
    name: "language",
    required: false,
    schema: { type: "string", minLength: 2, maxLength: 10 }
  })
  getPublicHome(
    @Query(new ZodValidationPipe(publicHomeQuerySchema)) query: PublicHomeQuery
  ): PublicHomeResponse {
    return this.publicHomeService.getHome(query);
  }

  @Get("content-pages/:slug")
  @ApiOkResponse({
    description: "Published public content page detail.",
    schema: publicContentPageResponseOpenApiSchema
  })
  @ApiNotFoundResponse({
    description: "No published public content page matched the slug and language fallback."
  })
  @ApiParam({
    name: "slug",
    schema: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    }
  })
  @ApiQuery({
    name: "language",
    required: false,
    schema: { type: "string", minLength: 2, maxLength: 10 }
  })
  getPublicContentPage(
    @Param("slug", new ZodValidationPipe(publicContentPageSlugSchema)) slug: string,
    @Query(new ZodValidationPipe(publicContentPageQuerySchema)) query: PublicContentPageQuery
  ): Promise<PublicContentPageResponse> {
    return this.publicContentService.getContentPage(slug, query);
  }
}
