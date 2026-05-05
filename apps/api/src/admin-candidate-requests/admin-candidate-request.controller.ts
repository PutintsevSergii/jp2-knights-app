import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  convertCandidateRequestSchema,
  updateAdminCandidateRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminCandidateRequestDetailResponseOpenApiSchema,
  adminCandidateRequestListResponseOpenApiSchema,
  adminCandidateProfileDetailResponseOpenApiSchema,
  convertCandidateRequestOpenApiSchema,
  updateAdminCandidateRequestOpenApiSchema
} from "./admin-candidate-request.openapi.js";
import { AdminCandidateRequestService } from "./admin-candidate-request.service.js";
import type {
  AdminCandidateRequestDetailResponse,
  AdminCandidateRequestListResponse,
  AdminCandidateProfileDetailResponse,
  ConvertCandidateRequest,
  UpdateAdminCandidateRequest
} from "./admin-candidate-request.types.js";

@ApiTags("admin-candidate-requests")
@Controller("admin/candidate-requests")
export class AdminCandidateRequestController {
  constructor(private readonly candidateRequestService: AdminCandidateRequestService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate requests visible to the current admin scope.",
    schema: adminCandidateRequestListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listCandidateRequests(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminCandidateRequestListResponse> {
    return this.candidateRequestService.listCandidateRequests(requirePrincipal(request));
  }

  @Get(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Candidate request detail visible to the current admin scope.",
    schema: adminCandidateRequestDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The candidate request is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getCandidateRequest(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminCandidateRequestDetailResponse> {
    return this.candidateRequestService.getCandidateRequest(requirePrincipal(request), id);
  }

  @Patch(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated candidate request status, assignment, or officer note.",
    schema: adminCandidateRequestDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: updateAdminCandidateRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The candidate request update payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot update candidate requests in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The candidate request is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateCandidateRequest(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateAdminCandidateRequestSchema))
    body: UpdateAdminCandidateRequest
  ): Promise<AdminCandidateRequestDetailResponse> {
    return this.candidateRequestService.updateCandidateRequest(
      requirePrincipal(request),
      id,
      body
    );
  }

  @Post(":id/convert")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Converted candidate request with newly created candidate profile.",
    schema: adminCandidateProfileDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({ schema: convertCandidateRequestOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The conversion payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot convert the request in the requested scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The candidate request is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "The candidate request cannot be converted from its current state.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  convertCandidateRequest(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(convertCandidateRequestSchema))
    body: ConvertCandidateRequest
  ): Promise<AdminCandidateProfileDetailResponse> {
    return this.candidateRequestService.convertCandidateRequest(
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
