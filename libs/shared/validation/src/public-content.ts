import { z } from "zod";

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

export const brotherPrayerListQuerySchema = publicPrayerListQuerySchema;

const brotherPrayerSummarySchema = publicPrayerSummarySchema.extend({
  visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]),
  targetOrganizationUnitId: z.uuid().nullable()
});

export const brotherPrayerListResponseSchema = z.object({
  categories: z.array(publicPrayerCategorySummarySchema),
  prayers: z.array(brotherPrayerSummarySchema),
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

const candidateRequestTextSchema = z.string().trim().min(1).max(120);

export const createPublicCandidateRequestSchema = z
  .object({
    firstName: candidateRequestTextSchema,
    lastName: candidateRequestTextSchema,
    email: z
      .string()
      .trim()
      .email()
      .max(320)
      .transform((value) => value.toLowerCase()),
    phone: z.string().trim().min(1).max(40).nullable().optional(),
    country: candidateRequestTextSchema,
    city: candidateRequestTextSchema,
    preferredLanguage: z.string().trim().min(2).max(10).nullable().optional(),
    message: z.string().trim().min(1).max(2000).nullable().optional(),
    consentAccepted: z.literal(true),
    consentTextVersion: z.string().trim().min(1).max(120),
    idempotencyKey: z.string().trim().min(1).max(120).optional()
  })
  .strict();

export const publicCandidateRequestResponseSchema = z.object({
  request: z.object({
    id: z.uuid(),
    status: z.literal("new")
  })
});

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
export type CreatePublicCandidateRequestDto = z.infer<typeof createPublicCandidateRequestSchema>;
export type PublicCandidateRequestResponseDto = z.infer<
  typeof publicCandidateRequestResponseSchema
>;
export type BrotherPrayerListQueryDto = z.infer<typeof brotherPrayerListQuerySchema>;
export type BrotherPrayerSummaryDto = z.infer<typeof brotherPrayerSummarySchema>;
export type BrotherPrayerListResponseDto = z.infer<typeof brotherPrayerListResponseSchema>;
