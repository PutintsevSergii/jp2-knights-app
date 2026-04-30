import { z } from "zod";
import {
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_REQUEST_STATUSES,
  CONTENT_STATUSES,
  EVENT_STATUSES,
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
export const visibilitySchema = z.enum(VISIBILITIES);
export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export const candidateRequestStatusSchema = z.enum(CANDIDATE_REQUEST_STATUSES);
export const candidateProfileStatusSchema = z.enum(CANDIDATE_PROFILE_STATUSES);
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export const participationStatusSchema = z.enum(PARTICIPATION_STATUSES);
export const roadmapSubmissionStatusSchema = z.enum(ROADMAP_SUBMISSION_STATUSES);

export const healthStatusSchema = z.object({
  app: z.enum(["api", "admin", "mobile"]),
  runtimeMode: runtimeModeSchema,
  status: z.literal("ok")
});

export function parseRuntimeMode(value: string | undefined) {
  return runtimeModeSchema.parse(value ?? "api");
}
