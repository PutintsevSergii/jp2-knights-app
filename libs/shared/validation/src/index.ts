import { z } from "zod";
import {
  ATTACHMENT_STATUSES,
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_REQUEST_STATUSES,
  CONTENT_STATUSES,
  DEVICE_TOKEN_PLATFORMS,
  EVENT_STATUSES,
  MEMBERSHIP_STATUSES,
  NOTIFICATION_CATEGORIES,
  ORGANIZATION_UNIT_STATUSES,
  ORGANIZATION_UNIT_TYPES,
  PARTICIPATION_STATUSES,
  ROADMAP_ASSIGNMENT_STATUSES,
  ROADMAP_SUBMISSION_STATUSES,
  ROADMAP_TARGET_ROLES,
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
export const deviceTokenPlatformSchema = z.enum(DEVICE_TOKEN_PLATFORMS);
export const notificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES);
export const roadmapAssignmentStatusSchema = z.enum(ROADMAP_ASSIGNMENT_STATUSES);
export const roadmapSubmissionStatusSchema = z.enum(ROADMAP_SUBMISSION_STATUSES);
export const roadmapTargetRoleSchema = z.enum(ROADMAP_TARGET_ROLES);
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

export const adminAnnouncementSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  visibility: visibilitySchema,
  targetOrganizationUnitId: z.uuid().nullable(),
  pinned: z.boolean(),
  status: contentStatusSchema,
  publishedAt: z.iso.datetime().nullable(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminAnnouncementListResponseSchema = z.object({
  announcements: z.array(adminAnnouncementSummarySchema)
});

export const adminAnnouncementDetailResponseSchema = z.object({
  announcement: adminAnnouncementSummarySchema
});

export const adminCandidateRequestSummarySchema = z.object({
  id: z.uuid(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  country: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  messagePreview: z.string().trim().max(160).nullable(),
  status: candidateRequestStatusSchema,
  assignedOrganizationUnitId: z.uuid().nullable(),
  assignedOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminCandidateRequestDetailSchema = adminCandidateRequestSummarySchema.extend({
  phone: z.string().trim().min(1).max(40).nullable(),
  preferredLanguage: z.string().trim().min(2).max(10).nullable(),
  message: z.string().trim().min(1).max(2000).nullable(),
  consentTextVersion: z.string().trim().min(1).max(120),
  consentAt: z.iso.datetime(),
  officerNote: z.string().trim().min(1).max(2000).nullable()
});

export const adminCandidateRequestListResponseSchema = z.object({
  candidateRequests: z.array(adminCandidateRequestSummarySchema)
});

export const adminCandidateRequestDetailResponseSchema = z.object({
  candidateRequest: adminCandidateRequestDetailSchema
});

export const adminCandidateProfileSummarySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  candidateRequestId: z.uuid().nullable(),
  displayName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  preferredLanguage: z.string().trim().min(2).max(10).nullable(),
  assignedOrganizationUnitId: z.uuid().nullable(),
  assignedOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  responsibleOfficerId: z.uuid().nullable(),
  responsibleOfficerName: z.string().trim().min(1).max(200).nullable(),
  status: candidateProfileStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable()
});

export const adminCandidateProfileDetailSchema = adminCandidateProfileSummarySchema;

export const adminCandidateProfileDetailResponseSchema = z.object({
  candidateProfile: adminCandidateProfileDetailSchema
});

export const adminCandidateProfileListResponseSchema = z.object({
  candidateProfiles: z.array(adminCandidateProfileSummarySchema)
});

export const updateAdminCandidateProfileSchema = z
  .object({
    status: z.enum(["active", "paused", "archived"]).optional(),
    assignedOrganizationUnitId: z.uuid().nullable().optional(),
    responsibleOfficerId: z.uuid().nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one candidate profile field must be provided."
  });

export const convertCandidateRequestSchema = z
  .object({
    assignedOrganizationUnitId: z.uuid().optional(),
    responsibleOfficerId: z.uuid().nullable().optional()
  })
  .strict();

export const updateAdminCandidateRequestSchema = z
  .object({
    status: z.enum(["new", "contacted", "invited", "rejected"]).optional(),
    assignedOrganizationUnitId: z.uuid().nullable().optional(),
    officerNote: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one candidate request field must be provided."
  });

export const adminDashboardTaskSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  count: z.number().int().min(0),
  targetRoute: z.enum([
    "/admin/identity-access-reviews",
    "/admin/organization-units",
    "/admin/prayers",
    "/admin/events"
  ]),
  priority: z.enum(["normal", "attention"])
});

