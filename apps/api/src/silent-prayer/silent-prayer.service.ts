import { ForbiddenException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { canAccessBrotherMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import {
  SILENT_PRAYER_PRESENCE_TTL_MS,
  SilentPrayerPresenceService
} from "./silent-prayer-presence.service.js";
import type {
  SilentPrayerParticipant,
  SilentPrayerPresenceResult
} from "./silent-prayer-presence.types.js";
import {
  NoopSilentPrayerRealtimePublisher,
  SilentPrayerRealtimePublisher
} from "./silent-prayer-realtime.publisher.js";
import { SilentPrayerRepository } from "./silent-prayer.repository.js";
import type {
  BrotherSilentPrayerJoinResponse,
  BrotherSilentPrayerListResponse,
  PublicSilentPrayerJoinResponse,
  PublicSilentPrayerListResponse,
  SilentPrayerPresenceActionResponse,
  SilentPrayerListQuery
} from "./silent-prayer.types.js";

@Injectable()
export class SilentPrayerService {
  private readonly realtimePublisher: SilentPrayerRealtimePublisher;

  constructor(
    private readonly repository: SilentPrayerRepository,
    private readonly presence: SilentPrayerPresenceService,
    @Optional() realtimePublisher?: SilentPrayerRealtimePublisher
  ) {
    this.realtimePublisher = realtimePublisher ?? new NoopSilentPrayerRealtimePublisher();
  }

  async listPublicSessions(
    query: SilentPrayerListQuery,
    now = new Date()
  ): Promise<PublicSilentPrayerListResponse> {
    const sessions = await this.repository.findPublicSessions(query, now);
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => ({
        ...session,
        activeCount: (await this.presence.count(session.id, now)).activeCount
      }))
    );

    return {
      sessions: sessionsWithCounts,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async joinPublicSession(
    id: string,
    anonymousSessionId: string,
    now = new Date()
  ): Promise<PublicSilentPrayerJoinResponse> {
    const session = await this.repository.findPublicJoinableSession(id, now);

    if (!session) {
      throw new NotFoundException("Public silent-prayer session was not found.");
    }

    const presence = await this.presence.join(
      id,
      { type: "anonymous", sessionId: anonymousSessionId },
      now
    );
    await this.realtimePublisher.publishPublicCount(id, presence.activeCount, now);

    return {
      session: {
        ...session,
        activeCount: presence.activeCount
      },
      presence: {
        ...presence,
        socketRoom: silentPrayerSocketRoom(id)
      }
    };
  }

  async refreshPublicSessionPresence(
    id: string,
    anonymousSessionId: string,
    now = new Date()
  ): Promise<SilentPrayerSocketPresence> {
    const session = await this.repository.findPublicJoinableSession(id, now);

    if (!session) {
      throw new NotFoundException("Public silent-prayer session was not found.");
    }

    const presence = await this.presence.heartbeat(
      id,
      { type: "anonymous", sessionId: anonymousSessionId },
      now
    );
    await this.realtimePublisher.publishPublicCount(id, presence.activeCount, now);

    return withSocketRoom(presence);
  }

  async heartbeatPublicSession(
    id: string,
    anonymousSessionId: string,
    now = new Date()
  ): Promise<SilentPrayerPresenceActionResponse> {
    return toPresenceActionResponse(
      await this.refreshPublicSessionPresence(id, anonymousSessionId, now)
    );
  }

  async leavePublicSession(
    id: string,
    anonymousSessionId: string,
    now = new Date()
  ): Promise<SilentPrayerPresenceActionResponse> {
    const session = await this.repository.findPublicJoinableSession(id, now);

    if (!session) {
      throw new NotFoundException("Public silent-prayer session was not found.");
    }

    const presence = await this.presence.leave(
      id,
      { type: "anonymous", sessionId: anonymousSessionId },
      now
    );
    await this.realtimePublisher.publishPublicCount(id, presence.activeCount, now);

    return toPresenceActionResponse(presence);
  }

  async listBrotherSessions(
    principal: CurrentUserPrincipal,
    query: SilentPrayerListQuery,
    now = new Date()
  ): Promise<BrotherSilentPrayerListResponse> {
    const organizationUnitIds = await this.loadBrotherOrganizationUnitIds(principal);
    const sessions = await this.repository.findBrotherSessions(query, organizationUnitIds, now);
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => ({
        ...session,
        activeCount: (await this.presence.count(session.id, now)).activeCount
      }))
    );

    return {
      sessions: sessionsWithCounts,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async joinBrotherSession(
    principal: CurrentUserPrincipal,
    id: string,
    now = new Date()
  ): Promise<BrotherSilentPrayerJoinResponse> {
    const organizationUnitIds = await this.loadBrotherOrganizationUnitIds(principal);
    const session = await this.repository.findBrotherJoinableSession(id, organizationUnitIds, now);

    if (!session) {
      throw new NotFoundException("Brother silent-prayer session was not found in the current scope.");
    }

    const presence = await this.presence.join(
      id,
      { type: "authenticated", userId: principal.id },
      now
    );
    await this.publishBrotherPresence(principal.id, id, presence, now, true);

    return {
      session: {
        ...session,
        activeCount: presence.activeCount
      },
      presence: {
        ...presence,
        socketRoom: silentPrayerSocketRoom(id)
      }
    };
  }

  async refreshBrotherSessionPresence(
    principal: CurrentUserPrincipal,
    id: string,
    now = new Date()
  ): Promise<SilentPrayerSocketPresence> {
    const organizationUnitIds = await this.loadBrotherOrganizationUnitIds(principal);
    const session = await this.repository.findBrotherJoinableSession(id, organizationUnitIds, now);

    if (!session) {
      throw new NotFoundException("Brother silent-prayer session was not found in the current scope.");
    }

    const presence = await this.presence.heartbeat(
      id,
      { type: "authenticated", userId: principal.id },
      now
    );
    await this.publishBrotherPresence(principal.id, id, presence, now, true);

    return withSocketRoom(presence);
  }

  async heartbeatBrotherSession(
    principal: CurrentUserPrincipal,
    id: string,
    now = new Date()
  ): Promise<SilentPrayerPresenceActionResponse> {
    return toPresenceActionResponse(await this.refreshBrotherSessionPresence(principal, id, now));
  }

  async leaveBrotherSession(
    principal: CurrentUserPrincipal,
    id: string,
    now = new Date()
  ): Promise<SilentPrayerPresenceActionResponse> {
    const organizationUnitIds = await this.loadBrotherOrganizationUnitIds(principal);
    const session = await this.repository.findBrotherJoinableSession(id, organizationUnitIds, now);

    if (!session) {
      throw new NotFoundException("Brother silent-prayer session was not found in the current scope.");
    }

    const presence = await this.presence.leave(
      id,
      { type: "authenticated", userId: principal.id },
      now
    );
    await this.publishBrotherPresence(principal.id, id, presence, now, false);

    return toPresenceActionResponse(presence);
  }

  async leaveSessionPresence(
    id: string,
    participant: SilentPrayerParticipant,
    now = new Date()
  ): Promise<SilentPrayerSocketPresence> {
    return withSocketRoom(await this.presence.leave(id, participant, now));
  }

  private async loadBrotherOrganizationUnitIds(
    principal: CurrentUserPrincipal
  ): Promise<readonly string[]> {
    if (!canAccessBrotherMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Brother access is required.");
    }

    const organizationUnitIds = await this.repository.findActiveBrotherOrganizationUnitIds(
      principal.id
    );

    if (!organizationUnitIds) {
      throw new NotFoundException("Active brother membership profile was not found.");
    }

    return organizationUnitIds;
  }

  private async publishBrotherPresence(
    userId: string,
    eventId: string,
    presence: SilentPrayerPresenceResult,
    now: Date,
    grantRead: boolean
  ): Promise<void> {
    await this.realtimePublisher.publishPrivateCount(eventId, presence.activeCount, now);

    const firebaseUid = await this.repository.findFirebaseProviderSubject(userId);

    if (!firebaseUid) {
      return;
    }

    if (grantRead) {
      await this.realtimePublisher.grantPrivateRead(
        firebaseUid,
        eventId,
        SILENT_PRAYER_PRESENCE_TTL_MS,
        now
      );
    } else {
      await this.realtimePublisher.revokePrivateRead(firebaseUid, eventId);
    }
  }
}

export function silentPrayerSocketRoom(eventId: string): string {
  return `silent-prayer:${encodeURIComponent(eventId)}`;
}

export interface SilentPrayerSocketPresence extends SilentPrayerPresenceResult {
  readonly socketRoom: string;
}

function withSocketRoom(presence: SilentPrayerPresenceResult): SilentPrayerSocketPresence {
  return {
    ...presence,
    socketRoom: silentPrayerSocketRoom(presence.eventId)
  };
}

function toPresenceActionResponse(
  presence: Pick<SilentPrayerPresenceResult, "activeCount" | "expiresAt">
): SilentPrayerPresenceActionResponse {
  return {
    presence: {
      activeCount: presence.activeCount,
      expiresAt: presence.expiresAt
    }
  };
}
