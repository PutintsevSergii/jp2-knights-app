import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { currentUserResponseOpenApiSchema } from "./auth.openapi.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import { CurrentUserService } from "./current-user.service.js";
import type { CurrentUserResponse, RequestWithPrincipal } from "./current-user.types.js";

@ApiTags("auth")
@Controller("auth")
export class CurrentUserController {
  constructor(private readonly currentUserService: CurrentUserService) {}

  @Get("me")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Current authenticated user identity, roles, and resolved app access.",
    schema: currentUserResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Authentication is missing or the authenticated user is inactive/archived.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getCurrentUser(@Req() request: RequestWithPrincipal): CurrentUserResponse {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return this.currentUserService.toResponse(request.principal);
  }
}
