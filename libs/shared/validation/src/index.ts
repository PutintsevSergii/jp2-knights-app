import { z } from "zod";
import {
  ATTACHMENT_STATUSES,
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_REQUEST_STATUSES,
  CONTENT_STATUSES,
  EVENT_STATUSES,
  MEMBERSHIP_STATUSES,
  ORGANIZATION_UNIT_STATUSES,
  ORGANIZATION_UNIT_TYPES,
  PARTICIPATION_STATUSES,
  ROADMAP_SUBMISSION_STATUSES,
  ROLES,
  RUNTIME_MODES,
  USER_STATUSES,
  VISIBILITIES
} from "@jp2/shared-types";

export const runtimeModeSchema = z.enum(RUNTIME_MODES);
export const roleSchema = z.enum(ROLES);
export const userStatusSchema = z.enum(USER_STATUSES);
export const organizationUnitTypeSchema = z.enum(ORGANIZATION_UNIT_TYPES);
export const organizationUnitStatusSchema = z.enum(ORGANIZATION_UNIT_STATUSES);
export const membershipStatusSchema = z.enum(MEMBERSHIP_STATUSES);
export const visibilitySchema = z.enum(VISIBILITIES);
export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export const candidateRequestStatusSchema = z.enum(CANDIDATE_REQUEST_STATUSES);
export const candidateProfileStatusSchema = z.enum(CANDIDATE_PROFILE_STATUSES);
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export const participationStatusSchema = z.enum(PARTICIPATION_STATUSES);
export const roadmapSubmissionStatusSchema = z.enum(ROADMAP_SUBMISSION_STATUSES);
export const attachmentStatusSchema = z.enum(ATTACHMENT_STATUSES);

export const healthStatusSchema = z.object({
  app: z.enum(["api", "admin", "mobile"]),
  runtimeMode: runtimeModeSchema,
  status: z.literal("ok")
});

const organizationUnitTextSchema = z.string().trim().min(1).max(200);
const nullableOrganizationUnitTextSchema = z.string().trim().min(1).max(200).nullable();

export const organizationUnitSummarySchema = z.object({
  id: z.uuid(),
  type: organizationUnitTypeSchema,
  parentUnitId: z.uuid().nullable(),
  name: organizationUnitTextSchema,
  city: organizationUnitTextSchema,
  country: organizationUnitTextSchema,
  parish: z.string().trim().min(1).max(200).nullable(),
  publicDescription: z.string().trim().min(1).max(2000).nullable(),
  status: organizationUnitStatusSchema
});

export const createOrganizationUnitRequestSchema = z
  .object({
    type: organizationUnitTypeSchema.default("CHORAGIEW"),
    parentUnitId: z.uuid().nullable().optional(),
    name: organizationUnitTextSchema,
    city: organizationUnitTextSchema,
    country: organizationUnitTextSchema,
    parish: nullableOrganizationUnitTextSchema.optional(),
    publicDescription: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict();

export const updateOrganizationUnitRequestSchema = z
  .object({
    type: organizationUnitTypeSchema.optional(),
    parentUnitId: z.uuid().nullable().optional(),
    name: organizationUnitTextSchema.optional(),
    city: organizationUnitTextSchema.optional(),
    country: organizationUnitTextSchema.optional(),
    parish: nullableOrganizationUnitTextSchema.optional(),
    publicDescription: z.string().trim().min(1).max(2000).nullable().optional(),
    status: organizationUnitStatusSchema.optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one organization unit field must be provided."
  });

export const myOrganizationUnitsResponseSchema = z.object({
  organizationUnits: z.array(organizationUnitSummarySchema)
});

export const adminOrganizationUnitListResponseSchema = z.object({
  organizationUnits: z.array(organizationUnitSummarySchema)
});

export const organizationUnitDetailResponseSchema = z.object({
  organizationUnit: organizationUnitSummarySchema
});

const publishableContentTextSchema = z.string().trim().min(1).max(200);
const publishableContentBodySchema = z.string().trim().min(1).max(8000);

export const adminPrayerSummarySchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid().nullable(),
  title: z.string().trim().min(1).max(200),
  body: publishableContentBodySchema,
  language: z.string().trim().min(2).max(10),
  visibility: visibilitySchema,
  targetOrganizationUnitId: z.uuid().nullable(),
  status: contentStatusSchema,
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

export const adminDashboardTaskSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  count: z.number().int().min(0),
  targetRoute: z.enum(["/admin/organization-units", "/admin/prayers", "/admin/events"]),
  priority: z.enum(["normal", "attention"])
});

