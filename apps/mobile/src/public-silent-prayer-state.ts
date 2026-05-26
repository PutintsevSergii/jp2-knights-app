import type {
  PublicSilentPrayerJoinResponseDto,
  PublicSilentPrayerListResponseDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";

export function applyPublicSilentPrayerJoin(
  current: PublicSilentPrayerListResponseDto,
  joined: PublicSilentPrayerJoinResponseDto
): PublicSilentPrayerListResponseDto {
  return {
    ...current,
    sessions: current.sessions.map((session) =>
      session.id === joined.session.id ? joined.session : session
    )
  };
}

export function applyPublicSilentPrayerPresence(
  current: PublicSilentPrayerListResponseDto,
  presence: SilentPrayerPresenceDto
): PublicSilentPrayerListResponseDto {
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

export function applyPublicSilentPrayerPresenceToJoin(
  current: PublicSilentPrayerJoinResponseDto,
  presence: SilentPrayerPresenceDto
): PublicSilentPrayerJoinResponseDto {
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
