import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { assignedRoadmapResponseOpenApiSchema } from "./roadmap.openapi.js";
import { RoadmapService } from "./roadmap.service.js";
import type { AssignedRoadmapResponse } from "./roadmap.types.js";

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
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
