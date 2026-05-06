import {
  candidateEventDetailResponseSchema,
  candidateEventListResponseSchema,
  candidateDashboardResponseSchema,
  type CandidateEventDetailResponseDto,
  type CandidateEventListResponseDto,
  type CandidateDashboardResponseDto
} from "@jp2/shared-validation";

export const fallbackCandidateDashboard = candidateDashboardResponseSchema.parse({
  profile: {
    id: "11111111-1111-4111-8111-111111111111",
    userId: "22222222-2222-4222-8222-222222222222",
    displayName: "Demo Candidate",
    email: "candidate@example.test",
    preferredLanguage: "en",
    status: "active",
    assignedOrganizationUnit: {
      id: "33333333-3333-4333-8333-333333333333",
      name: "Pilot Choragiew",
      city: "Riga",
      country: "Latvia",
      parish: null
    },
    responsibleOfficer: {
      id: "44444444-4444-4444-8444-444444444444",
      displayName: "Responsible Officer",
      email: "officer@example.test",
      phone: null
    }
  },
  nextStep: {
    id: "review-roadmap",
    label: "Review your candidate path",
    body: "Stay in touch with Responsible Officer and review upcoming candidate steps.",
    targetRoute: "CandidateRoadmap",
    priority: "normal"
  },
  upcomingEvents: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      title: "Candidate Gathering",
      type: "formation",
      startAt: "2026-06-01T10:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE"
    }
  ],
  announcements: []
}) satisfies CandidateDashboardResponseDto;

export const fallbackCandidateEvents = candidateEventListResponseSchema.parse({
  events: fallbackCandidateDashboard.upcomingEvents,
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies CandidateEventListResponseDto;

export const fallbackCandidateEventDetail = candidateEventDetailResponseSchema.parse({
  event: {
    ...fallbackCandidateDashboard.upcomingEvents[0]!,
    description: "Formation gathering for active candidates.",
    currentUserParticipation: {
      id: "66666666-6666-4666-8666-666666666666",
      eventId: fallbackCandidateDashboard.upcomingEvents[0]!.id,
      intentStatus: "planning_to_attend",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: null
    }
  }
}) satisfies CandidateEventDetailResponseDto;
