import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import { SilentPrayerPresenceService } from "./silent-prayer-presence.service.js";
import { InMemorySilentPrayerPresenceStore } from "./silent-prayer-presence.store.js";
import type { SilentPrayerRealtimePublisher } from "./silent-prayer-realtime.publisher.js";
import type { SilentPrayerRepository } from "./silent-prayer.repository.js";
import { SilentPrayerService } from "./silent-prayer.service.js";
import type {
  BrotherSilentPrayerEventSummary,
  PublicSilentPrayerEventSummary
} from "./silent-prayer.types.js";

const publicSessionId = "11111111-1111-4111-8111-111111111111";
const brotherSessionId = "22222222-2222-4222-8222-222222222222";
const organizationUnitId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-05-25T12:00:00.000Z");

const brotherPrincipal: CurrentUserPrincipal = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnitId]
};

const candidatePrincipal: CurrentUserPrincipal = {
  id: "55555555-5555-4555-8555-555555555555",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"],
  candidateOrganizationUnitId: organizationUnitId
};

const idlePrincipal: CurrentUserPrincipal = {
  id: "66666666-6666-4666-8666-666666666666",
  email: "idle@example.test",
  displayName: "Idle User",
  status: "active",
  roles: [],
  approval: {
    state: "pending",
    expiresAt: "2026-06-24T12:00:00.000Z",
    scopeOrganizationUnitId: organizationUnitId
  }
};

