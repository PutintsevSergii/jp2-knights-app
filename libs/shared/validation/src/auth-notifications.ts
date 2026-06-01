import { z } from "zod";
import { deviceTokenPlatformSchema, roleSchema, userStatusSchema } from "./common.js";

export const authSessionRequestSchema = z
  .object({
    idToken: z.string().trim().min(1).max(8192),
    csrfToken: z.string().trim().min(16).max(512).optional()
  })
  .strict();

export const currentUserResponseSchema = z
  .object({
    user: z
      .object({
        id: z.string().trim().min(1),
        email: z.email(),
        displayName: z.string().trim().min(1),
        preferredLanguage: z.string().trim().min(1).nullable(),
        status: userStatusSchema,
        roles: z.array(roleSchema)
      })
      .strict(),
    access: z
      .object({
        mobileMode: z.enum(["public", "candidate", "brother"]),
        adminLite: z.boolean(),
        candidateOrganizationUnitId: z.uuid().nullable(),
        memberOrganizationUnitIds: z.array(z.uuid()),
        officerOrganizationUnitIds: z.array(z.uuid()),
        approval: z
          .object({
            state: z.enum(["pending", "rejected", "expired"]),
            expiresAt: z.iso.datetime().nullable(),
            scopeOrganizationUnitId: z.uuid().nullable()
          })
          .strict()
          .nullable()
      })
      .strict()
  })
  .strict();

export const authSessionResponseSchema = z
  .object({
    currentUser: currentUserResponseSchema,
    session: z
      .object({
        transport: z.enum(["bearer", "cookie"]),
        expiresAt: z.iso.datetime().nullable()
      })
      .strict()
  })
  .strict();

export const registerDeviceTokenRequestSchema = z
  .object({
    platform: deviceTokenPlatformSchema,
    token: z.string().trim().min(16).max(4096)
  })
  .strict();

export const revokeDeviceTokenRequestSchema = z
  .object({
    token: z.string().trim().min(16).max(4096)
  })
  .strict();

export const deviceTokenRegistrationResponseSchema = z
  .object({
    deviceToken: z
      .object({
        id: z.uuid(),
        platform: deviceTokenPlatformSchema,
        lastSeenAt: z.iso.datetime(),
        revokedAt: z.iso.datetime().nullable()
      })
      .strict()
  })
  .strict();

export const deviceTokenRevocationResponseSchema = z
  .object({
    revoked: z.boolean(),
    revokedAt: z.iso.datetime().nullable()
  })
  .strict();

export const notificationPreferenceSettingsSchema = z
  .object({
    events: z.boolean(),
    announcements: z.boolean(),
    roadmapUpdates: z.boolean(),
    prayerReminders: z.boolean()
  })
  .strict();

export const updateNotificationPreferencesRequestSchema = notificationPreferenceSettingsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one notification preference must be provided."
  });

export const notificationPreferencesResponseSchema = z
  .object({
    preferences: notificationPreferenceSettingsSchema
  })
  .strict();

export type AuthSessionRequestDto = z.infer<typeof authSessionRequestSchema>;
export type AuthSessionResponseDto = z.infer<typeof authSessionResponseSchema>;
export type CurrentUserResponseDto = z.infer<typeof currentUserResponseSchema>;
export type RegisterDeviceTokenRequestDto = z.infer<typeof registerDeviceTokenRequestSchema>;
export type RevokeDeviceTokenRequestDto = z.infer<typeof revokeDeviceTokenRequestSchema>;
export type DeviceTokenRegistrationResponseDto = z.infer<
  typeof deviceTokenRegistrationResponseSchema
>;
export type DeviceTokenRevocationResponseDto = z.infer<
  typeof deviceTokenRevocationResponseSchema
>;
export type NotificationPreferenceSettingsDto = z.infer<
  typeof notificationPreferenceSettingsSchema
>;
export type UpdateNotificationPreferencesRequestDto = z.infer<
  typeof updateNotificationPreferencesRequestSchema
>;
export type NotificationPreferencesResponseDto = z.infer<
  typeof notificationPreferencesResponseSchema
>;
