import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { candidateAnnouncementListQuerySchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import { candidateAnnouncementListResponseOpenApiSchema } from "./candidate-dashboard.openapi.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type {
  CandidateAnnouncementListQuery,
  CandidateAnnouncementListResponse
} from "./candidate-dashboard.types.js";

@ApiTags("candidate")
@Controller("candidate/announcements")
export class CandidateAnnouncementController {
  constructor(private readonly candidateDashboardService: CandidateDashboardService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Published announcements visible to the active candidate.",
    schema: candidateAnnouncementListResponseOpenApiSchema
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
  listAnnouncements(
    @Req() request: RequestWithPrincipal,
    @Query(new ZodValidationPipe(candidateAnnouncementListQuerySchema))
    query: CandidateAnnouncementListQuery
  ): Promise<CandidateAnnouncementListResponse> {
    return this.candidateDashboardService.listAnnouncements(requirePrincipal(request), query);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
