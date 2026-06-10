import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import {
  publicSilentPrayerJoinRequestSchema,
  publicSilentPrayerPresenceRequestSchema,
  silentPrayerEventIdSchema,
  silentPrayerEventPresenceRequestSchema,
  silentPrayerPaginationQuerySchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  brotherSilentPrayerJoinResponseOpenApiSchema,
  brotherSilentPrayerListResponseOpenApiSchema,
  publicSilentPrayerJoinRequestOpenApiSchema,
  publicSilentPrayerJoinResponseOpenApiSchema,
  publicSilentPrayerListResponseOpenApiSchema,
  publicSilentPrayerPresenceRequestOpenApiSchema,
  silentPrayerEventPresenceRequestOpenApiSchema,
  silentPrayerPresenceActionResponseOpenApiSchema
} from "./silent-prayer.openapi.js";
import { SilentPrayerService } from "./silent-prayer.service.js";
import type {
  BrotherSilentPrayerJoinResponse,
  BrotherSilentPrayerListResponse,
  PublicSilentPrayerJoinRequest,
  PublicSilentPrayerJoinResponse,
  PublicSilentPrayerListResponse,
  PublicSilentPrayerPresenceRequest,
  SilentPrayerEventPresenceRequest,
  SilentPrayerListQuery,
  SilentPrayerPresenceActionResponse
} from "./silent-prayer.types.js";

@ApiTags("public")
@Controller("public/silent-prayer-events")
export class PublicSilentPrayerController {
  constructor(private readonly silentPrayerService: SilentPrayerService) {}

  @Get()
  @ApiOkResponse({
    description: "Active public silent-prayer sessions with aggregate counters only.",
    schema: publicSilentPrayerListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 1000, default: 0 }
  })
  listPublicSessions(
    @Query(new ZodValidationPipe(silentPrayerPaginationQuerySchema))
    query: SilentPrayerListQuery
  ): Promise<PublicSilentPrayerListResponse> {
    return this.silentPrayerService.listPublicSessions(query);
  }

  @Post(":id/join")
  @HttpCode(200)
  @ApiOkResponse({
    description: "Join an active public silent-prayer session anonymously.",
    schema: publicSilentPrayerJoinResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: publicSilentPrayerJoinRequestOpenApiSchema })
  @ApiNotFoundResponse({
    description: "No active public silent-prayer session matched the id.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  joinPublicSession(
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string,
    @Body(new ZodValidationPipe(publicSilentPrayerJoinRequestSchema))
    body: PublicSilentPrayerJoinRequest
  ): Promise<PublicSilentPrayerJoinResponse> {
    return this.silentPrayerService.joinPublicSession(id, body.anonymousSessionId);
  }

  @Post(":id/heartbeat")
  @HttpCode(200)
  @ApiOkResponse({
    description: "Refresh an anonymous silent-prayer presence lease with aggregate count only.",
    schema: silentPrayerPresenceActionResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: publicSilentPrayerPresenceRequestOpenApiSchema })
  @ApiNotFoundResponse({
    description: "No active public silent-prayer session matched the id.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  heartbeatPublicSession(
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string,
    @Body(new ZodValidationPipe(publicSilentPrayerPresenceRequestSchema))
    body: PublicSilentPrayerPresenceRequest
  ): Promise<SilentPrayerPresenceActionResponse> {
    assertRouteBodyEventIdMatch(id, body.eventId);

    return this.silentPrayerService.heartbeatPublicSession(id, body.anonymousSessionId);
  }

  @Post(":id/leave")
  @HttpCode(200)
  @ApiOkResponse({
    description: "Leave an anonymous silent-prayer session with aggregate count only.",
    schema: silentPrayerPresenceActionResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: publicSilentPrayerPresenceRequestOpenApiSchema })
  @ApiNotFoundResponse({
    description: "No active public silent-prayer session matched the id.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  leavePublicSession(
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string,
    @Body(new ZodValidationPipe(publicSilentPrayerPresenceRequestSchema))
    body: PublicSilentPrayerPresenceRequest
  ): Promise<SilentPrayerPresenceActionResponse> {
    assertRouteBodyEventIdMatch(id, body.eventId);

    return this.silentPrayerService.leavePublicSession(id, body.anonymousSessionId);
  }
}

@ApiTags("brother")
@Controller("brother/silent-prayer-events")
export class BrotherSilentPrayerController {
  constructor(private readonly silentPrayerService: SilentPrayerService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Active silent-prayer sessions visible to the current brother.",
    schema: brotherSilentPrayerListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 1000, default: 0 }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listBrotherSessions(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(silentPrayerPaginationQuerySchema))
    query: SilentPrayerListQuery
  ): Promise<BrotherSilentPrayerListResponse> {
    return this.silentPrayerService.listBrotherSessions(requirePrincipal(request), query);
  }

  @Post(":id/join")
  @HttpCode(200)
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Join an active brother-visible silent-prayer session.",
    schema: brotherSilentPrayerJoinResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "No active brother-visible silent-prayer session matched the id and scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  joinBrotherSession(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string
  ): Promise<BrotherSilentPrayerJoinResponse> {
    return this.silentPrayerService.joinBrotherSession(requirePrincipal(request), id);
  }

  @Post(":id/heartbeat")
  @HttpCode(200)
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Refresh a brother silent-prayer presence lease with aggregate count only.",
    schema: silentPrayerPresenceActionResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: silentPrayerEventPresenceRequestOpenApiSchema })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "No active brother-visible silent-prayer session matched the id and scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  heartbeatBrotherSession(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string,
    @Body(new ZodValidationPipe(silentPrayerEventPresenceRequestSchema))
    body: SilentPrayerEventPresenceRequest
  ): Promise<SilentPrayerPresenceActionResponse> {
    assertRouteBodyEventIdMatch(id, body.eventId);

    return this.silentPrayerService.heartbeatBrotherSession(requirePrincipal(request), id);
  }

  @Post(":id/leave")
  @HttpCode(200)
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Leave a brother silent-prayer session with aggregate count only.",
    schema: silentPrayerPresenceActionResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: silentPrayerEventPresenceRequestOpenApiSchema })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "No active brother-visible silent-prayer session matched the id and scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  leaveBrotherSession(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ZodValidationPipe(silentPrayerEventIdSchema)) id: string,
    @Body(new ZodValidationPipe(silentPrayerEventPresenceRequestSchema))
    body: SilentPrayerEventPresenceRequest
  ): Promise<SilentPrayerPresenceActionResponse> {
    assertRouteBodyEventIdMatch(id, body.eventId);

    return this.silentPrayerService.leaveBrotherSession(requirePrincipal(request), id);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}

function assertRouteBodyEventIdMatch(routeEventId: string, bodyEventId: string | undefined): void {
  if (bodyEventId && bodyEventId !== routeEventId) {
    throw new BadRequestException("Route silent-prayer event id must match the request body eventId.");
  }
}
