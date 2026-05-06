import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { brotherPrayerListQuerySchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  brotherPrayerListResponseOpenApiSchema,
  brotherProfileResponseOpenApiSchema,
  brotherTodayResponseOpenApiSchema
} from "./brother-companion.openapi.js";
import { BrotherCompanionService } from "./brother-companion.service.js";
import type {
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
