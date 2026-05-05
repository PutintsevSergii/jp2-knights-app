import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  confirmIdentityAccessReviewSchema,
  rejectIdentityAccessReviewSchema
} from "@jp2/shared-validation";
import { CurrentUserGuard } from "../auth/current-user.guard.js";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  adminIdentityAccessReviewDetailResponseOpenApiSchema,
  adminIdentityAccessReviewListResponseOpenApiSchema,
  confirmIdentityAccessReviewOpenApiSchema,
  expireIdentityAccessReviewsResponseOpenApiSchema,
  rejectIdentityAccessReviewOpenApiSchema
} from "./admin-identity-access.openapi.js";
import { AdminIdentityAccessService } from "./admin-identity-access.service.js";
import type {
  AdminIdentityAccessReviewDetailResponse,
  AdminIdentityAccessReviewListResponse,
  ConfirmIdentityAccessReview,
  RejectIdentityAccessReview
} from "./admin-identity-access.types.js";

@ApiTags("admin-identity-access")
@Controller("admin/identity-access-reviews")
export class AdminIdentityAccessController {
  constructor(private readonly identityAccessService: AdminIdentityAccessService) {}

  @Get()
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Identity access reviews visible to the current admin scope.",
    schema: adminIdentityAccessReviewListResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "The current user does not have Admin Lite access.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  listReviews(@Req() request: RequestWithPrincipal): Promise<AdminIdentityAccessReviewListResponse> {
    return this.identityAccessService.listReviews(requirePrincipal(request));
  }

  @Get(":id")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Identity access review detail visible to the current admin scope.",
    schema: adminIdentityAccessReviewDetailResponseOpenApiSchema
  })
  @ApiParam({ name: "id", schema: { type: "string", format: "uuid" } })
  @ApiResponse({
    status: 403,
    description: "The current user does not have permission to view this review.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The identity access review is not visible in the current scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  getReview(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    return this.identityAccessService.getReview(requirePrincipal(request), id);
  }

  @Post(":id/confirm")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Confirmed identity access review with explicitly assigned local access.",
    schema: adminIdentityAccessReviewDetailResponseOpenApiSchema
  })
  @ApiParam({ name: "id", schema: { type: "string", format: "uuid" } })
  @ApiBody({ schema: confirmIdentityAccessReviewOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The confirmation payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "Country/region approver privilege is required for this scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The identity access review is not visible in the current scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "The identity access review is no longer pending.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  confirmReview(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(confirmIdentityAccessReviewSchema))
    body: ConfirmIdentityAccessReview
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    return this.identityAccessService.confirmReview(requirePrincipal(request), id, body);
  }

  @Post(":id/reject")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Rejected identity access review; the user remains public-only.",
    schema: adminIdentityAccessReviewDetailResponseOpenApiSchema
  })
  @ApiParam({ name: "id", schema: { type: "string", format: "uuid" } })
  @ApiBody({ schema: rejectIdentityAccessReviewOpenApiSchema })
  @ApiResponse({
    status: 400,
    description: "The rejection payload failed validation.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 403,
    description: "Country/region approver privilege is required for this scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 404,
    description: "The identity access review is not visible in the current scope.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  @ApiResponse({
    status: 409,
    description: "The identity access review is no longer pending.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  rejectReview(
    @Req() request: RequestWithPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body(new ZodValidationPipe(rejectIdentityAccessReviewSchema))
    body: RejectIdentityAccessReview
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    return this.identityAccessService.rejectReview(requirePrincipal(request), id, body);
  }

  @Post("expire")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Expired pending identity access reviews past their 30-day window.",
    schema: expireIdentityAccessReviewsResponseOpenApiSchema
  })
  @ApiResponse({
    status: 403,
    description: "Only Super Admin can run global identity review expiry.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  expirePendingReviews(@Req() request: RequestWithPrincipal): Promise<{ expired: number }> {
    return this.identityAccessService.expirePendingReviews(requirePrincipal(request));
  }
}

function requirePrincipal(request: RequestWithPrincipal) {
  if (!request.principal) {
    throw new Error("CurrentUserGuard did not attach a principal.");
  }

  return request.principal;
}
