import { Body, Controller, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  registerDeviceTokenRequestSchema,
  updateNotificationPreferencesRequestSchema
} from "@jp2/shared-validation";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  deviceTokenRegistrationResponseOpenApiSchema,
  notificationPreferencesResponseOpenApiSchema,
  registerDeviceTokenRequestOpenApiSchema,
  updateNotificationPreferencesRequestOpenApiSchema
} from "./auth.openapi.js";
import { AuthNotificationService } from "./auth-notification.service.js";
import type {
  DeviceTokenRegistrationResponse,
  NotificationPreferencesResponse,
  RegisterDeviceTokenRequest,
  UpdateNotificationPreferencesRequest
} from "./auth-notification.types.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import type { RequestWithPrincipal } from "./current-user.types.js";

@ApiTags("auth")
@Controller("auth")
export class AuthNotificationController {
  constructor(private readonly authNotificationService: AuthNotificationService) {}

  @Post("device-tokens")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Device token registered for the current authenticated user.",
    schema: deviceTokenRegistrationResponseOpenApiSchema
  })
  @ApiBody({ schema: registerDeviceTokenRequestOpenApiSchema })
  @ApiResponse({
    status: 403,
    description: "Authentication, active account, or approved private app access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  registerDeviceToken(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(registerDeviceTokenRequestSchema)) body: RegisterDeviceTokenRequest
  ): Promise<DeviceTokenRegistrationResponse> {
    return this.authNotificationService.registerDeviceToken(requirePrincipal(request), body);
  }

  @Put("notification-preferences")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Notification preferences updated for the current candidate or brother.",
    schema: notificationPreferencesResponseOpenApiSchema
  })
  @ApiBody({ schema: updateNotificationPreferencesRequestOpenApiSchema })
  @ApiResponse({
    status: 403,
    description: "Candidate or brother access is required.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  updateNotificationPreferences(
    @Req() request: RequestWithPrincipal,
    @Body(new ZodValidationPipe(updateNotificationPreferencesRequestSchema))
    body: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    return this.authNotificationService.updateNotificationPreferences(
      requirePrincipal(request),
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
