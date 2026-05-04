import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  createAdminPrayerRequestSchema,
  updateAdminPrayerRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminPrayerDetailResponseOpenApiSchema,
  adminPrayerListResponseOpenApiSchema,
  createAdminPrayerRequestOpenApiSchema,
  updateAdminPrayerRequestOpenApiSchema
} from "./admin-prayer.openapi.js";
import { AdminPrayerService } from "./admin-prayer.service.js";
import type {
  AdminPrayerDetailResponse,
  AdminPrayerListResponse,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

@ApiTags("admin-prayers")
@Controller("admin/prayers")
export class AdminPrayerController {
  constructor(private readonly adminPrayerService: AdminPrayerService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Prayer records visible to the current admin scope.",
    schema: adminPrayerListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminPrayers(@Req() request: RequestWithPrincipal): Promise<AdminPrayerListResponse> {
    return this.adminPrayerService.listAdminPrayers(requirePrincipal(request));
  }

  @Post()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Created prayer record.",
    schema: adminPrayerDetailResponseOpenApiSchema
  })
  @ApiBody({ schema: createAdminPrayerRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The prayer create payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "Only Super Admin can create prayer records in this slice.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createAdminPrayer(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createAdminPrayerRequestSchema))
    body: CreateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    return this.adminPrayerService.createAdminPrayer(requirePrincipal(request), body);
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated prayer record.",
    schema: adminPrayerDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: updateAdminPrayerRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The prayer update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "Only Super Admin can update or archive prayer records in this slice.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateAdminPrayer(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminPrayerRequestSchema))
    body: UpdateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    return this.adminPrayerService.updateAdminPrayer(requirePrincipal(request), id, body);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
