import { z } from "zod";
import { organizationUnitSummarySchema, roleSchema } from "./common.js";

const candidateDashboardOrganizationUnitSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(200),
  parish: z.string().trim().min(1).max(200).nullable()
});

const candidateDashboardOfficerSchema = z.object({
  id: z.uuid(),
  displayName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(1).max(40).nullable()
});

export const candidateDashboardEventSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  type: z.string().trim().min(1).max(80),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  locationLabel: z.string().trim().min(1).max(200).nullable(),
  visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "ORGANIZATION_UNIT"])
});

export const candidateDashboardAnnouncementSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  publishedAt: z.iso.datetime()
});

export const candidateDashboardResponseSchema = z.object({
  profile: z.object({
    id: z.uuid(),
    userId: z.uuid(),
    displayName: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    preferredLanguage: z.string().trim().min(2).max(10).nullable(),
    status: z.literal("active"),
    assignedOrganizationUnit: candidateDashboardOrganizationUnitSchema.nullable(),
    responsibleOfficer: candidateDashboardOfficerSchema.nullable()
  }),
  nextStep: z.object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(1000),
    targetRoute: z.enum(["CandidateContact", "CandidateRoadmap", "CandidateEvents"]),
    priority: z.enum(["normal", "attention"])
  }),
  upcomingEvents: z.array(candidateDashboardEventSummarySchema),
  announcements: z.array(candidateDashboardAnnouncementSummarySchema)
});

export const candidateEventListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(1000).default(0),
    from: z.iso.datetime().optional(),
    type: z.string().trim().min(1).max(80).optional()
  })
  .strict();

const ownEventParticipationSchema = z
  .object({
    id: z.uuid(),
    eventId: z.uuid(),
    intentStatus: z.enum(["planning_to_attend", "cancelled"]),
    createdAt: z.iso.datetime(),
    cancelledAt: z.iso.datetime().nullable()
  })
  .strict();

export const candidateEventSummarySchema = candidateDashboardEventSummarySchema
  .extend({
    currentUserParticipation: ownEventParticipationSchema.nullable()
  })
  .strict();

export const candidateEventListResponseSchema = z
  .object({
    events: z.array(candidateEventSummarySchema),
    pagination: z
      .object({
        limit: z.number().int().min(1).max(50),
        offset: z.number().int().min(0).max(1000)
      })
      .strict()
  })
  .strict();

export const candidateAnnouncementListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(1000).default(0)
  })
  .strict();

export const candidateAnnouncementSummarySchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(2000),
    visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "CANDIDATE", "ORGANIZATION_UNIT"]),
    targetOrganizationUnitId: z.uuid().nullable(),
    pinned: z.boolean(),
    publishedAt: z.iso.datetime()
  })
  .strict();

export const candidateAnnouncementListResponseSchema = z
  .object({
    announcements: z.array(candidateAnnouncementSummarySchema),
    pagination: z
      .object({
        limit: z.number().int().min(1).max(50),
        offset: z.number().int().min(0).max(1000)
      })
      .strict()
  })
  .strict();

export const brotherMembershipSummarySchema = z.object({
  id: z.uuid(),
  currentDegree: z.string().trim().min(1).max(120).nullable(),
  joinedAt: z.iso.date().nullable(),
  organizationUnit: organizationUnitSummarySchema
});

export const brotherProfileResponseSchema = z.object({
  profile: z.object({
    id: z.uuid(),
    displayName: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(1).max(40).nullable(),
    preferredLanguage: z.string().trim().min(2).max(10).nullable(),
    status: z.literal("active"),
    roles: z.array(roleSchema),
    memberships: z.array(brotherMembershipSummarySchema).min(1)
  })
});

export const brotherTodayEventSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  type: z.string().trim().min(1).max(80),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  locationLabel: z.string().trim().min(1).max(200).nullable(),
  visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"])
});

export const brotherTodayCardSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(1000),
  targetRoute: z.enum([
    "BrotherProfile",
    "BrotherRoadmap",
    "MyOrganizationUnits",
    "BrotherEvents",
    "BrotherPrayers",
    "SilentPrayer"
  ]),
  priority: z.enum(["normal", "attention"])
});

export const brotherTodayResponseSchema = z.object({
  profileSummary: z.object({
    displayName: z.string().trim().min(1).max(200),
    currentDegree: z.string().trim().min(1).max(120).nullable(),
    organizationUnitName: z.string().trim().min(1).max(200).nullable()
  }),
  cards: z.array(brotherTodayCardSchema).min(1),
  upcomingEvents: z.array(brotherTodayEventSummarySchema),
  organizationUnits: z.array(organizationUnitSummarySchema).min(1)
});

