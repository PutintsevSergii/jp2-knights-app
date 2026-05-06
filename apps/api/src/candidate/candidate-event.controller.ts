import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { candidateEventListQuerySchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  candidateEventDetailResponseOpenApiSchema,
  candidateEventListResponseOpenApiSchema
} from "./candidate-dashboard.openapi.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type {
  CandidateEventDetailResponse,
  CandidateEventListQuery,
  CandidateEventListResponse
} from "./candidate-dashboard.types.js";

@ApiTags("candidate")
@Controller("candidate/events")
export class CandidateEventController {
  constructor(private readonly candidateDashboardService: CandidateDashboardService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Published events visible to the active candidate.",
    schema: candidateEventListResponseOpenApiSchema
  })
  @ApiQuery({
    name: "from",
    required: false,
    schema: { type: "string", format: "date-time" }
  })
  @ApiQuery({
    name: "type",
    required: false,
    schema: { type: "string", minLength: 1, maxLength: 80 }
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
    description: "Authentication, approval, or an active candidate profile is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listEvents(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(candidateEventListQuerySchema)) query: CandidateEventListQuery
  ): Promise<CandidateEventListResponse> {
    return this.candidateDashboardService.listEvents(requirePrincipal(request), query);
  }

  @Get(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate-visible event detail with the current user's own participation intent.",
    schema: candidateEventDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or an active candidate profile is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The event is not visible in the current candidate scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getEvent(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<CandidateEventDetailResponse> {
    return this.candidateDashboardService.getEvent(requirePrincipal(request), id);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
