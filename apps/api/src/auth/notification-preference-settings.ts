import type { NotificationPreferenceSettings } from "./auth-notification.types.js";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceSettings = {
  events: true,
  announcements: true,
  roadmapUpdates: true,
  prayerReminders: false
};

export type NotificationPreferenceUpdate = {
  [Key in keyof NotificationPreferenceSettings]?: NotificationPreferenceSettings[Key] | undefined;
};

export interface NotificationPreferenceRecord {
  category: string;
  enabled: boolean;
}

export type StoredNotificationCategory =
  | "events"
  | "announcements"
  | "roadmap_updates"
  | "prayer_reminders";

export function mergeNotificationPreferenceRecords(
  records: readonly NotificationPreferenceRecord[]
): NotificationPreferenceSettings {
  const preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };

  for (const record of records) {
    preferences[preferenceKeyForCategory(record.category)] = record.enabled;
  }

  return preferences;
}

export function notificationPreferenceUpdateEntries(
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

function preferenceKeyForCategory(category: string): keyof NotificationPreferenceSettings {
  if (category === "events") return "events";
  if (category === "announcements") return "announcements";
  if (category === "roadmap_updates") return "roadmapUpdates";
  if (category === "prayer_reminders") return "prayerReminders";

  throw new Error("Repository returned an unknown notification preference category.");
}