export const adminDashboardResponseSchema = z.object({
  scope: z.object({
    adminKind: z.enum(["SUPER_ADMIN", "OFFICER"]),
    organizationUnitIds: z.array(z.uuid())
  }),
  counts: z.object({
    identityAccessReviews: z.number().int().min(0),
    organizationUnits: z.number().int().min(0),
    prayers: z.number().int().min(0),
    events: z.number().int().min(0)
  }),
  tasks: z.array(adminDashboardTaskSchema)
});

export const identityAccessReviewStatusSchema = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "expired"
]);

export const adminIdentityAccessReviewSummarySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  displayName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  provider: z.string().trim().min(1).max(80),
  providerSubject: z.string().trim().min(1).max(200),
  status: identityAccessReviewStatusSchema,
  scopeOrganizationUnitId: z.uuid().nullable(),
  scopeOrganizationUnitName: z.string().trim().min(1).max(200).nullable(),
  requestedRole: roleSchema.nullable(),
  assignedRole: roleSchema.nullable(),
  expiresAt: z.iso.datetime(),
  decidedBy: z.uuid().nullable(),
  decidedAt: z.iso.datetime().nullable(),
  decisionNote: z.string().trim().min(1).max(2000).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export const adminIdentityAccessReviewListResponseSchema = z.object({
  identityAccessReviews: z.array(adminIdentityAccessReviewSummarySchema)
});

export const adminIdentityAccessReviewDetailResponseSchema = z.object({
  identityAccessReview: adminIdentityAccessReviewSummarySchema
});

export const confirmIdentityAccessReviewSchema = z
  .object({
    assignedRole: z.enum(["CANDIDATE", "BROTHER", "OFFICER"]),
    organizationUnitId: z.uuid(),
    note: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict();

export const rejectIdentityAccessReviewSchema = z
  .object({
    note: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict();

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

const roadmapTextSchema = z.string().trim().min(1).max(200);
const roadmapBodySchema = z.string().trim().min(1).max(4000);

export const roadmapAttachmentMetadataSchema = z
  .object({
    originalFilename: z.string().trim().min(1).max(240),
    mimeType: z.string().trim().min(1).max(120),
    sizeBytes: z.number().int().min(1).max(10_000_000)
  })
  .strict();

export const roadmapSubmissionSummarySchema = z
  .object({
    id: z.uuid(),
    assignmentId: z.uuid(),
    stepId: z.uuid(),
    status: roadmapSubmissionStatusSchema,
    body: roadmapBodySchema,
    attachmentMetadata: z.array(roadmapAttachmentMetadataSchema).max(5),
    reviewComment: z.string().trim().min(1).max(2000).nullable(),
    reviewedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
  })
  .strict();

export const roadmapStepSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    description: z.string().trim().min(1).max(2000).nullable(),
    requiresSubmission: z.boolean(),
    sortOrder: z.number().int().min(0),
    status: contentStatusSchema,
    latestSubmission: roadmapSubmissionSummarySchema.nullable()
  })
  .strict();

export const roadmapStageSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    sortOrder: z.number().int().min(0),
    steps: z.array(roadmapStepSummarySchema)
  })
  .strict();

export const roadmapDefinitionSummarySchema = z
  .object({
    id: z.uuid(),
    title: roadmapTextSchema,
    targetRole: roadmapTargetRoleSchema,
    language: z.string().trim().min(2).max(10),
    status: contentStatusSchema,
    publishedAt: z.iso.datetime().nullable()
  })
  .strict();

export const assignedRoadmapSchema = z
  .object({
    assignmentId: z.uuid(),
    status: roadmapAssignmentStatusSchema,
    assignedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
    organizationUnitId: z.uuid().nullable(),
    definition: roadmapDefinitionSummarySchema,
    stages: z.array(roadmapStageSummarySchema)
  })
  .strict();

export const assignedRoadmapResponseSchema = z
  .object({
    roadmap: assignedRoadmapSchema.nullable()
  })
  .strict();

export const createRoadmapSubmissionRequestSchema = z
  .object({
    stepId: z.uuid(),
    body: roadmapBodySchema,
    attachmentMetadata: z.array(roadmapAttachmentMetadataSchema).max(5).default([])
  })
  .strict();

export const roadmapSubmissionResponseSchema = z
  .object({
    submission: roadmapSubmissionSummarySchema
  })
  .strict();

export const reviewRoadmapSubmissionRequestSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    reviewComment: z.string().trim().min(1).max(2000).nullable().optional()
  })
  .strict()
  .refine((value) => value.status === "approved" || Boolean(value.reviewComment), {
    message: "Rejected roadmap submissions require a reviewComment.",
    path: ["reviewComment"]
  });

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
export type AdminAnnouncementSummaryDto = z.infer<typeof adminAnnouncementSummarySchema>;
export type AdminAnnouncementListResponseDto = z.infer<typeof adminAnnouncementListResponseSchema>;
export type AdminAnnouncementDetailResponseDto = z.infer<
  typeof adminAnnouncementDetailResponseSchema
