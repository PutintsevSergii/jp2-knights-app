import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { candidateDashboardResponseOpenApiSchema } from "./candidate-dashboard.openapi.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type { CandidateDashboardResponse } from "./candidate-dashboard.types.js";

@ApiTags("candidate")
@Controller("candidate/dashboard")
export class CandidateDashboardController {
  constructor(private readonly candidateDashboardService: CandidateDashboardService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate dashboard payload scoped to the active candidate profile.",
    schema: candidateDashboardResponseOpenApiSchema
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
    description: "The current user does not have an active candidate profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getDashboard(@Req() request: RequestWithPrincipal): Promise<CandidateDashboardResponse> {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return this.candidateDashboardService.getDashboard(request.principal);
  }
}
