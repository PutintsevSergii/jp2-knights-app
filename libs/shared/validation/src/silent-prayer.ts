import { z } from "zod";
import {
  contentStatusSchema,
  hasRequiredOrganizationUnitTarget,
  publishableContentBodySchema,
  publishableContentTextSchema,
  visibilitySchema
} from "./common.js";

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

export const adminSilentPrayerEventSummarySchema = z
  .object({
    id: z.uuid(),
    title: publishableContentTextSchema,
    intention: publishableContentBodySchema.nullable(),
    visibility: visibilitySchema,
    targetOrganizationUnitId: z.uuid().nullable(),
    status: contentStatusSchema,
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime().nullable(),
    approvedAt: z.iso.datetime().nullable(),
    publishedAt: z.iso.datetime().nullable(),
    cancelledAt: z.iso.datetime().nullable(),
    archivedAt: z.iso.datetime().nullable()
  })
  .strict();

export const adminSilentPrayerEventListResponseSchema = z
  .object({
    silentPrayerEvents: z.array(adminSilentPrayerEventSummarySchema)
  })
  .strict();

export const adminSilentPrayerEventDetailResponseSchema = z
  .object({
    silentPrayerEvent: adminSilentPrayerEventSummarySchema
  })
  .strict();

const adminSilentPrayerEventWriteBaseSchema = z
  .object({
    title: publishableContentTextSchema,
    intention: publishableContentBodySchema.nullable().optional(),
    visibility: visibilitySchema,
    targetOrganizationUnitId: z.uuid().nullable().optional(),
    status: contentStatusSchema,
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime().nullable().optional()
  })
  .strict();

export const createAdminSilentPrayerEventRequestSchema =
  adminSilentPrayerEventWriteBaseSchema
    .refine(hasRequiredOrganizationUnitTarget, {
      message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
      path: ["targetOrganizationUnitId"]
    })
    .refine(hasChronologicalSilentPrayerDates, {
      message: "endsAt must be at or after startsAt.",
      path: ["endsAt"]
    });

export const updateAdminSilentPrayerEventRequestSchema =
  adminSilentPrayerEventWriteBaseSchema
    .partial()
    .extend({
      approvedAt: z.iso.datetime().nullable().optional(),
      publishedAt: z.iso.datetime().nullable().optional(),
      cancelledAt: z.iso.datetime().nullable().optional(),
      archivedAt: z.iso.datetime().nullable().optional()
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one silent-prayer event field must be provided."
    })
    .refine(hasRequiredOrganizationUnitTarget, {
      message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
      path: ["targetOrganizationUnitId"]
    })
    .refine(hasChronologicalSilentPrayerDates, {
      message: "endsAt must be at or after startsAt.",
      path: ["endsAt"]
    });

function hasChronologicalSilentPrayerDates(value: {
  startsAt?: string | undefined;
  endsAt?: string | null | undefined;
}) {
  return !value.startsAt || !value.endsAt || Date.parse(value.endsAt) >= Date.parse(value.startsAt);
}

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
export type AdminSilentPrayerEventSummaryDto = z.infer<
  typeof adminSilentPrayerEventSummarySchema
>;
export type AdminSilentPrayerEventListResponseDto = z.infer<
  typeof adminSilentPrayerEventListResponseSchema
>;
export type AdminSilentPrayerEventDetailResponseDto = z.infer<
  typeof adminSilentPrayerEventDetailResponseSchema
>;
export type CreateAdminSilentPrayerEventRequestDto = z.infer<
  typeof createAdminSilentPrayerEventRequestSchema
>;
export type UpdateAdminSilentPrayerEventRequestDto = z.infer<
  typeof updateAdminSilentPrayerEventRequestSchema
>;
