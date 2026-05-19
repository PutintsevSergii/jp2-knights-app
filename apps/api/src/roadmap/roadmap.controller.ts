import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { createRoadmapSubmissionRequestSchema } from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  assignedRoadmapResponseOpenApiSchema,
  createRoadmapSubmissionRequestOpenApiSchema,
  roadmapSubmissionResponseOpenApiSchema
} from "./roadmap.openapi.js";
import { RoadmapService } from "./roadmap.service.js";
import type {
  AssignedRoadmapResponse,
  CreateRoadmapSubmissionRequest,
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
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
