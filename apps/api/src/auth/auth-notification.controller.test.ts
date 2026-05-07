import { describe, expect, it } from "vitest";
import { AuthNotificationController } from "./auth-notification.controller.js";
import type { AuthNotificationService } from "./auth-notification.service.js";
import type {
  RegisterDeviceTokenRequest,
  UpdateNotificationPreferencesRequest
} from "./auth-notification.types.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

const principal: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: ["22222222-2222-4222-8222-222222222222"]
};

describe("AuthNotificationController", () => {
  it("delegates device token registration using the guard-attached principal", async () => {
    const controller = new AuthNotificationController({
      registerDeviceToken: (
        receivedPrincipal: CurrentUserPrincipal,
        body: RegisterDeviceTokenRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body.token).toBe("ExponentPushToken[abcdef1234567890]");

        return Promise.resolve({
          deviceToken: {
            id: "55555555-5555-4555-8555-555555555555",
            platform: body.platform,
            lastSeenAt: "2026-05-07T10:00:00.000Z",
            revokedAt: null
          }
        });
      }
    } as unknown as AuthNotificationService);

    await expect(
      controller.registerDeviceToken(
        { principal },
        {
          platform: "ios",
          token: "ExponentPushToken[abcdef1234567890]"
        }
      )
    ).resolves.toEqual({
      deviceToken: {
        id: "55555555-5555-4555-8555-555555555555",
        platform: "ios",
        lastSeenAt: "2026-05-07T10:00:00.000Z",
        revokedAt: null
      }
    });
  });

  it("delegates notification preference updates", async () => {
    const controller = new AuthNotificationController({
      updateNotificationPreferences: (
        receivedPrincipal: CurrentUserPrincipal,
        body: UpdateNotificationPreferencesRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);

        return Promise.resolve({
          preferences: {
            events: true,
            announcements: body.announcements ?? true,
            roadmapUpdates: true,
            prayerReminders: false
          }
        });
      }
    } as unknown as AuthNotificationService);

    await expect(
      controller.updateNotificationPreferences({ principal }, { announcements: false })
    ).resolves.toEqual({
      preferences: {
        events: true,
        announcements: false,
        roadmapUpdates: true,
        prayerReminders: false
      }
    });
  });

  it("fails fast when CurrentUserGuard did not attach a principal", () => {
    const controller = new AuthNotificationController({} as AuthNotificationService);

    expect(() =>
      controller.registerDeviceToken(
        {},
        {
          platform: "ios",
          token: "ExponentPushToken[abcdef1234567890]"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() =>
      controller.updateNotificationPreferences({}, { announcements: false })
    ).toThrow("CurrentUserGuard");
  });
});
