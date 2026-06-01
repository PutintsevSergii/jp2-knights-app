import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuthNotificationRepository } from "./auth-notification.repository.js";
import { AuthNotificationService, hashDeviceToken } from "./auth-notification.service.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

describe("AuthNotificationService", () => {
  it("registers device tokens by hash for the current approved private user", async () => {
    const repository = new FakeAuthNotificationRepository();
    const service = new AuthNotificationService(repository);

    await expect(
      service.registerDeviceToken(candidatePrincipal(), {
        platform: "ios",
        token: "ExponentPushToken[abcdef1234567890]"
      })
    ).resolves.toEqual({
      deviceToken: {
        id: "55555555-5555-4555-8555-555555555555",
        platform: "ios",
        lastSeenAt: "2026-05-07T10:00:00.000Z",
        revokedAt: null
      }
    });
    expect(repository.registered).toEqual([
      {
        userId: "11111111-1111-4111-8111-111111111111",
        platform: "ios",
        tokenHash: hashDeviceToken("ExponentPushToken[abcdef1234567890]"),
        tokenLast4: "890]"
      }
    ]);
  });

  it("updates notification preferences only for candidates and brothers", async () => {
    const service = new AuthNotificationService(new FakeAuthNotificationRepository());

    await expect(
      service.updateNotificationPreferences(brotherPrincipal(), {
        announcements: false,
        prayerReminders: true
      })
    ).resolves.toEqual({
      preferences: {
        events: true,
        announcements: false,
        roadmapUpdates: true,
        prayerReminders: true
      }
    });
    await expect(
      service.updateNotificationPreferences(
        { ...brotherPrincipal(), roles: ["OFFICER"] },
        { announcements: false }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("revokes the current private user's device token by hash without returning token material", async () => {
    const repository = new FakeAuthNotificationRepository();
    const service = new AuthNotificationService(repository);

    const response = await service.revokeDeviceToken(candidatePrincipal(), {
      token: "ExponentPushToken[abcdef1234567890]"
    });

    expect(response).toEqual({
      revoked: true,
      revokedAt: response.revokedAt
    });
    expect(typeof response.revokedAt).toBe("string");
    expect(repository.revoked).toEqual([
      {
        userId: "11111111-1111-4111-8111-111111111111",
        tokenHash: hashDeviceToken("ExponentPushToken[abcdef1234567890]"),
        revokedAt: expect.any(Date) as Date
      }
    ]);
    expect(JSON.stringify(repository.revoked)).not.toContain("ExponentPushToken");
  });

  it("returns an idempotent no-op response when the current user's token is not active", async () => {
    const repository = new FakeAuthNotificationRepository();
    repository.revokeResult = false;
    const service = new AuthNotificationService(repository);

    await expect(
      service.revokeDeviceToken(candidatePrincipal(), {
        token: "ExponentPushToken[abcdef1234567890]"
      })
    ).resolves.toEqual({
      revoked: false,
      revokedAt: null
    });
  });

  it("rejects idle approval principals before storing tokens or preferences", async () => {
    const service = new AuthNotificationService(new FakeAuthNotificationRepository());
    const principal = {
      ...candidatePrincipal(),
      roles: [],
      approval: {
        state: "pending" as const,
        expiresAt: "2026-06-01T00:00:00.000Z",
        scopeOrganizationUnitId: null
      }
    };

    await expect(
      service.registerDeviceToken(principal, {
        platform: "android",
        token: "ExponentPushToken[abcdef1234567890]"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateNotificationPreferences(principal, { events: false })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.revokeDeviceToken(principal, {
        token: "ExponentPushToken[abcdef1234567890]"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

class FakeAuthNotificationRepository implements AuthNotificationRepository {
  revokeResult = true;
  readonly registered: Array<{
    userId: string;
    platform: "ios" | "android" | "web";
    tokenHash: string;
    tokenLast4: string;
  }> = [];
  readonly revoked: Array<{
    userId: string;
    tokenHash: string;
    revokedAt: Date;
  }> = [];

  registerDeviceToken(input: {
    userId: string;
    platform: "ios" | "android" | "web";
    tokenHash: string;
    tokenLast4: string;
  }) {
    this.registered.push(input);

    return Promise.resolve({
      id: "55555555-5555-4555-8555-555555555555",
      platform: input.platform,
      lastSeenAt: "2026-05-07T10:00:00.000Z",
      revokedAt: null
    });
  }

  revokeDeviceToken(input: { userId: string; tokenHash: string; revokedAt: Date }) {
    this.revoked.push(input);

    return Promise.resolve(this.revokeResult);
  }

  updateNotificationPreferences(
    _userId: string,
    updates: {
      events?: boolean;
      announcements?: boolean;
      roadmapUpdates?: boolean;
      prayerReminders?: boolean;
    }
  ) {
    return Promise.resolve({
      events: true,
      announcements: updates.announcements ?? true,
      roadmapUpdates: true,
      prayerReminders: updates.prayerReminders ?? false
    });
  }
}

function candidatePrincipal(): CurrentUserPrincipal {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    email: "candidate@example.test",
    displayName: "Demo Candidate",
    status: "active",
    roles: ["CANDIDATE"],
    candidateOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
  };
}

function brotherPrincipal(): CurrentUserPrincipal {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    email: "brother@example.test",
    displayName: "Demo Brother",
    status: "active",
    roles: ["BROTHER"],
    memberOrganizationUnitIds: ["22222222-2222-4222-8222-222222222222"]
  };
}
