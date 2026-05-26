import {
  brotherSilentPrayerJoinResponseSchema,
  brotherSilentPrayerListResponseSchema,
  publicSilentPrayerJoinResponseSchema,
  publicSilentPrayerListResponseSchema,
  type BrotherSilentPrayerJoinResponseDto,
  type BrotherSilentPrayerListResponseDto,
  type PublicSilentPrayerJoinResponseDto,
  type PublicSilentPrayerListResponseDto
} from "@jp2/shared-validation";

export const fallbackPublicSilentPrayerSessions = publicSilentPrayerListResponseSchema.parse({
  sessions: [
    {
      id: "12121212-1212-4121-8121-121212121212",
      title: "Public Silent Prayer",
      intention: "A quiet public prayer session with aggregate counters only.",
      startsAt: "2026-06-02T18:00:00.000Z",
      endsAt: "2026-06-02T18:20:00.000Z",
      visibility: "PUBLIC",
      activeCount: 12
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies PublicSilentPrayerListResponseDto;

export const fallbackPublicSilentPrayerJoin = publicSilentPrayerJoinResponseSchema.parse({
  session: {
    ...fallbackPublicSilentPrayerSessions.sessions[0],
    activeCount: 13
  },
  presence: {
    eventId: fallbackPublicSilentPrayerSessions.sessions[0]!.id,
    activeCount: 13,
    expiresAt: "2026-06-02T18:05:00.000Z",
    socketRoom: `silent-prayer:${fallbackPublicSilentPrayerSessions.sessions[0]!.id}`
  }
}) satisfies PublicSilentPrayerJoinResponseDto;

export const fallbackBrotherSilentPrayerSessions = brotherSilentPrayerListResponseSchema.parse({
  sessions: [
    {
      id: "34343434-3434-4343-8343-343434343434",
      title: "Brother Silent Prayer",
      intention: "A brother-visible prayer session with no participant list.",
      startsAt: "2026-06-03T19:00:00.000Z",
      endsAt: "2026-06-03T19:30:00.000Z",
      visibility: "BROTHER",
      targetOrganizationUnitId: null,
      activeCount: 7
    },
    {
      id: "56565656-5656-4565-8565-565656565656",
      title: "Pilot Choragiew Silent Prayer",
      intention: "A scoped prayer session visible to the assigned choragiew.",
      startsAt: "2026-06-04T19:00:00.000Z",
      endsAt: null,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      activeCount: 3
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies BrotherSilentPrayerListResponseDto;

export const fallbackBrotherSilentPrayerJoin = brotherSilentPrayerJoinResponseSchema.parse({
  session: {
    ...fallbackBrotherSilentPrayerSessions.sessions[0],
    activeCount: 8
  },
  presence: {
    eventId: fallbackBrotherSilentPrayerSessions.sessions[0]!.id,
    activeCount: 8,
    expiresAt: "2026-06-03T19:05:00.000Z",
    socketRoom: `silent-prayer:${fallbackBrotherSilentPrayerSessions.sessions[0]!.id}`
  }
}) satisfies BrotherSilentPrayerJoinResponseDto;
