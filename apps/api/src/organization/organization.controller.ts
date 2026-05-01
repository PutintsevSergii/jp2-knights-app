import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import {
  createOrganizationUnitRequestSchema,
  updateOrganizationUnitRequestSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminOrganizationUnitListResponseOpenApiSchema,
  createOrganizationUnitRequestOpenApiSchema,
  myOrganizationUnitsResponseOpenApiSchema,
  organizationUnitDetailResponseOpenApiSchema,
  updateOrganizationUnitRequestOpenApiSchema
} from "./organization.openapi.js";
import { OrganizationService } from "./organization.service.js";
import type {
  AdminOrganizationUnitListResponse,
  CreateOrganizationUnitRequest,
  MyOrganizationUnitsResponse,
  OrganizationUnitDetailResponse,
  UpdateOrganizationUnitRequest
} from "./organization.types.js";

@ApiTags("organization")
@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get("brother/my-organization-units")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Active organization units for the current brother user.",
    schema: myOrganizationUnitsResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user is not an active brother.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "No active membership organization unit exists for the current brother.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  getMyOrganizationUnits(
    @Req() request: RequestWithPrincipal
  ): Promise<MyOrganizationUnitsResponse> {
    return this.organizationService.getMyOrganizationUnits(requirePrincipal(request));
  }

  @Get("admin/organization-units")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Active organization units visible to the current admin scope.",
    schema: adminOrganizationUnitListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  listAdminOrganizationUnits(
    @Req() request: RequestWithPrincipal
  ): Promise<AdminOrganizationUnitListResponse> {
    return this.organizationService.listAdminOrganizationUnits(requirePrincipal(request));
  }

  @Post("admin/organization-units")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Created organization unit record.",
    schema: organizationUnitDetailResponseOpenApiSchema
  })
  @ApiBody({
    schema: createOrganizationUnitRequestOpenApiSchema
  })
  @ApiResponse({
    status: 400,
    description: "The organization unit create payload failed validation.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: "Only Super Admin can create organization unit records.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  createAdminOrganizationUnit(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(createOrganizationUnitRequestSchema))
    body: CreateOrganizationUnitRequest
  ): Promise<OrganizationUnitDetailResponse> {
    return this.organizationService.createAdminOrganizationUnit(requirePrincipal(request), body);
  }

  @Patch("admin/organization-units/:id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Updated organization unit record.",
    schema: organizationUnitDetailResponseOpenApiSchema
  })
  @ApiParam({
    name: "id",
    schema: { type: "string", format: "uuid" }
  })
  @ApiBody({
    schema: updateOrganizationUnitRequestOpenApiSchema
  })
  @ApiResponse({
    status: 400,
    description: "The organization unit update payload failed validation.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: "Only Super Admin can update or archive organization unit records.",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema
      }
    }
  })
  updateAdminOrganizationUnit(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(updateOrganizationUnitRequestSchema))
    body: UpdateOrganizationUnitRequest
  ): Promise<OrganizationUnitDetailResponse> {
    return this.organizationService.updateAdminOrganizationUnit(requirePrincipal(request), id, body);
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
