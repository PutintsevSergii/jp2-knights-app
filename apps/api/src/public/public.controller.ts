import { Body, Controller, Get, HttpCode, Param, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import {
  createPublicCandidateRequestSchema,
  publicEventIdSchema,
  publicEventListQuerySchema,
  publicContentPageQuerySchema,
  publicContentPageSlugSchema,
  publicHomeQuerySchema,
  publicPrayerIdSchema,
  publicPrayerListQuerySchema
} from "@jp2/shared-validation";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  createPublicCandidateRequestOpenApiSchema,
  publicCandidateRequestResponseOpenApiSchema,
  publicEventDetailResponseOpenApiSchema,
  publicEventListResponseOpenApiSchema,
  publicContentPageResponseOpenApiSchema,
  publicHomeResponseOpenApiSchema,
  publicPrayerDetailResponseOpenApiSchema,
  publicPrayerListResponseOpenApiSchema
} from "./public.openapi.js";
import { PublicCandidateRequestService } from "./public-candidate-request.service.js";
import { PublicContentService } from "./public-content.service.js";
import { PublicHomeService } from "./public-home.service.js";
import type {
  CreatePublicCandidateRequest,
  PublicCandidateRequestResponse,
  PublicContentPageQuery,
  PublicContentPageResponse,
  PublicEventDetailResponse,
  PublicEventListQuery,
  PublicEventListResponse,
  PublicHomeQuery,
  PublicHomeResponse,
  PublicPrayerDetailResponse,
  PublicPrayerListQuery,
  PublicPrayerListResponse
} from "./public.types.js";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(
    private readonly publicHomeService: PublicHomeService,
    private readonly publicContentService: PublicContentService,
    private readonly publicCandidateRequestService: PublicCandidateRequestService
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

  @Get("prayers")
  @ApiOkResponse({
    description: "Published public prayer categories and prayers.",
    schema: publicPrayerListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "categoryId",
    required: false,
    schema: { type: "string", format: "uuid" }
  })
  @ApiQuery({
    name: "q",
    required: false,
    schema: { type: "string", minLength: 1, maxLength: 120 }
  })
  @ApiQuery({
    name: "language",
    required: false,
    schema: { type: "string", minLength: 2, maxLength: 10 }
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 1000, default: 0 }
  })
  listPublicPrayers(
    @Query(new ZodValidationPipe(publicPrayerListQuerySchema)) query: PublicPrayerListQuery
  ): Promise<PublicPrayerListResponse> {
    return this.publicContentService.listPrayers(query);
  }

  @Get("prayers/:id")
  @ApiOkResponse({
    description: "Published public prayer detail.",
    schema: publicPrayerDetailResponseOpenApiSchema
  })
  @ApiNotFoundResponse({
    description: "No published public prayer matched the id."
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  getPublicPrayer(
    @Param("id", new ZodValidationPipe(publicPrayerIdSchema)) id: string
  ): Promise<PublicPrayerDetailResponse> {
    return this.publicContentService.getPrayer(id);
  }

  @Get("events")
  @ApiOkResponse({
    description: "Published public and family-open event summaries.",
    schema: publicEventListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "from",
    required: false,
    schema: { type: "string", format: "date-time" }
  })
  @ApiQuery({
    name: "type",
    required: false,
    schema: { type: "string", minLength: 1, maxLength: 80 }
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 1000, default: 0 }
  })
  listPublicEvents(
    @Query(new ZodValidationPipe(publicEventListQuerySchema)) query: PublicEventListQuery
  ): Promise<PublicEventListResponse> {
    return this.publicContentService.listEvents(query);
  }

  @Get("events/:id")
  @ApiOkResponse({
    description: "Published public or family-open event detail.",
    schema: publicEventDetailResponseOpenApiSchema
  })
  @ApiNotFoundResponse({
    description: "No published public or family-open event matched the id."
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  getPublicEvent(
    @Param("id", new ZodValidationPipe(publicEventIdSchema)) id: string
  ): Promise<PublicEventDetailResponse> {
    return this.publicContentService.getEvent(id);
  }

  @Post("candidate-requests")
  @HttpCode(200)
  @ApiOkResponse({
    description: "Created public candidate interest request.",
    schema: publicCandidateRequestResponseOpenApiSchema
  })
  @ApiBody({ schema: createPublicCandidateRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "Candidate request validation failed.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "An active candidate request already exists for this email.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 429,
    description: "Too many public candidate request attempts.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createCandidateRequest(
    @Body(new ZodValidationPipe(createPublicCandidateRequestSchema))
    body: CreatePublicCandidateRequest
  ): Promise<PublicCandidateRequestResponse> {
    return this.publicCandidateRequestService.createCandidateRequest(body);
  }
}
