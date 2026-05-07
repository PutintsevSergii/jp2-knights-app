import type {
  DeviceTokenRegistrationResponseDto,
  NotificationPreferencesResponseDto,
  RegisterDeviceTokenRequestDto,
  UpdateNotificationPreferencesRequestDto
} from "@jp2/shared-validation";

export type RegisterDeviceTokenRequest = RegisterDeviceTokenRequestDto;
export type DeviceTokenRegistrationResponse = DeviceTokenRegistrationResponseDto;
export type UpdateNotificationPreferencesRequest = UpdateNotificationPreferencesRequestDto;
export type NotificationPreferencesResponse = NotificationPreferencesResponseDto;

export interface DeviceTokenRegistration {
  id: string;
  platform: RegisterDeviceTokenRequest["platform"];
  lastSeenAt: string;
  revokedAt: string | null;
}

export interface NotificationPreferenceSettings {
  events: boolean;
  announcements: boolean;
  roadmapUpdates: boolean;
  prayerReminders: boolean;
}