export const adminDashboardResponseSchema = z.object({
  scope: z.object({
    adminKind: z.enum(["SUPER_ADMIN", "OFFICER"]),
    organizationUnitIds: z.array(z.uuid())
  }),
  counts: z.object({
    organizationUnits: z.number().int().min(0),
    prayers: z.number().int().min(0),
    events: z.number().int().min(0)
  }),
  tasks: z.array(adminDashboardTaskSchema)
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

function hasRequiredOrganizationUnitTarget(value: {
  visibility?: string | undefined;
  targetOrganizationUnitId?: string | null | undefined;
}) {
  return value.visibility !== "ORGANIZATION_UNIT" || Boolean(value.targetOrganizationUnitId);
}

function hasChronologicalEventDates(value: {
  startAt?: string | undefined;
  endAt?: string | null | undefined;
}) {
  return !value.startAt || !value.endAt || Date.parse(value.endAt) >= Date.parse(value.startAt);
}

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

export const publicHomeQuerySchema = z
  .object({
    language: z.string().trim().min(2).max(10).optional()
  })
  .strict();

export const publicContentPageSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens.");

export const publicContentPageQuerySchema = z
  .object({
    language: z.string().trim().min(2).max(10).optional()
  })
  .strict();

export const publicHomeCtaSchema = z.object({
  id: z.string().trim().min(1).max(50),
  label: z.string().trim().min(1).max(80),
  action: z.enum(["learn", "pray", "events", "join", "login"]),
  targetRoute: z.string().trim().min(1).max(80)
});

export const publicHomeEventSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  startAt: z.iso.datetime(),
  locationLabel: z.string().trim().min(1).max(200).nullable(),
  visibility: z.enum(["PUBLIC", "FAMILY_OPEN"])
});

export const publicHomeResponseSchema = z.object({
  intro: z.object({
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(1000)
  }),
  prayerOfDay: z
    .object({
      title: z.string().trim().min(1).max(200),
      body: z.string().trim().min(1).max(4000)
    })
    .nullable(),
  nextEvents: z.array(publicHomeEventSummarySchema),
  ctas: z.array(publicHomeCtaSchema).min(1)
});

export const publicContentPageResponseSchema = z.object({
  page: z.object({
    id: z.uuid(),
    slug: publicContentPageSlugSchema,
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(12000),
    language: z.string().trim().min(2).max(10)
  })
});

export const publicPaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).max(1000).default(0)
});

export const publicPrayerListQuerySchema = publicPaginationQuerySchema
  .extend({
    categoryId: z.uuid().optional(),
    q: z.string().trim().min(1).max(120).optional(),
    language: z.string().trim().min(2).max(10).optional()
  })
  .strict();

export const publicPrayerIdSchema = z.uuid();

const publicPrayerCategorySummarySchema = z.object({
  id: z.uuid(),
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  language: z.string().trim().min(2).max(10)
});

const publicPrayerSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(240),
  language: z.string().trim().min(2).max(10),
  category: publicPrayerCategorySummarySchema.nullable()
});

export const publicPrayerListResponseSchema = z.object({
  categories: z.array(publicPrayerCategorySummarySchema),
  prayers: z.array(publicPrayerSummarySchema),
  pagination: z.object({
    limit: z.number().int().min(1).max(50),
    offset: z.number().int().min(0).max(1000)
  })
});

export const publicPrayerDetailResponseSchema = z.object({
  prayer: publicPrayerSummarySchema.extend({
    body: z.string().trim().min(1).max(8000)
  })
});

export const publicEventListQuerySchema = publicPaginationQuerySchema
  .extend({
    from: z.iso.datetime().optional(),
    type: z.string().trim().min(1).max(80).optional()
  })
  .strict();

export const publicEventIdSchema = z.uuid();

const publicEventSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  type: z.string().trim().min(1).max(80),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  locationLabel: z.string().trim().min(1).max(200).nullable(),
  visibility: z.enum(["PUBLIC", "FAMILY_OPEN"])
});

export const publicEventListResponseSchema = z.object({
  events: z.array(publicEventSummarySchema),
  pagination: z.object({
    limit: z.number().int().min(1).max(50),
    offset: z.number().int().min(0).max(1000)
  })
});

export const publicEventDetailResponseSchema = z.object({
  event: publicEventSummarySchema.extend({
    description: z.string().trim().min(1).max(8000).nullable()
  })
});

export const authSessionRequestSchema = z
  .object({
    idToken: z.string().trim().min(1).max(8192),
    csrfToken: z.string().trim().min(16).max(512).optional()
  })
  .strict();

export type OrganizationUnitSummaryDto = z.infer<typeof organizationUnitSummarySchema>;
export type CreateOrganizationUnitRequestDto = z.infer<typeof createOrganizationUnitRequestSchema>;
export type UpdateOrganizationUnitRequestDto = z.infer<typeof updateOrganizationUnitRequestSchema>;
export type MyOrganizationUnitsResponseDto = z.infer<typeof myOrganizationUnitsResponseSchema>;
export type AdminOrganizationUnitListResponseDto = z.infer<
  typeof adminOrganizationUnitListResponseSchema
>;
export type OrganizationUnitDetailResponseDto = z.infer<
  typeof organizationUnitDetailResponseSchema
>;
export type AdminPrayerSummaryDto = z.infer<typeof adminPrayerSummarySchema>;
export type AdminPrayerListResponseDto = z.infer<typeof adminPrayerListResponseSchema>;
export type AdminPrayerDetailResponseDto = z.infer<typeof adminPrayerDetailResponseSchema>;
export type CreateAdminPrayerRequestDto = z.infer<typeof createAdminPrayerRequestSchema>;
export type UpdateAdminPrayerRequestDto = z.infer<typeof updateAdminPrayerRequestSchema>;
export type AdminEventSummaryDto = z.infer<typeof adminEventSummarySchema>;
export type AdminEventListResponseDto = z.infer<typeof adminEventListResponseSchema>;
export type AdminEventDetailResponseDto = z.infer<typeof adminEventDetailResponseSchema>;
export type AdminDashboardTaskDto = z.infer<typeof adminDashboardTaskSchema>;
export type AdminDashboardResponseDto = z.infer<typeof adminDashboardResponseSchema>;
export type CreateAdminEventRequestDto = z.infer<typeof createAdminEventRequestSchema>;
export type UpdateAdminEventRequestDto = z.infer<typeof updateAdminEventRequestSchema>;
export type PublicHomeQueryDto = z.infer<typeof publicHomeQuerySchema>;
export type PublicHomeResponseDto = z.infer<typeof publicHomeResponseSchema>;
export type PublicContentPageQueryDto = z.infer<typeof publicContentPageQuerySchema>;
export type PublicContentPageResponseDto = z.infer<typeof publicContentPageResponseSchema>;
export type PublicPrayerListQueryDto = z.infer<typeof publicPrayerListQuerySchema>;
export type PublicPrayerListResponseDto = z.infer<typeof publicPrayerListResponseSchema>;
export type PublicPrayerDetailResponseDto = z.infer<typeof publicPrayerDetailResponseSchema>;
export type PublicEventListQueryDto = z.infer<typeof publicEventListQuerySchema>;
export type PublicEventListResponseDto = z.infer<typeof publicEventListResponseSchema>;
export type PublicEventDetailResponseDto = z.infer<typeof publicEventDetailResponseSchema>;
export type AuthSessionRequestDto = z.infer<typeof authSessionRequestSchema>;

export interface RuntimeModeParseOptions {
  nodeEnv?: string | undefined;
}

export function parseRuntimeMode(value: string | undefined, options: RuntimeModeParseOptions = {}) {
  const runtimeMode = runtimeModeSchema.parse(value ?? "api");

  if (runtimeMode === "demo" && options.nodeEnv === "production") {
    throw new Error("Demo runtime mode is not allowed in production.");
  }

  return runtimeMode;
}
