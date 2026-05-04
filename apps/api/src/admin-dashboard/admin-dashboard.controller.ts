import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { adminDashboardResponseOpenApiSchema } from "./admin-dashboard.openapi.js";
import { AdminDashboardService } from "./admin-dashboard.service.js";
import type { AdminDashboardResponse } from "./admin-dashboard.types.js";

@ApiTags("admin")
@Controller("admin/dashboard")
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Scoped Admin Lite dashboard counts and task links.",
    schema: adminDashboardResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  async getDashboard(@Req() request: RequestWithPrincipal): Promise<AdminDashboardResponse> {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return this.adminDashboardService.getDashboard(request.principal);
  }
}
