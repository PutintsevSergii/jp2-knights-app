import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  createRoadmapSubmissionRequestSchema,
  reviewRoadmapSubmissionRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminRoadmapSubmissionDetailResponseOpenApiSchema,
  adminRoadmapSubmissionListResponseOpenApiSchema,
  assignedRoadmapResponseOpenApiSchema,
  createRoadmapSubmissionRequestOpenApiSchema,
  reviewRoadmapSubmissionRequestOpenApiSchema,
  roadmapSubmissionResponseOpenApiSchema
} from "./roadmap.openapi.js";
import { RoadmapService } from "./roadmap.service.js";
import type {
  AdminRoadmapSubmissionDetailResponse,
  AdminRoadmapSubmissionListResponse,
  AssignedRoadmapResponse,
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
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
