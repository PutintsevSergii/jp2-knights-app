import {
  assignedRoadmapResponseSchema,
  type AssignedRoadmapResponseDto
} from "@jp2/shared-validation";

const fallbackRoadmapStage = {
  id: "77777777-7777-4777-8777-777777777777",
  title: "Discernment",
  sortOrder: 1,
  steps: [
    {
      id: "88888888-8888-4888-8888-888888888888",
      title: "Meet your officer",
      description: "Confirm the first formation conversation with your responsible officer.",
      requiresSubmission: false,
      sortOrder: 1,
      status: "PUBLISHED",
      latestSubmission: null
    }
  ]
} as const;

export const fallbackCandidateRoadmap = assignedRoadmapResponseSchema.parse({
  roadmap: {
    assignmentId: "55555555-5555-4555-8555-555555555555",
    status: "active",
    assignedAt: "2026-05-09T09:00:00.000Z",
    completedAt: null,
    organizationUnitId: "33333333-3333-4333-8333-333333333333",
    definition: {
      id: "66666666-6666-4666-8666-666666666666",
      title: "Candidate Onboarding Roadmap",
      targetRole: "CANDIDATE",
      language: "en",
      status: "PUBLISHED",
      publishedAt: "2026-05-09T09:00:00.000Z"
    },
    stages: [fallbackRoadmapStage]
  }
}) satisfies AssignedRoadmapResponseDto;

export const fallbackBrotherRoadmap = assignedRoadmapResponseSchema.parse({
  roadmap: {
    assignmentId: "99999999-9999-4999-8999-999999999999",
    status: "active",
    assignedAt: "2026-05-09T09:00:00.000Z",
    completedAt: null,
    organizationUnitId: "11111111-1111-4111-8111-111111111111",
    definition: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Brother Formation Roadmap",
      targetRole: "BROTHER",
      language: "en",
      status: "PUBLISHED",
      publishedAt: "2026-05-09T09:00:00.000Z"
    },
    stages: [
      {
        ...fallbackRoadmapStage,
        title: "First Degree Formation",
        steps: [
          {
            ...fallbackRoadmapStage.steps[0],
            title: "Submit a formation reflection",
            requiresSubmission: true,
            latestSubmission: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              assignmentId: "99999999-9999-4999-8999-999999999999",
              stepId: fallbackRoadmapStage.steps[0].id,
              status: "pending_review",
              body: "Reflection text.",
              attachmentMetadata: [],
              reviewComment: null,
              reviewedAt: null,
              createdAt: "2026-05-10T09:00:00.000Z",
              updatedAt: "2026-05-10T09:00:00.000Z"
            }
          }
        ]
      }
    ]
  }
}) satisfies AssignedRoadmapResponseDto;
