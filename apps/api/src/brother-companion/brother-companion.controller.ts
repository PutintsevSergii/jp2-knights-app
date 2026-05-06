import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { brotherEventListQuerySchema, brotherPrayerListQuerySchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  brotherEventDetailResponseOpenApiSchema,
  brotherEventListResponseOpenApiSchema,
  brotherPrayerListResponseOpenApiSchema,
  brotherProfileResponseOpenApiSchema,
  brotherTodayResponseOpenApiSchema
} from "./brother-companion.openapi.js";
import { BrotherCompanionService } from "./brother-companion.service.js";
import type {
  BrotherEventListQuery,
  BrotherEventListResponse,
  BrotherEventDetailResponse,
  BrotherPrayerListQuery,
  BrotherPrayerListResponse,
  BrotherProfileResponse,
  BrotherTodayResponse
} from "./brother-companion.types.js";

@ApiTags("brother")
@Controller("brother")
export class BrotherCompanionController {
  constructor(private readonly brotherCompanionService: BrotherCompanionService) {}

  @Get("profile")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Own active brother profile and membership assignments.",
    schema: brotherProfileResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The current brother has no active membership profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getProfile(@Req() request: RequestWithPrincipal): Promise<BrotherProfileResponse> {
    return this.brotherCompanionService.getProfile(requirePrincipal(request));
  }

  @Get("today")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Personalized brother daily summary.",
    schema: brotherTodayResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The current brother has no active membership profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getToday(@Req() request: RequestWithPrincipal): Promise<BrotherTodayResponse> {
    return this.brotherCompanionService.getToday(requirePrincipal(request));
  }

  @Get("events")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Published events visible to the active brother.",
    schema: brotherEventListResponseOpenApiSchema
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
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The current brother has no active membership profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  listEvents(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(brotherEventListQuerySchema)) query: BrotherEventListQuery
  ): Promise<BrotherEventListResponse> {
    return this.brotherCompanionService.listEvents(requirePrincipal(request), query);
  }

  @Get("events/:id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Brother-visible event detail with the current user's own participation intent.",
    schema: brotherEventDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The event is not visible in the current brother scope.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getEvent(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<BrotherEventDetailResponse> {
    return this.brotherCompanionService.getEvent(requirePrincipal(request), id);
  }

  @Get("prayers")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Published prayers visible to the active brother.",
    schema: brotherPrayerListResponseOpenApiSchema
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
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The current brother has no active membership profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  listPrayers(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(brotherPrayerListQuerySchema)) query: BrotherPrayerListQuery
  ): Promise<BrotherPrayerListResponse> {
    return this.brotherCompanionService.listPrayers(requirePrincipal(request), query);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
