import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type {
  DeviceTokenRegistration,
  NotificationPreferenceSettings,
  RegisterDeviceTokenRequest
} from "./auth-notification.types.js";
import {
  mergeNotificationPreferenceRecords,
  notificationPreferenceUpdateEntries,
  type NotificationPreferenceUpdate
} from "./notification-preference-settings.js";

export interface RegisterDeviceTokenInput {
  userId: string;
  platform: RegisterDeviceTokenRequest["platform"];
  tokenHash: string;
  tokenLast4: string;
}

export interface RevokeDeviceTokenInput {
  userId: string;
  tokenHash: string;
  revokedAt: Date;
}

export abstract class AuthNotificationRepository {
  abstract registerDeviceToken(input: RegisterDeviceTokenInput): Promise<DeviceTokenRegistration>;
  abstract revokeDeviceToken(input: RevokeDeviceTokenInput): Promise<boolean>;
  abstract updateNotificationPreferences(
    userId: string,
    updates: NotificationPreferenceUpdate
  ): Promise<NotificationPreferenceSettings>;
}

@Injectable()
export class PrismaAuthNotificationRepository implements AuthNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerDeviceToken(input: RegisterDeviceTokenInput): Promise<DeviceTokenRegistration> {
    const now = new Date();
    const record = await this.prisma.deviceToken.upsert({
      where: { tokenHash: input.tokenHash },
      create: {
        userId: input.userId,
        platform: input.platform,
        tokenHash: input.tokenHash,
        tokenLast4: input.tokenLast4,
        lastSeenAt: now
      },
      update: {
        userId: input.userId,
        platform: input.platform,
        tokenLast4: input.tokenLast4,
        lastSeenAt: now,
        revokedAt: null
      }
    });

    return toDeviceTokenRegistration(record);
  }

  async revokeDeviceToken(input: RevokeDeviceTokenInput): Promise<boolean> {
    const result = await this.prisma.deviceToken.updateMany({
      where: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: input.revokedAt
      }
    });

    return result.count > 0;
  }

  async updateNotificationPreferences(
    userId: string,
    updates: NotificationPreferenceUpdate
  ): Promise<NotificationPreferenceSettings> {
    const entries = notificationPreferenceUpdateEntries(updates);

    await this.prisma.$transaction(
      entries.map(([category, enabled]) =>
        this.prisma.notificationPreference.upsert({
          where: {
            userId_category: {
              userId,
              category
            }
          },
          create: {
            userId,
            category,
            enabled
          },
          update: {
            enabled
          }
        })
      )
    );

    const records = await this.prisma.notificationPreference.findMany({
      where: { userId }
    });

    return mergeNotificationPreferenceRecords(records);
  }
}

interface DeviceTokenRecord {
  id: string;
  platform: string;
  lastSeenAt: Date;
  revokedAt: Date | null;
}

function toDeviceTokenRegistration(record: DeviceTokenRecord): DeviceTokenRegistration {
  return {
    id: record.id,
    platform: toDeviceTokenPlatform(record.platform),
    lastSeenAt: record.lastSeenAt.toISOString(),
    revokedAt: record.revokedAt ? record.revokedAt.toISOString() : null
  };
}

function toDeviceTokenPlatform(value: string): RegisterDeviceTokenRequest["platform"] {
  if (value === "ios" || value === "android" || value === "web") {
    return value;
  }

  throw new Error("Repository returned an unknown device token platform.");
}
