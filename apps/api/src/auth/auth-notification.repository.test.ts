import { describe, expect, it, vi } from "vitest";
import { PrismaAuthNotificationRepository } from "./auth-notification.repository.js";

const lastSeenAt = new Date("2026-05-07T10:00:00.000Z");
const deviceTokenRecord = {
  id: "55555555-5555-4555-8555-555555555555",
  platform: "ios",
  lastSeenAt,
  revokedAt: null
};

describe("PrismaAuthNotificationRepository", () => {
  it("upserts device tokens by hash and transfers duplicate tokens to the current user", async () => {
    const { deviceTokenUpsert, prisma } = prismaMock();

    await expect(
      new PrismaAuthNotificationRepository(prisma).registerDeviceToken({
        userId: "11111111-1111-4111-8111-111111111111",
        platform: "ios",
        tokenHash: "hashed-token",
        tokenLast4: "890]"
      })
    ).resolves.toEqual({
      id: "55555555-5555-4555-8555-555555555555",
      platform: "ios",
      lastSeenAt: "2026-05-07T10:00:00.000Z",
      revokedAt: null
    });
    expect(deviceTokenUpsert).toHaveBeenCalledWith({
      where: { tokenHash: "hashed-token" },
      create: {
        userId: "11111111-1111-4111-8111-111111111111",
        platform: "ios",
        tokenHash: "hashed-token",
        tokenLast4: "890]",
        lastSeenAt: expect.any(Date) as Date
      },
      update: {
        userId: "11111111-1111-4111-8111-111111111111",
        platform: "ios",
        tokenLast4: "890]",
        lastSeenAt: expect.any(Date) as Date,
        revokedAt: null
      }
    });
  });

  it("upserts changed preferences and returns defaults for missing categories", async () => {
    const { notificationPreferenceFindMany, notificationPreferenceUpsert, transaction, prisma } =
      prismaMock({
        preferences: [
          { category: "announcements", enabled: false },
          { category: "prayer_reminders", enabled: true }
        ]
      });

    await expect(
      new PrismaAuthNotificationRepository(prisma).updateNotificationPreferences(
        "11111111-1111-4111-8111-111111111111",
        {
          announcements: false,
          prayerReminders: true
        }
      )
    ).resolves.toEqual({
      events: true,
      announcements: false,
      roadmapUpdates: true,
      prayerReminders: true
    });
    expect(notificationPreferenceUpsert).toHaveBeenCalledTimes(2);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(notificationPreferenceFindMany).toHaveBeenCalledWith({
      where: { userId: "11111111-1111-4111-8111-111111111111" }
    });
  });

  it("fails fast when Prisma returns unknown persisted enum values", async () => {
    await expect(
      new PrismaAuthNotificationRepository(
        prismaMock({ deviceToken: { ...deviceTokenRecord, platform: "watch" } }).prisma
      ).registerDeviceToken({
        userId: "11111111-1111-4111-8111-111111111111",
        platform: "ios",
        tokenHash: "hashed-token",
        tokenLast4: "890]"
      })
    ).rejects.toThrow("unknown device token platform");

    await expect(
      new PrismaAuthNotificationRepository(
        prismaMock({ preferences: [{ category: "sms", enabled: true }] }).prisma
      ).updateNotificationPreferences("11111111-1111-4111-8111-111111111111", {
        announcements: false
      })
    ).rejects.toThrow("unknown notification preference category");
  });
});

function prismaMock(
  options: {
    deviceToken?: typeof deviceTokenRecord;
    preferences?: Array<{ category: string; enabled: boolean }>;
  } = {}
) {
  const deviceTokenUpsert = vi.fn(() =>
    Promise.resolve(options.deviceToken ?? deviceTokenRecord)
  );
  const notificationPreferenceUpsert = vi.fn(() => Promise.resolve({}));
  const notificationPreferenceFindMany = vi.fn(() => Promise.resolve(options.preferences ?? []));
  const transaction = vi.fn((operations: Array<Promise<unknown>>) => Promise.all(operations));

  return {
    deviceTokenUpsert,
    notificationPreferenceUpsert,
    notificationPreferenceFindMany,
    transaction,
    prisma: {
      deviceToken: {
        upsert: deviceTokenUpsert
      },
      notificationPreference: {
        upsert: notificationPreferenceUpsert,
        findMany: notificationPreferenceFindMany
      },
      $transaction: transaction
    } as never
  };
}
