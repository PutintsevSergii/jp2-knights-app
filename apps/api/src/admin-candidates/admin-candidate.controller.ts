import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { updateAdminCandidateProfileSchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminCandidateProfileDetailResponseOpenApiSchema,
  adminCandidateProfileListResponseOpenApiSchema,
  updateAdminCandidateProfileOpenApiSchema
} from "./admin-candidate.openapi.js";
import { AdminCandidateService } from "./admin-candidate.service.js";
import type {
  AdminCandidateProfileDetailResponse,
  AdminCandidateProfileListResponse,
  UpdateAdminCandidateProfile
} from "./admin-candidate.types.js";

@ApiTags("admin-candidates")
@Controller("admin/candidates")
export class AdminCandidateController {
  constructor(private readonly candidateService: AdminCandidateService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate profiles visible to the current admin scope.",
    schema: adminCandidateProfileListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listCandidateProfiles(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminCandidateProfileListResponse> {
    return this.candidateService.listCandidateProfiles(requirePrincipal(request));
  }

  @Get(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate profile detail visible to the current admin scope.",
    schema: adminCandidateProfileDetailResponseOpenApiSchema
  })
  @ApiParam({ name: "id", schema: { type: "string", format: "uuid" } })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The candidate profile is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getCandidateProfile(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminCandidateProfileDetailResponse> {
    return this.candidateService.getCandidateProfile(requirePrincipal(request), id);
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated candidate profile status, assignment, or responsible officer.",
    schema: adminCandidateProfileDetailResponseOpenApiSchema
  })
  @ApiParam({ name: "id", schema: { type: "string", format: "uuid" } })
  @ApiBody({ schema: updateAdminCandidateProfileOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The candidate profile update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot update candidates in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The candidate profile is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateCandidateProfile(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminCandidateProfileSchema))
    body: UpdateAdminCandidateProfile
  ): Promise<AdminCandidateProfileDetailResponse> {
    return this.candidateService.updateCandidateProfile(requirePrincipal(request), id, body);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
