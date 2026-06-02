import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { adminAuditLogListQuerySchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import { adminAuditLogListResponseOpenApiSchema } from "./admin-audit.openapi.js";
import { AdminAuditService } from "./admin-audit.service.js";
import type { AdminAuditLogListQuery, AdminAuditLogListResponse } from "./admin-audit.types.js";

@ApiTags("admin-audit")
@Controller("admin/audit-logs")
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Filtered redacted audit log entries for Super Admin review.",
    schema: adminAuditLogListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 50 }
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 5000, default: 0 }
  })
  @ApiQuery({ name: "action", required: false, schema: { type: "string", maxLength: 160 } })
  @ApiQuery({ name: "entityType", required: false, schema: { type: "string", maxLength: 120 } })
  @ApiQuery({ name: "actorUserId", required: false, schema: { type: "string", format: "uuid" } })
  @ApiQuery({ name: "entityId", required: false, schema: { type: "string", format: "uuid" } })
  @ApiQuery({
    name: "scopeOrganizationUnitId",
    required: false,
    schema: { type: "string", format: "uuid" }
  })
  @ApiQuery({
    name: "createdFrom",
    required: false,
    schema: { type: "string", format: "date-time" }
  })
  @ApiQuery({
    name: "createdTo",
    required: false,
    schema: { type: "string", format: "date-time" }
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
  async listAuditLogs(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(adminAuditLogListQuerySchema)) query: AdminAuditLogListQuery
  ): Promise<AdminAuditLogListResponse> {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return this.adminAuditService.listAuditLogs(request.principal, query);
  }
}
