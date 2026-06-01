import type {
  DeviceTokenRegistrationResponseDto,
  DeviceTokenRevocationResponseDto,
  NotificationPreferencesResponseDto,
  RegisterDeviceTokenRequestDto,
  RevokeDeviceTokenRequestDto,
  UpdateNotificationPreferencesRequestDto
} from "@jp2/shared-validation";

export type RegisterDeviceTokenRequest = RegisterDeviceTokenRequestDto;
export type RevokeDeviceTokenRequest = RevokeDeviceTokenRequestDto;
export type DeviceTokenRegistrationResponse = DeviceTokenRegistrationResponseDto;
export type DeviceTokenRevocationResponse = DeviceTokenRevocationResponseDto;
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