describe("SilentPrayerService", () => {
  it("lists public sessions with aggregate counts only", async () => {
    const service = serviceWith();

    await service.joinPublicSession(publicSessionId, "guest-1", now);
    await service.joinPublicSession(publicSessionId, "guest-2", now);

    await expect(service.listPublicSessions({ limit: 20, offset: 0 }, now)).resolves.toEqual({
      sessions: [
        {
          ...publicSession,
          activeCount: 2
        }
      ],
      pagination: {
        limit: 20,
        offset: 0
      }
    });
  });

  it("joins public sessions anonymously without inflating duplicate session joins", async () => {
    const service = serviceWith();

    await expect(service.joinPublicSession(publicSessionId, "guest-1", now)).resolves.toEqual({
      session: {
        ...publicSession,
        activeCount: 1
      },
      presence: {
        eventId: publicSessionId,
        activeCount: 1,
        expiresAt: "2026-05-25T12:00:45.000Z",
        socketRoom: `silent-prayer:${publicSessionId}`
      }
    });
    await expect(service.joinPublicSession(publicSessionId, "guest-1", now)).resolves.toMatchObject({
      session: {
        activeCount: 1
      },
      presence: {
        activeCount: 1
      }
    });
  });

  it("returns 404 when public sessions are not active or visible", async () => {
    await expect(
      serviceWith({ publicJoinable: null }).joinPublicSession(publicSessionId, "guest-1", now)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refreshes and leaves public sessions through aggregate-only REST responses", async () => {
    const publisher = new FakeSilentPrayerRealtimePublisher();
    const service = serviceWith({ publisher });

    await service.joinPublicSession(publicSessionId, "guest-1", now);
    await service.joinPublicSession(publicSessionId, "guest-2", now);

    await expect(
      service.heartbeatPublicSession(publicSessionId, "guest-1", now)
    ).resolves.toEqual({
      presence: {
        activeCount: 2,
        expiresAt: "2026-05-25T12:00:45.000Z"
      }
    });
    await expect(service.leavePublicSession(publicSessionId, "guest-1", now)).resolves.toEqual({
      presence: {
        activeCount: 1,
        expiresAt: "2026-05-25T12:00:45.000Z"
      }
    });
    expect(publisher.publicCounts).toEqual([
      [publicSessionId, 1, "2026-05-25T12:00:00.000Z"],
      [publicSessionId, 2, "2026-05-25T12:00:00.000Z"],
      [publicSessionId, 2, "2026-05-25T12:00:00.000Z"],
      [publicSessionId, 1, "2026-05-25T12:00:00.000Z"]
    ]);
  });

  it("returns 404 for public heartbeat and leave when the session is no longer visible", async () => {
    const service = serviceWith({ publicJoinable: null });

    await expect(
      service.heartbeatPublicSession(publicSessionId, "guest-1", now)
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.leavePublicSession(publicSessionId, "guest-1", now)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists brother sessions with scoped membership and aggregate counts only", async () => {
    const repository = repositoryWith();
    const service = serviceWith({ repository });

    await service.joinBrotherSession(brotherPrincipal, brotherSessionId, now);

    await expect(
      service.listBrotherSessions(brotherPrincipal, { limit: 10, offset: 0 }, now)
    ).resolves.toEqual({
      sessions: [
        {
          ...brotherSession,
          activeCount: 1
        }
      ],
      pagination: {
        limit: 10,
        offset: 0
      }
    });
    expect(repository.brotherSessionScopeChecks).toEqual([
      [organizationUnitId],
      [organizationUnitId]
    ]);
  });

  it("counts brother duplicate joins once per authenticated user", async () => {
    const service = serviceWith();

    await expect(service.joinBrotherSession(brotherPrincipal, brotherSessionId, now)).resolves
      .toMatchObject({
        session: {
          activeCount: 1
        },
        presence: {
          eventId: brotherSessionId,
          activeCount: 1,
          socketRoom: `silent-prayer:${brotherSessionId}`
        }
      });
    await expect(service.joinBrotherSession(brotherPrincipal, brotherSessionId, now)).resolves
      .toMatchObject({
        session: {
          activeCount: 1
        },
        presence: {
          activeCount: 1
        }
      });
  });

  it("refreshes and leaves brother sessions through scoped aggregate-only REST responses", async () => {
    const repository = repositoryWith();
    const publisher = new FakeSilentPrayerRealtimePublisher();
    const service = serviceWith({ repository, publisher });

    await service.joinBrotherSession(brotherPrincipal, brotherSessionId, now);

    await expect(service.heartbeatBrotherSession(brotherPrincipal, brotherSessionId, now)).resolves
      .toEqual({
        presence: {
          activeCount: 1,
          expiresAt: "2026-05-25T12:00:45.000Z"
        }
      });
    await expect(service.leaveBrotherSession(brotherPrincipal, brotherSessionId, now)).resolves
      .toEqual({
        presence: {
          activeCount: 0,
          expiresAt: "2026-05-25T12:00:45.000Z"
        }
      });
    expect(repository.brotherSessionScopeChecks).toEqual([
      [organizationUnitId],
      [organizationUnitId],
      [organizationUnitId]
    ]);
    expect(repository.firebaseProviderSubjectChecks).toEqual([
      brotherPrincipal.id,
      brotherPrincipal.id,
      brotherPrincipal.id
    ]);
    expect(publisher.privateCounts).toEqual([
      [brotherSessionId, 1, "2026-05-25T12:00:00.000Z"],
      [brotherSessionId, 1, "2026-05-25T12:00:00.000Z"],
      [brotherSessionId, 0, "2026-05-25T12:00:00.000Z"]
    ]);
    expect(publisher.grants).toEqual([
      ["firebase-brother-1", brotherSessionId, 45_000, "2026-05-25T12:00:00.000Z"],
      ["firebase-brother-1", brotherSessionId, 45_000, "2026-05-25T12:00:00.000Z"]
    ]);
    expect(publisher.revocations).toEqual([["firebase-brother-1", brotherSessionId]]);
  });

  it("blocks non-brothers, idle users, missing memberships, and out-of-scope sessions", async () => {
    await expect(
      serviceWith().joinBrotherSession(candidatePrincipal, brotherSessionId, now)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      serviceWith().joinBrotherSession(idlePrincipal, brotherSessionId, now)
    ).rejects.toMatchObject({
      response: {
        code: IDLE_APPROVAL_REQUIRED_CODE
      }
    });
    await expect(
      serviceWith({ organizationUnitIds: null }).joinBrotherSession(
        brotherPrincipal,
        brotherSessionId,
        now
      )
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      serviceWith({ brotherJoinable: null }).joinBrotherSession(
        brotherPrincipal,
        brotherSessionId,
        now
      )
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      serviceWith().heartbeatBrotherSession(candidatePrincipal, brotherSessionId, now)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      serviceWith({ brotherJoinable: null }).leaveBrotherSession(
        brotherPrincipal,
        brotherSessionId,
        now
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

const publicSession: PublicSilentPrayerEventSummary = {
  id: publicSessionId,
  title: "Public Silent Prayer",
  intention: "Public aggregate-only fixture.",
  startsAt: "2026-05-25T10:00:00.000Z",
  endsAt: "2026-05-25T14:00:00.000Z",
  visibility: "PUBLIC",
  activeCount: 0
};

const brotherSession: BrotherSilentPrayerEventSummary = {
  id: brotherSessionId,
  title: "Brother Silent Prayer",
  intention: "Brother aggregate-only fixture.",
  startsAt: "2026-05-25T10:00:00.000Z",
  endsAt: "2026-05-25T14:00:00.000Z",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: organizationUnitId,
  activeCount: 0
};

function serviceWith(
  options: {
    repository?: SilentPrayerRepository & { brotherSessionScopeChecks: string[][] };
    publicJoinable?: PublicSilentPrayerEventSummary | null;
    brotherJoinable?: BrotherSilentPrayerEventSummary | null;
    organizationUnitIds?: readonly string[] | null;
    publisher?: SilentPrayerRealtimePublisher;
  } = {}
): SilentPrayerService {
  const repositoryOptions: {
    publicJoinable?: PublicSilentPrayerEventSummary | null;
    brotherJoinable?: BrotherSilentPrayerEventSummary | null;
    organizationUnitIds?: readonly string[] | null;
  } = {};

  if ("publicJoinable" in options) {
    repositoryOptions.publicJoinable = options.publicJoinable;
  }

  if ("brotherJoinable" in options) {
    repositoryOptions.brotherJoinable = options.brotherJoinable;
  }

  if ("organizationUnitIds" in options) {
    repositoryOptions.organizationUnitIds = options.organizationUnitIds;
  }

  return new SilentPrayerService(
    options.repository ?? repositoryWith(repositoryOptions),
    new SilentPrayerPresenceService(new InMemorySilentPrayerPresenceStore()),
    options.publisher
  );
}

function repositoryWith(
  options: {
    publicJoinable?: PublicSilentPrayerEventSummary | null;
    brotherJoinable?: BrotherSilentPrayerEventSummary | null;
    organizationUnitIds?: readonly string[] | null;
  } = {}
): SilentPrayerRepository & {
  brotherSessionScopeChecks: string[][];
  firebaseProviderSubjectChecks: string[];
} {
  return {
    brotherSessionScopeChecks: [],
    firebaseProviderSubjectChecks: [],
    findPublicSessions() {
      return Promise.resolve(options.publicJoinable === null ? [] : [publicSession]);
    },
    findPublicJoinableSession() {
      return Promise.resolve(
        options.publicJoinable === undefined ? publicSession : options.publicJoinable
      );
    },
    findBrotherSessions(_query, organizationUnitIds) {
      this.brotherSessionScopeChecks.push([...organizationUnitIds]);
      return Promise.resolve(options.brotherJoinable === null ? [] : [brotherSession]);
    },
    findBrotherJoinableSession(_id, organizationUnitIds) {
      this.brotherSessionScopeChecks.push([...organizationUnitIds]);
      return Promise.resolve(
        options.brotherJoinable === undefined ? brotherSession : options.brotherJoinable
      );
    },
    findActiveBrotherOrganizationUnitIds() {
      return Promise.resolve(
        options.organizationUnitIds === undefined
          ? [organizationUnitId]
          : options.organizationUnitIds
      );
    },
    findFirebaseProviderSubject(userId) {
      this.firebaseProviderSubjectChecks.push(userId);
      return Promise.resolve("firebase-brother-1");
    }
  };
}

class FakeSilentPrayerRealtimePublisher implements SilentPrayerRealtimePublisher {
  readonly publicCounts: Array<[string, number, string]> = [];
  readonly privateCounts: Array<[string, number, string]> = [];
  readonly grants: Array<[string, string, number, string]> = [];
  readonly revocations: Array<[string, string]> = [];

  publishPublicCount(eventId: string, activeCount: number, now: Date): Promise<void> {
    this.publicCounts.push([eventId, activeCount, now.toISOString()]);

    return Promise.resolve();
  }

  publishPrivateCount(eventId: string, activeCount: number, now: Date): Promise<void> {
    this.privateCounts.push([eventId, activeCount, now.toISOString()]);

    return Promise.resolve();
  }

  grantPrivateRead(
    firebaseUid: string,
    eventId: string,
    ttlMs: number,
    now: Date
  ): Promise<void> {
    this.grants.push([firebaseUid, eventId, ttlMs, now.toISOString()]);

    return Promise.resolve();
  }

  revokePrivateRead(firebaseUid: string, eventId: string): Promise<void> {
    this.revocations.push([firebaseUid, eventId]);

    return Promise.resolve();
  }
}