export const brotherEventListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(1000).default(0),
    from: z.iso.datetime().optional(),
    type: z.string().trim().min(1).max(80).optional()
  })
  .strict();

export const brotherEventSummarySchema = brotherTodayEventSummarySchema;

export const brotherEventListResponseSchema = z.object({
  events: z.array(brotherEventSummarySchema),
  pagination: z.object({
    limit: z.number().int().min(1).max(50),
    offset: z.number().int().min(0).max(1000)
  })
});

export const brotherAnnouncementListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(1000).default(0)
  })
  .strict();

export const brotherAnnouncementSummarySchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(2000),
    visibility: z.enum(["PUBLIC", "FAMILY_OPEN", "BROTHER", "ORGANIZATION_UNIT"]),
    targetOrganizationUnitId: z.uuid().nullable(),
    pinned: z.boolean(),
    publishedAt: z.iso.datetime()
  })
  .strict();

export const brotherAnnouncementListResponseSchema = z.object({
  announcements: z.array(brotherAnnouncementSummarySchema),
  pagination: z.object({
    limit: z.number().int().min(1).max(50),
    offset: z.number().int().min(0).max(1000)
  })
});

export const eventParticipationResponseSchema = z
  .object({
    participation: ownEventParticipationSchema
  })
  .strict();

export const candidateEventDetailResponseSchema = z
  .object({
    event: candidateEventSummarySchema
      .extend({
        description: z.string().trim().min(1).max(8000).nullable(),
        currentUserParticipation: ownEventParticipationSchema.nullable()
      })
      .strict()
  })
  .strict();

export const brotherEventDetailResponseSchema = z.object({
  event: brotherEventSummarySchema.extend({
    description: z.string().trim().min(1).max(8000).nullable(),
    currentUserParticipation: ownEventParticipationSchema.nullable()
  })
});

export type CandidateDashboardEventSummaryDto = z.infer<
  typeof candidateDashboardEventSummarySchema
>;
export type CandidateDashboardAnnouncementSummaryDto = z.infer<
  typeof candidateDashboardAnnouncementSummarySchema
>;
export type CandidateDashboardResponseDto = z.infer<typeof candidateDashboardResponseSchema>;
export type CandidateEventListQueryDto = z.infer<typeof candidateEventListQuerySchema>;
export type CandidateEventSummaryDto = z.infer<typeof candidateEventSummarySchema>;
export type CandidateEventListResponseDto = z.infer<typeof candidateEventListResponseSchema>;
export type CandidateEventDetailResponseDto = z.infer<typeof candidateEventDetailResponseSchema>;
export type CandidateAnnouncementListQueryDto = z.infer<
  typeof candidateAnnouncementListQuerySchema
>;
export type CandidateAnnouncementSummaryDto = z.infer<typeof candidateAnnouncementSummarySchema>;
export type CandidateAnnouncementListResponseDto = z.infer<
  typeof candidateAnnouncementListResponseSchema
>;
export type BrotherMembershipSummaryDto = z.infer<typeof brotherMembershipSummarySchema>;
export type BrotherProfileResponseDto = z.infer<typeof brotherProfileResponseSchema>;
export type BrotherTodayEventSummaryDto = z.infer<typeof brotherTodayEventSummarySchema>;
export type BrotherTodayCardDto = z.infer<typeof brotherTodayCardSchema>;
export type BrotherTodayResponseDto = z.infer<typeof brotherTodayResponseSchema>;
export type BrotherEventListQueryDto = z.infer<typeof brotherEventListQuerySchema>;
export type BrotherEventSummaryDto = z.infer<typeof brotherEventSummarySchema>;
export type BrotherEventListResponseDto = z.infer<typeof brotherEventListResponseSchema>;
export type EventParticipationResponseDto = z.infer<typeof eventParticipationResponseSchema>;
export type BrotherEventDetailResponseDto = z.infer<typeof brotherEventDetailResponseSchema>;
export type BrotherAnnouncementListQueryDto = z.infer<typeof brotherAnnouncementListQuerySchema>;
export type BrotherAnnouncementSummaryDto = z.infer<typeof brotherAnnouncementSummarySchema>;
export type BrotherAnnouncementListResponseDto = z.infer<
  typeof brotherAnnouncementListResponseSchema
>;
