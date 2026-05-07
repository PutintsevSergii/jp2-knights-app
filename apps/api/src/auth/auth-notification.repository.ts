import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type {
  DeviceTokenRegistration,
  NotificationPreferenceSettings,
  RegisterDeviceTokenRequest
} from "./auth-notification.types.js";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceSettings = {
  events: true,
  announcements: true,
  roadmapUpdates: true,
  prayerReminders: false
};

export type NotificationPreferenceUpdate = {
  [Key in keyof NotificationPreferenceSettings]?: NotificationPreferenceSettings[Key] | undefined;
};

export interface RegisterDeviceTokenInput {
  userId: string;
  platform: RegisterDeviceTokenRequest["platform"];
  tokenHash: string;
  tokenLast4: string;
}

export abstract class AuthNotificationRepository {
  abstract registerDeviceToken(input: RegisterDeviceTokenInput): Promise<DeviceTokenRegistration>;
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

  async updateNotificationPreferences(
    userId: string,
    updates: NotificationPreferenceUpdate
  ): Promise<NotificationPreferenceSettings> {
    const entries = preferenceUpdateEntries(updates);

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

    return mergePreferenceRecords(records);
  }
}

interface DeviceTokenRecord {
  id: string;
  platform: string;
  lastSeenAt: Date;
  revokedAt: Date | null;
}

interface NotificationPreferenceRecord {
  category: string;
  enabled: boolean;
}

function toDeviceTokenRegistration(record: DeviceTokenRecord): DeviceTokenRegistration {
  return {
    id: record.id,
    platform: toDeviceTokenPlatform(record.platform),
    lastSeenAt: record.lastSeenAt.toISOString(),
    revokedAt: record.revokedAt ? record.revokedAt.toISOString() : null
  };
}

function mergePreferenceRecords(
  records: readonly NotificationPreferenceRecord[]
): NotificationPreferenceSettings {
  const preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };

  for (const record of records) {
    preferences[preferenceKeyForCategory(record.category)] = record.enabled;
  }

  return preferences;
}

function preferenceUpdateEntries(
  updates: NotificationPreferenceUpdate
): Array<[StoredNotificationCategory, boolean]> {
  const entries: Array<[StoredNotificationCategory, boolean]> = [];

  if (updates.events !== undefined) entries.push(["events", updates.events]);
  if (updates.announcements !== undefined) {
    entries.push(["announcements", updates.announcements]);
  }
  if (updates.roadmapUpdates !== undefined) {
    entries.push(["roadmap_updates", updates.roadmapUpdates]);
  }
  if (updates.prayerReminders !== undefined) {
    entries.push(["prayer_reminders", updates.prayerReminders]);
  }

  return entries;
}

type StoredNotificationCategory =
  | "events"
  | "announcements"
  | "roadmap_updates"
  | "prayer_reminders";

function preferenceKeyForCategory(category: string): keyof NotificationPreferenceSettings {
  if (category === "events") return "events";
  if (category === "announcements") return "announcements";
  if (category === "roadmap_updates") return "roadmapUpdates";
  if (category === "prayer_reminders") return "prayerReminders";

  throw new Error("Repository returned an unknown notification preference category.");
}

function toDeviceTokenPlatform(value: string): RegisterDeviceTokenRequest["platform"] {
  if (value === "ios" || value === "android" || value === "web") {
    return value;
  }

  throw new Error("Repository returned an unknown device token platform.");
}
