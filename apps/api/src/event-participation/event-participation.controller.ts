import { Controller, Delete, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { eventParticipationResponseOpenApiSchema } from "./event-participation.openapi.js";
import { EventParticipationService } from "./event-participation.service.js";
import type { EventParticipationResponse } from "./event-participation.types.js";

@ApiTags("event-participation")
@Controller()
export class EventParticipationController {
  constructor(private readonly eventParticipationService: EventParticipationService) {}

  @Post("candidate/events/:id/participation")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate event participation intent marked as planning to attend.",
    schema: eventParticipationResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active candidate access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The event is not visible to the candidate or no active intent exists.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  markCandidatePlanningToAttend(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) eventId: string
  ): Promise<EventParticipationResponse> {
    return this.eventParticipationService.markCandidatePlanningToAttend(
      requirePrincipal(request),
      eventId
    );
  }

  @Delete("candidate/events/:id/participation")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate event participation intent cancelled.",
    schema: eventParticipationResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active candidate access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "No active candidate participation intent exists for this event.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  cancelCandidateParticipation(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) eventId: string
  ): Promise<EventParticipationResponse> {
    return this.eventParticipationService.cancelCandidateParticipation(
      requirePrincipal(request),
      eventId
    );
  }

  @Post("brother/events/:id/participation")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Brother event participation intent marked as planning to attend.",
    schema: eventParticipationResponseOpenApiSchema
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
    description: "The event is not visible to the brother or no active intent exists.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  markBrotherPlanningToAttend(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) eventId: string
  ): Promise<EventParticipationResponse> {
    return this.eventParticipationService.markBrotherPlanningToAttend(
      requirePrincipal(request),
      eventId
    );
  }

  @Delete("brother/events/:id/participation")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Brother event participation intent cancelled.",
    schema: eventParticipationResponseOpenApiSchema
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
    description: "No active brother participation intent exists for this event.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  cancelBrotherParticipation(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) eventId: string
  ): Promise<EventParticipationResponse> {
    return this.eventParticipationService.cancelBrotherParticipation(
      requirePrincipal(request),
      eventId
    );
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
