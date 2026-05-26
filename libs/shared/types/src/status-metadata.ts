import type {
  CandidateProfileStatus,
  CandidateRequestStatus,
  ContentStatus,
  EventStatus,
  RoadmapAssignmentStatus,
  RoadmapSubmissionStatus
} from "./index.js";

export interface StatusMetadata {
  labelKey: string;
  terminal: boolean;
}

export const CONTENT_STATUS_METADATA = {
  DRAFT: { labelKey: "content.status.draft", terminal: false },
  REVIEW: { labelKey: "content.status.review", terminal: false },
  APPROVED: { labelKey: "content.status.approved", terminal: false },
  PUBLISHED: { labelKey: "content.status.published", terminal: false },
  ARCHIVED: { labelKey: "content.status.archived", terminal: true }
} as const satisfies Record<ContentStatus, StatusMetadata>;

export const EVENT_STATUS_METADATA = {
  draft: { labelKey: "content.status.draft", terminal: false },
  published: { labelKey: "content.status.published", terminal: false },
  cancelled: { labelKey: "event.status.cancelled", terminal: true },
  archived: { labelKey: "content.status.archived", terminal: true }
} as const satisfies Record<EventStatus, StatusMetadata>;

export const ROADMAP_SUBMISSION_STATUS_METADATA = {
  pending_review: { labelKey: "roadmap.status.pendingReview", terminal: false },
  approved: { labelKey: "roadmap.status.approved", terminal: true },
  rejected: { labelKey: "roadmap.status.rejected", terminal: true }
} as const satisfies Record<RoadmapSubmissionStatus, StatusMetadata>;

export const ROADMAP_ASSIGNMENT_STATUS_METADATA = {
  active: { labelKey: "roadmap.assignment.status.active", terminal: false },
  completed: { labelKey: "roadmap.assignment.status.completed", terminal: true },
  archived: { labelKey: "content.status.archived", terminal: true }
} as const satisfies Record<RoadmapAssignmentStatus, StatusMetadata>;

export const CANDIDATE_REQUEST_STATUS_METADATA = {
  new: { labelKey: "candidateRequest.status.new", terminal: false },
  contacted: { labelKey: "candidateRequest.status.contacted", terminal: false },
  invited: { labelKey: "candidateRequest.status.invited", terminal: false },
  rejected: { labelKey: "candidateRequest.status.rejected", terminal: true },
  converted_to_candidate: {
    labelKey: "candidateRequest.status.convertedToCandidate",
    terminal: true
  }
} as const satisfies Record<CandidateRequestStatus, StatusMetadata>;

export const CANDIDATE_PROFILE_STATUS_METADATA = {
  active: { labelKey: "candidateProfile.status.active", terminal: false },
  paused: { labelKey: "candidateProfile.status.paused", terminal: false },
  converted_to_brother: {
    labelKey: "candidateProfile.status.convertedToBrother",
    terminal: true
  },
  archived: { labelKey: "content.status.archived", terminal: true }
} as const satisfies Record<CandidateProfileStatus, StatusMetadata>;
