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
  createAdminEventRequestSchema,
  updateAdminEventRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminEventDetailResponseOpenApiSchema,
  adminEventListResponseOpenApiSchema,
  createAdminEventRequestOpenApiSchema,
  updateAdminEventRequestOpenApiSchema
} from "./admin-event.openapi.js";
import { AdminEventService } from "./admin-event.service.js";
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

@ApiTags("admin-events")
@Controller("admin/events")
export class AdminEventController {
  constructor(private readonly adminEventService: AdminEventService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Event records visible to the current admin scope.",
    schema: adminEventListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminEvents(@Req() request: RequestWithPrincipal): Promise<AdminEventListResponse> {
    return this.adminEventService.listAdminEvents(requirePrincipal(request));
  }

  @Post()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Created event record.",
    schema: adminEventDetailResponseOpenApiSchema
  })
  @ApiBody({ schema: createAdminEventRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The event create payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot create events in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createAdminEvent(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createAdminEventRequestSchema))
    body: CreateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    return this.adminEventService.createAdminEvent(requirePrincipal(request), body);
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated event record.",
    schema: adminEventDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: updateAdminEventRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The event update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot update events in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The event is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateAdminEvent(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminEventRequestSchema))
    body: UpdateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    return this.adminEventService.updateAdminEvent(requirePrincipal(request), id, body);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
