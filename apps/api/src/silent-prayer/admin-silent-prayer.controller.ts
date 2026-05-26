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
  createAdminSilentPrayerEventRequestSchema,
  updateAdminSilentPrayerEventRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminSilentPrayerEventDetailResponseOpenApiSchema,
  adminSilentPrayerEventListResponseOpenApiSchema,
  createAdminSilentPrayerEventRequestOpenApiSchema,
  updateAdminSilentPrayerEventRequestOpenApiSchema
} from "./admin-silent-prayer.openapi.js";
import { AdminSilentPrayerService } from "./admin-silent-prayer.service.js";
import type {
  AdminSilentPrayerEventDetailResponse,
  AdminSilentPrayerEventListResponse,
  CreateAdminSilentPrayerEventRequest,
  UpdateAdminSilentPrayerEventRequest
} from "./admin-silent-prayer.types.js";

@ApiTags("admin-silent-prayer-events")
@Controller("admin/silent-prayer-events")
export class AdminSilentPrayerController {
  constructor(private readonly adminSilentPrayerService: AdminSilentPrayerService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Silent-prayer event records visible to the current admin scope.",
    schema: adminSilentPrayerEventListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminSilentPrayerEvents(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminSilentPrayerEventListResponse> {
    return this.adminSilentPrayerService.listAdminSilentPrayerEvents(requirePrincipal(request));
  }

  @Post()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Created silent-prayer event record.",
    schema: adminSilentPrayerEventDetailResponseOpenApiSchema
  })
  @ApiBody({ schema: createAdminSilentPrayerEventRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The silent-prayer event create payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot create silent-prayer events in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createAdminSilentPrayerEvent(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createAdminSilentPrayerEventRequestSchema))
    body: CreateAdminSilentPrayerEventRequest
  ): Promise<AdminSilentPrayerEventDetailResponse> {
    return this.adminSilentPrayerService.createAdminSilentPrayerEvent(
      requirePrincipal(request),
      body
    );
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated silent-prayer event record.",
    schema: adminSilentPrayerEventDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: updateAdminSilentPrayerEventRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The silent-prayer event update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot update silent-prayer events in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The silent-prayer event is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateAdminSilentPrayerEvent(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminSilentPrayerEventRequestSchema))
    body: UpdateAdminSilentPrayerEventRequest
  ): Promise<AdminSilentPrayerEventDetailResponse> {
    return this.adminSilentPrayerService.updateAdminSilentPrayerEvent(
      requirePrincipal(request),
      id,
      body
    );
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
