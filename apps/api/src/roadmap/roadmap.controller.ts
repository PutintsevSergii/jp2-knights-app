import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  createAdminRoadmapAssignmentRequestSchema,
  createRoadmapSubmissionRequestSchema,
  reviewRoadmapSubmissionRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminRoadmapAssignmentDetailResponseOpenApiSchema,
  adminRoadmapAssignmentListResponseOpenApiSchema,
  adminRoadmapDefinitionDetailResponseOpenApiSchema,
  adminRoadmapDefinitionListResponseOpenApiSchema,
  adminRoadmapSubmissionDetailResponseOpenApiSchema,
  adminRoadmapSubmissionListResponseOpenApiSchema,
  assignedRoadmapResponseOpenApiSchema,
  createAdminRoadmapAssignmentRequestOpenApiSchema,
  createRoadmapSubmissionRequestOpenApiSchema,
  reviewRoadmapSubmissionRequestOpenApiSchema,
  roadmapSubmissionResponseOpenApiSchema
} from "./roadmap.openapi.js";
import { RoadmapService } from "./roadmap.service.js";
import type {
  AdminRoadmapAssignmentDetailResponse,
  AdminRoadmapAssignmentListResponse,
  AdminRoadmapDefinitionDetailResponse,
  AdminRoadmapDefinitionListResponse,
  AdminRoadmapSubmissionDetailResponse,
  AdminRoadmapSubmissionListResponse,
  AssignedRoadmapResponse,
  CreateAdminRoadmapAssignmentRequest,
  CreateRoadmapSubmissionRequest,
  ReviewRoadmapSubmissionRequest,
  RoadmapSubmissionResponse
} from "./roadmap.types.js";

@ApiTags("roadmap")
@Controller()
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get("candidate/roadmap")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Current candidate's assigned onboarding roadmap, or null when none is assigned.",
    schema: assignedRoadmapResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or an active candidate profile is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getCandidateRoadmap(@Req() request: RequestWithPrincipal): Promise<AssignedRoadmapResponse> {
    return this.roadmapService.getCandidateRoadmap(requirePrincipal(request));
  }

  @Get("brother/roadmap")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Current brother's assigned formation roadmap, or null when none is assigned.",
    schema: assignedRoadmapResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The current brother has no active membership profile.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getBrotherRoadmap(@Req() request: RequestWithPrincipal): Promise<AssignedRoadmapResponse> {
    return this.roadmapService.getBrotherRoadmap(requirePrincipal(request));
  }

  @Post("brother/roadmap/steps/:stepId/submissions")
  @UseGuards(CurrentUserGuard)
  @ApiBody({
    schema: createRoadmapSubmissionRequestOpenApiSchema
  })
  @ApiCreatedResponse({
    description: "Brother formation step submission created for officer review.",
    schema: roadmapSubmissionResponseOpenApiSchema
  })
  @ApiResponse({
    status: 400,
    description: "The request body is invalid or does not match the route step id.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: "Authentication, approval, or active brother access is required.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "The brother membership or submittable roadmap step was not found.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: "A pending submission already exists for this step.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  submitBrotherRoadmapStep(
    @Req() request: RequestWithPrincipal,
    @Param("stepId", new ParseUUIDPipe({ version: "4" })) stepId: string,
    @Body(new ZodValidationPipe(createRoadmapSubmissionRequestSchema))
    body: CreateRoadmapSubmissionRequest
  ): Promise<RoadmapSubmissionResponse> {
    return this.roadmapService.submitBrotherRoadmapStep(requirePrincipal(request), stepId, body);
  }

  @Get("admin/roadmap-submissions")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap submissions visible to the current Admin Lite scope.",
    schema: adminRoadmapSubmissionListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminRoadmapSubmissions(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminRoadmapSubmissionListResponse> {
    return this.roadmapService.listAdminRoadmapSubmissions(requirePrincipal(request));
  }

  @Get("admin/roadmap-submissions/:id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap submission detail visible to the current Admin Lite scope.",
    schema: adminRoadmapSubmissionDetailResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The roadmap submission is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getAdminRoadmapSubmission(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminRoadmapSubmissionDetailResponse> {
    return this.roadmapService.getAdminRoadmapSubmission(requirePrincipal(request), id);
  }

  @Patch("admin/roadmap-submissions/:id")
  @UseGuards(CurrentUserGuard)
  @ApiBody({
    schema: reviewRoadmapSubmissionRequestOpenApiSchema
  })
  @ApiOkResponse({
    description: "Reviewed roadmap submission.",
    schema: adminRoadmapSubmissionDetailResponseOpenApiSchema
  })
  @ApiResponse({
    status: 400,
    description: "The roadmap review payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "The current admin cannot review submissions in this scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The roadmap submission is not visible in the current admin scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "The roadmap submission has already been reviewed.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  reviewAdminRoadmapSubmission(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(reviewRoadmapSubmissionRequestSchema))
    body: ReviewRoadmapSubmissionRequest
  ): Promise<AdminRoadmapSubmissionDetailResponse> {
    return this.roadmapService.reviewAdminRoadmapSubmission(
      requirePrincipal(request),
      id,
      body
    );
  }

  @Get("admin/roadmap-assignments")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap assignments visible to Super Admin roadmap configuration.",
    schema: adminRoadmapAssignmentListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Super Admin access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminRoadmapAssignments(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminRoadmapAssignmentListResponse> {
    return this.roadmapService.listAdminRoadmapAssignments(requirePrincipal(request));
  }

  @Post("admin/roadmap-assignments")
  @UseGuards(CurrentUserGuard)
  @ApiBody({
    schema: createAdminRoadmapAssignmentRequestOpenApiSchema
  })
  @ApiCreatedResponse({
    description: "Created roadmap assignment for an eligible candidate or brother.",
    schema: adminRoadmapAssignmentDetailResponseOpenApiSchema
  })
  @ApiResponse({
    status: 400,
    description: "The roadmap assignment payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "Super Admin access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The published roadmap definition or eligible assignee was not found.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "An active roadmap assignment already exists for the same scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  createAdminRoadmapAssignment(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createAdminRoadmapAssignmentRequestSchema))
    body: CreateAdminRoadmapAssignmentRequest
  ): Promise<AdminRoadmapAssignmentDetailResponse> {
    return this.roadmapService.createAdminRoadmapAssignment(requirePrincipal(request), body);
  }

  @Get("admin/roadmap-assignments/:id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap assignment detail visible to Super Admin roadmap configuration.",
    schema: adminRoadmapAssignmentDetailResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Super Admin access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The roadmap assignment was not found.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getAdminRoadmapAssignment(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminRoadmapAssignmentDetailResponse> {
    return this.roadmapService.getAdminRoadmapAssignment(requirePrincipal(request), id);
  }

  @Get("admin/roadmap-definitions")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap definitions visible to Super Admin roadmap configuration.",
    schema: adminRoadmapDefinitionListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Super Admin access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listAdminRoadmapDefinitions(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminRoadmapDefinitionListResponse> {
    return this.roadmapService.listAdminRoadmapDefinitions(requirePrincipal(request));
  }

  @Get("admin/roadmap-definitions/:id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Roadmap definition detail visible to Super Admin roadmap configuration.",
    schema: adminRoadmapDefinitionDetailResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Super Admin access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The roadmap definition was not found.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getAdminRoadmapDefinition(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminRoadmapDefinitionDetailResponse> {
    return this.roadmapService.getAdminRoadmapDefinition(requirePrincipal(request), id);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