>;
export type AdminDashboardTaskDto = z.infer<typeof adminDashboardTaskSchema>;
export type AdminDashboardResponseDto = z.infer<typeof adminDashboardResponseSchema>;
export type AdminIdentityAccessReviewSummaryDto = z.infer<
  typeof adminIdentityAccessReviewSummarySchema
>;
export type AdminIdentityAccessReviewListResponseDto = z.infer<
  typeof adminIdentityAccessReviewListResponseSchema
>;
export type AdminIdentityAccessReviewDetailResponseDto = z.infer<
  typeof adminIdentityAccessReviewDetailResponseSchema
>;
export type ConfirmIdentityAccessReviewDto = z.infer<typeof confirmIdentityAccessReviewSchema>;
export type RejectIdentityAccessReviewDto = z.infer<typeof rejectIdentityAccessReviewSchema>;
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
export type BrotherPrayerListQueryDto = z.infer<typeof brotherPrayerListQuerySchema>;
export type BrotherPrayerSummaryDto = z.infer<typeof brotherPrayerSummarySchema>;
export type BrotherPrayerListResponseDto = z.infer<typeof brotherPrayerListResponseSchema>;
export type CreateAdminEventRequestDto = z.infer<typeof createAdminEventRequestSchema>;
export type UpdateAdminEventRequestDto = z.infer<typeof updateAdminEventRequestSchema>;
export type CreateAdminAnnouncementRequestDto = z.infer<
  typeof createAdminAnnouncementRequestSchema
>;
export type UpdateAdminAnnouncementRequestDto = z.infer<
  typeof updateAdminAnnouncementRequestSchema
>;
export type AdminCandidateRequestSummaryDto = z.infer<typeof adminCandidateRequestSummarySchema>;
export type AdminCandidateRequestDetailDto = z.infer<typeof adminCandidateRequestDetailSchema>;
export type AdminCandidateRequestListResponseDto = z.infer<
  typeof adminCandidateRequestListResponseSchema
>;
export type AdminCandidateRequestDetailResponseDto = z.infer<
  typeof adminCandidateRequestDetailResponseSchema
>;
export type AdminCandidateProfileSummaryDto = z.infer<typeof adminCandidateProfileSummarySchema>;
export type AdminCandidateProfileDetailDto = z.infer<typeof adminCandidateProfileDetailSchema>;
export type AdminCandidateProfileDetailResponseDto = z.infer<
  typeof adminCandidateProfileDetailResponseSchema
>;
export type AdminCandidateProfileListResponseDto = z.infer<
  typeof adminCandidateProfileListResponseSchema
>;
export type UpdateAdminCandidateProfileDto = z.infer<typeof updateAdminCandidateProfileSchema>;
export type ConvertCandidateRequestDto = z.infer<typeof convertCandidateRequestSchema>;
export type UpdateAdminCandidateRequestDto = z.infer<typeof updateAdminCandidateRequestSchema>;
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
export type AuthSessionRequestDto = z.infer<typeof authSessionRequestSchema>;
export type AuthSessionResponseDto = z.infer<typeof authSessionResponseSchema>;
export type CurrentUserResponseDto = z.infer<typeof currentUserResponseSchema>;
export type RegisterDeviceTokenRequestDto = z.infer<typeof registerDeviceTokenRequestSchema>;
export type DeviceTokenRegistrationResponseDto = z.infer<
  typeof deviceTokenRegistrationResponseSchema
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
export type RoadmapAttachmentMetadataDto = z.infer<typeof roadmapAttachmentMetadataSchema>;
export type RoadmapSubmissionSummaryDto = z.infer<typeof roadmapSubmissionSummarySchema>;
export type RoadmapStepSummaryDto = z.infer<typeof roadmapStepSummarySchema>;
export type RoadmapStageSummaryDto = z.infer<typeof roadmapStageSummarySchema>;
export type RoadmapDefinitionSummaryDto = z.infer<typeof roadmapDefinitionSummarySchema>;
export type AssignedRoadmapDto = z.infer<typeof assignedRoadmapSchema>;
export type AssignedRoadmapResponseDto = z.infer<typeof assignedRoadmapResponseSchema>;
export type CreateRoadmapSubmissionRequestDto = z.infer<
  typeof createRoadmapSubmissionRequestSchema
>;
export type RoadmapSubmissionResponseDto = z.infer<typeof roadmapSubmissionResponseSchema>;
export type ReviewRoadmapSubmissionRequestDto = z.infer<
  typeof reviewRoadmapSubmissionRequestSchema
>;

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
