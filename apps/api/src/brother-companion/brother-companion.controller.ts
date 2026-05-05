import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import {
  brotherProfileResponseOpenApiSchema,
  brotherTodayResponseOpenApiSchema
} from "./brother-companion.openapi.js";
import { BrotherCompanionService } from "./brother-companion.service.js";
import type { BrotherProfileResponse, BrotherTodayResponse } from "./brother-companion.types.js";

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
    status: 401,
    description: "Authentication is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have brother access.",
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
    status: 401,
    description: "Authentication is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have brother access.",
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
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
