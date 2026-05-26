import { z } from "zod";

export const silentPrayerPaginationQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(1000).default(0)
  })
  .strict();

export const silentPrayerEventIdSchema = z.uuid();

export const publicSilentPrayerJoinRequestSchema = z
  .object({
    anonymousSessionId: z.string().trim().min(1).max(120)
  })
  .strict();

export const publicSilentPrayerSocketJoinPayloadSchema =
  publicSilentPrayerJoinRequestSchema
    .extend({
      eventId: silentPrayerEventIdSchema
    })
    .strict();

export const silentPrayerSocketEventPayloadSchema = z
  .object({
    eventId: silentPrayerEventIdSchema
  })
  .strict();

export const silentPrayerPresenceSchema = z
  .object({
    eventId: z.uuid(),
    activeCount: z.number().int().min(0),
    expiresAt: z.iso.datetime(),
    socketRoom: z.string().trim().min(1).max(240)
  })
  .strict();

export const publicSilentPrayerEventSummarySchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    intention: z.string().trim().min(1).max(1000).nullable(),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime().nullable(),
    visibility: z.enum(["PUBLIC", "FAMILY_OPEN"]),
    activeCount: z.number().int().min(0)
  })
  .strict();

export const brotherSilentPrayerEventSummarySchema = publicSilentPrayerEventSummarySchema
  .extend({
    visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]),
    targetOrganizationUnitId: z.uuid().nullable()
  })
  .strict();

export const publicSilentPrayerListResponseSchema = z
  .object({
    sessions: z.array(publicSilentPrayerEventSummarySchema),
    pagination: z
      .object({
        limit: z.number().int().min(1).max(50),
        offset: z.number().int().min(0).max(1000)
      })
      .strict()
  })
  .strict();

export const brotherSilentPrayerListResponseSchema = z
  .object({
    sessions: z.array(brotherSilentPrayerEventSummarySchema),
    pagination: z
      .object({
        limit: z.number().int().min(1).max(50),
        offset: z.number().int().min(0).max(1000)
      })
      .strict()
  })
  .strict();

export const publicSilentPrayerJoinResponseSchema = z
  .object({
    session: publicSilentPrayerEventSummarySchema,
    presence: silentPrayerPresenceSchema
  })
  .strict();

export const brotherSilentPrayerJoinResponseSchema = z
  .object({
    session: brotherSilentPrayerEventSummarySchema,
    presence: silentPrayerPresenceSchema
  })
  .strict();

export type SilentPrayerPaginationQueryDto = z.infer<
  typeof silentPrayerPaginationQuerySchema
>;
export type PublicSilentPrayerJoinRequestDto = z.infer<
  typeof publicSilentPrayerJoinRequestSchema
>;
export type PublicSilentPrayerSocketJoinPayloadDto = z.infer<
  typeof publicSilentPrayerSocketJoinPayloadSchema
>;
export type SilentPrayerSocketEventPayloadDto = z.infer<
  typeof silentPrayerSocketEventPayloadSchema
>;
export type SilentPrayerPresenceDto = z.infer<typeof silentPrayerPresenceSchema>;
export type PublicSilentPrayerEventSummaryDto = z.infer<
  typeof publicSilentPrayerEventSummarySchema
>;
export type BrotherSilentPrayerEventSummaryDto = z.infer<
  typeof brotherSilentPrayerEventSummarySchema
>;
export type PublicSilentPrayerListResponseDto = z.infer<
  typeof publicSilentPrayerListResponseSchema
>;
export type BrotherSilentPrayerListResponseDto = z.infer<
  typeof brotherSilentPrayerListResponseSchema
>;
export type PublicSilentPrayerJoinResponseDto = z.infer<
  typeof publicSilentPrayerJoinResponseSchema
>;
export type BrotherSilentPrayerJoinResponseDto = z.infer<
  typeof brotherSilentPrayerJoinResponseSchema
>;
