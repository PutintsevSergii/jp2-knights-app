import { createHash } from "node:crypto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { assertNotIdleApprovalPrincipal } from "./idle-approval.exception.js";
import { AuthNotificationRepository } from "./auth-notification.repository.js";
import type {
  DeviceTokenRegistrationResponse,
  NotificationPreferencesResponse,
  RegisterDeviceTokenRequest,
  UpdateNotificationPreferencesRequest
} from "./auth-notification.types.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

@Injectable()
export class AuthNotificationService {
  constructor(private readonly authNotificationRepository: AuthNotificationRepository) {}

  async registerDeviceToken(
    principal: CurrentUserPrincipal,
    data: RegisterDeviceTokenRequest
  ): Promise<DeviceTokenRegistrationResponse> {
    assertNotIdleApprovalPrincipal(principal);
    assertHasAnyPrivateRole(principal);

    const token = data.token.trim();
    const registration = await this.authNotificationRepository.registerDeviceToken({
      userId: principal.id,
      platform: data.platform,
      tokenHash: hashDeviceToken(token),
      tokenLast4: token.slice(-4)
    });

    return {
      deviceToken: registration
    };
  }

  async updateNotificationPreferences(
    principal: CurrentUserPrincipal,
    data: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    assertNotIdleApprovalPrincipal(principal);
    assertCanConfigureNotificationPreferences(principal);

    return {
      preferences: await this.authNotificationRepository.updateNotificationPreferences(
        principal.id,
        data
      )
    };
  }
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function assertHasAnyPrivateRole(principal: CurrentUserPrincipal): void {
  if (principal.roles.length === 0) {
    throw new ForbiddenException("Private app access is required to register device tokens.");
  }
}

function assertCanConfigureNotificationPreferences(principal: CurrentUserPrincipal): void {
  if (!principal.roles.includes("CANDIDATE") && !principal.roles.includes("BROTHER")) {
    throw new ForbiddenException(
      "Candidate or brother access is required to configure notification preferences."
    );
  }
}
