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
  createAdminAnnouncementRequestSchema,
  updateAdminAnnouncementRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminAnnouncementDetailResponseOpenApiSchema,
  adminAnnouncementListResponseOpenApiSchema,
  createAdminAnnouncementRequestOpenApiSchema,
  updateAdminAnnouncementRequestOpenApiSchema
} from "./admin-announcement.openapi.js";
import { AdminAnnouncementService } from "./admin-announcement.service.js";
import type {
  AdminAnnouncementDetailResponse,
  AdminAnnouncementListResponse,
  CreateAdminAnnouncementRequest,
  UpdateAdminAnnouncementRequest
} from "./admin-announcement.types.js";

@ApiTags("admin-announcements")
@Controller("admin/announcements")
export class AdminAnnouncementController {
  constructor(private readonly adminAnnouncementService: AdminAnnouncementService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Announcement records visible to the current admin scope.",
    schema: adminAnnouncementListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminAnnouncements(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminAnnouncementListResponse> {
    return this.adminAnnouncementService.listAdminAnnouncements(requirePrincipal(request));
  }

  @Post()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Created announcement record.",
    schema: adminAnnouncementDetailResponseOpenApiSchema
  })
  @ApiBody({ schema: createAdminAnnouncementRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The announcement create payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot create announcements in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createAdminAnnouncement(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createAdminAnnouncementRequestSchema))
    body: CreateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementDetailResponse> {
    return this.adminAnnouncementService.createAdminAnnouncement(
      requirePrincipal(request),
      body
    );
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated announcement record.",
    schema: adminAnnouncementDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: updateAdminAnnouncementRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The announcement update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot update announcements in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The announcement is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateAdminAnnouncement(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminAnnouncementRequestSchema))
    body: UpdateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementDetailResponse> {
    return this.adminAnnouncementService.updateAdminAnnouncement(
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
