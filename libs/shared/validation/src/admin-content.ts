import { z } from "zod";
import {
  contentStatusSchema,
  eventStatusSchema,
  hasChronologicalEventDates,
  hasRequiredOrganizationUnitTarget,
  publishableContentBodySchema,
  publishableContentTextSchema,
  visibilitySchema
} from "./common.js";

export const adminPrayerSummarySchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid().nullable(),
  title: z.string().trim().min(1).max(200),
  body: publishableContentBodySchema,
  language: z.string().trim().min(2).max(10),
  visibility: visibilitySchema,
  targetOrganizationUnitId: z.uuid().nullable(),
  status: contentStatusSchema,
  approvedAt: z.iso.datetime().nullable(),
  publishedAt: z.iso.datetime().nullable(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminPrayerListResponseSchema = z.object({
  prayers: z.array(adminPrayerSummarySchema)
});

export const adminPrayerDetailResponseSchema = z.object({
  prayer: adminPrayerSummarySchema
});

export const adminEventSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: publishableContentBodySchema.nullable(),
  type: z.string().trim().min(1).max(80),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  locationLabel: z.string().trim().min(1).max(200).nullable(),
  visibility: visibilitySchema,
  targetOrganizationUnitId: z.uuid().nullable(),
  status: eventStatusSchema,
  approvedAt: z.iso.datetime().nullable(),
  publishedAt: z.iso.datetime().nullable(),
  cancelledAt: z.iso.datetime().nullable(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminEventListResponseSchema = z.object({
  events: z.array(adminEventSummarySchema)
});

export const adminEventDetailResponseSchema = z.object({
  event: adminEventSummarySchema
});

export const adminAnnouncementSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  visibility: visibilitySchema,
  targetOrganizationUnitId: z.uuid().nullable(),
  pinned: z.boolean(),
  status: contentStatusSchema,
  approvedAt: z.iso.datetime().nullable(),
  publishedAt: z.iso.datetime().nullable(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminAnnouncementListResponseSchema = z.object({
  announcements: z.array(adminAnnouncementSummarySchema)
});

export const adminAnnouncementDetailResponseSchema = z.object({
  announcement: adminAnnouncementSummarySchema
});

const adminPrayerWriteBaseSchema = z
  .object({
    categoryId: z.uuid().nullable().optional(),
    title: publishableContentTextSchema,
    body: publishableContentBodySchema,
    language: z.string().trim().min(2).max(10),
    visibility: visibilitySchema,
    targetOrganizationUnitId: z.uuid().nullable().optional(),
    status: contentStatusSchema
  })
  .strict();

export const createAdminPrayerRequestSchema = adminPrayerWriteBaseSchema.refine(
  (value) => value.visibility !== "ORGANIZATION_UNIT" || Boolean(value.targetOrganizationUnitId),
  {
    message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
    path: ["targetOrganizationUnitId"]
  }
);

export const updateAdminPrayerRequestSchema = adminPrayerWriteBaseSchema
  .partial()
  .extend({
    archivedAt: z.iso.datetime().nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one prayer field must be provided."
  })
  .refine(
    (value) => value.visibility !== "ORGANIZATION_UNIT" || Boolean(value.targetOrganizationUnitId),
    {
      message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
      path: ["targetOrganizationUnitId"]
    }
  );

const adminEventWriteBaseSchema = z
  .object({
    title: publishableContentTextSchema,
    description: publishableContentBodySchema.nullable().optional(),
    type: z.string().trim().min(1).max(80),
    startAt: z.iso.datetime(),
    endAt: z.iso.datetime().nullable().optional(),
    locationLabel: z.string().trim().min(1).max(200).nullable().optional(),
    visibility: visibilitySchema,
    targetOrganizationUnitId: z.uuid().nullable().optional(),
    status: eventStatusSchema
  })
  .strict();

export const createAdminEventRequestSchema = adminEventWriteBaseSchema
  .refine(hasRequiredOrganizationUnitTarget, {
    message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
    path: ["targetOrganizationUnitId"]
  })
  .refine(hasChronologicalEventDates, {
    message: "endAt must be at or after startAt.",
    path: ["endAt"]
  });

export const updateAdminEventRequestSchema = adminEventWriteBaseSchema
  .partial()
  .extend({
    approvedAt: z.iso.datetime().nullable().optional(),
    publishedAt: z.iso.datetime().nullable().optional(),
    cancelledAt: z.iso.datetime().nullable().optional(),
    archivedAt: z.iso.datetime().nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one event field must be provided."
  })
  .refine(hasRequiredOrganizationUnitTarget, {
    message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
    path: ["targetOrganizationUnitId"]
  })
  .refine(hasChronologicalEventDates, {
    message: "endAt must be at or after startAt.",
    path: ["endAt"]
  });

const adminAnnouncementWriteBaseSchema = z
  .object({
    title: publishableContentTextSchema,
    body: z.string().trim().min(1).max(2000),
    visibility: visibilitySchema,
    targetOrganizationUnitId: z.uuid().nullable().optional(),
    pinned: z.boolean().optional(),
    status: contentStatusSchema
  })
  .strict();

export const createAdminAnnouncementRequestSchema = adminAnnouncementWriteBaseSchema.refine(
  hasRequiredOrganizationUnitTarget,
  {
    message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
    path: ["targetOrganizationUnitId"]
  }
);

export const updateAdminAnnouncementRequestSchema = adminAnnouncementWriteBaseSchema
  .partial()
  .extend({
    publishedAt: z.iso.datetime().nullable().optional(),
    archivedAt: z.iso.datetime().nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one announcement field must be provided."
  })
  .refine(hasRequiredOrganizationUnitTarget, {
    message: "ORGANIZATION_UNIT visibility requires targetOrganizationUnitId.",
    path: ["targetOrganizationUnitId"]
  });

export type AdminPrayerSummaryDto = z.infer<typeof adminPrayerSummarySchema>;
export type AdminPrayerListResponseDto = z.infer<typeof adminPrayerListResponseSchema>;
export type AdminPrayerDetailResponseDto = z.infer<typeof adminPrayerDetailResponseSchema>;
export type CreateAdminPrayerRequestDto = z.infer<typeof createAdminPrayerRequestSchema>;
export type UpdateAdminPrayerRequestDto = z.infer<typeof updateAdminPrayerRequestSchema>;
export type AdminEventSummaryDto = z.infer<typeof adminEventSummarySchema>;
export type AdminEventListResponseDto = z.infer<typeof adminEventListResponseSchema>;
export type AdminEventDetailResponseDto = z.infer<typeof adminEventDetailResponseSchema>;
export type CreateAdminEventRequestDto = z.infer<typeof createAdminEventRequestSchema>;
export type UpdateAdminEventRequestDto = z.infer<typeof updateAdminEventRequestSchema>;
export type AdminAnnouncementSummaryDto = z.infer<typeof adminAnnouncementSummarySchema>;
export type AdminAnnouncementListResponseDto = z.infer<typeof adminAnnouncementListResponseSchema>;
export type AdminAnnouncementDetailResponseDto = z.infer<
  typeof adminAnnouncementDetailResponseSchema
>;
export type CreateAdminAnnouncementRequestDto = z.infer<
  typeof createAdminAnnouncementRequestSchema
>;
export type UpdateAdminAnnouncementRequestDto = z.infer<
  typeof updateAdminAnnouncementRequestSchema
>;
