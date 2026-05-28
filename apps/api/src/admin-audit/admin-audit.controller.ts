import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { adminAuditLogListResponseOpenApiSchema } from "./admin-audit.openapi.js";
import { AdminAuditService } from "./admin-audit.service.js";
import type { AdminAuditLogListResponse } from "./admin-audit.types.js";

@ApiTags("admin-audit")
@Controller("admin/audit-logs")
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Latest redacted audit log entries for Super Admin review.",
    schema: adminAuditLogListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user is not a Super Admin.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  async listAuditLogs(@Req() request: RequestWithPrincipal): Promise<AdminAuditLogListResponse> {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return this.adminAuditService.listAuditLogs(request.principal);
  }
}
