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

export const publicHomeQuerySchema = z
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

export type OrganizationUnitSummaryDto = z.infer<typeof organizationUnitSummarySchema>;
export type CreateOrganizationUnitRequestDto = z.infer<typeof createOrganizationUnitRequestSchema>;
export type UpdateOrganizationUnitRequestDto = z.infer<typeof updateOrganizationUnitRequestSchema>;
export type MyOrganizationUnitsResponseDto = z.infer<typeof myOrganizationUnitsResponseSchema>;
export type AdminOrganizationUnitListResponseDto = z.infer<
  typeof adminOrganizationUnitListResponseSchema
>;
export type OrganizationUnitDetailResponseDto = z.infer<typeof organizationUnitDetailResponseSchema>;
export type PublicHomeQueryDto = z.infer<typeof publicHomeQuerySchema>;
export type PublicHomeResponseDto = z.infer<typeof publicHomeResponseSchema>;

export interface RuntimeModeParseOptions {
  nodeEnv?: string | undefined;
}

export function parseRuntimeMode(
  value: string | undefined,
  options: RuntimeModeParseOptions = {}
) {
  const runtimeMode = runtimeModeSchema.parse(value ?? "api");

  if (runtimeMode === "demo" && options.nodeEnv === "production") {
    throw new Error("Demo runtime mode is not allowed in production.");
  }

  return runtimeMode;
}
