import type {
  AssignedRoadmapResponseDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  RoadmapSubmissionSummaryDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";

export function applyBrotherSilentPrayerJoin(
  current: BrotherSilentPrayerListResponseDto,
  joined: BrotherSilentPrayerJoinResponseDto
): BrotherSilentPrayerListResponseDto {
  return {
    ...current,
    sessions: current.sessions.map((session) =>
      session.id === joined.session.id ? joined.session : session
    )
  };
}

export function applyBrotherSilentPrayerPresence(
  current: BrotherSilentPrayerListResponseDto,
  presence: SilentPrayerPresenceDto
): BrotherSilentPrayerListResponseDto {
  return {
    ...current,
    sessions: current.sessions.map((session) =>
      session.id === presence.eventId
        ? {
            ...session,
            activeCount: presence.activeCount
          }
        : session
    )
  };
}

export function applyBrotherSilentPrayerPresenceToJoin(
  current: BrotherSilentPrayerJoinResponseDto,
  presence: SilentPrayerPresenceDto
): BrotherSilentPrayerJoinResponseDto {
  if (current.session.id !== presence.eventId) {
    return current;
  }

  return {
    ...current,
    presence,
    session: {
      ...current.session,
      activeCount: presence.activeCount
    }
  };
}

export function applyRoadmapSubmission(
  response: AssignedRoadmapResponseDto,
  stepId: string,
  submission: RoadmapSubmissionSummaryDto
): AssignedRoadmapResponseDto {
  if (!response.roadmap) {
    return response;
  }

  return {
    roadmap: {
      ...response.roadmap,
      stages: response.roadmap.stages.map((stage) => ({
        ...stage,
        steps: stage.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                latestSubmission: submission
              }
            : step
        )
      }))
    }
  };
}

export function buildDemoRoadmapSubmission(
  response: AssignedRoadmapResponseDto,
  stepId: string,
  body: string
): RoadmapSubmissionSummaryDto {
  return {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    assignmentId: response.roadmap?.assignmentId ?? "99999999-9999-4999-8999-999999999999",
    stepId,
    status: "pending_review",
    body,
    attachmentMetadata: [],
    reviewComment: null,
    reviewedAt: null,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z"
  };
}
