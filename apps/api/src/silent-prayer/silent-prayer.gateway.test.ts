import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuthSessionService } from "../auth/auth-session.service.js";
import type { CurrentUserPrincipal, RequestWithPrincipal } from "../auth/current-user.types.js";
import type { SilentPrayerParticipant } from "./silent-prayer-presence.types.js";
import {
  SILENT_PRAYER_SOCKET_EVENTS,
  SilentPrayerGateway
} from "./silent-prayer.gateway.js";
import type { SilentPrayerService, SilentPrayerSocketPresence } from "./silent-prayer.service.js";

const eventId = "11111111-1111-4111-8111-111111111111";
const room = `silent-prayer:${eventId}`;
const brotherId = "22222222-2222-4222-8222-222222222222";
const organizationUnitId = "33333333-3333-4333-8333-333333333333";

describe("SilentPrayerGateway", () => {
  it("joins public sessions and broadcasts aggregate presence without session identifiers", async () => {
    const service = new FakeSilentPrayerService();
    const socket = new FakeSocket();
    const server = new FakeServer();
    const gateway = gatewayWith(service);
    gateway.server = server;

    const ack = await gateway.joinPublicSession(socket, {
      eventId,
      anonymousSessionId: "guest-session-1"
    });

    expect(service.publicJoins).toEqual([{ id: eventId, anonymousSessionId: "guest-session-1" }]);
    expect(socket.joinedRooms).toEqual([room]);
    expect(ack).toMatchObject({
      event: SILENT_PRAYER_SOCKET_EVENTS.joined,
      data: {
        presence: {
          eventId,
          activeCount: 1,
          socketRoom: room
        }
      }
    });
    expect(server.broadcasts).toEqual([
      {
        room,
        event: SILENT_PRAYER_SOCKET_EVENTS.presence,
        data: presence(1)
      }
    ]);
    expect(JSON.stringify([ack, server.broadcasts, socket.emitted])).not.toContain(
      "guest-session-1"
    );
  });

  it("joins brother sessions from socket auth and does not emit user identifiers", async () => {
    const service = new FakeSilentPrayerService();
    const auth = new FakeAuthSessionService(brotherPrincipal);
    const socket = new FakeSocket({ token: "provider-token" });
    const server = new FakeServer();
    const gateway = gatewayWith(service, auth);
    gateway.server = server;

    const ack = await gateway.joinBrotherSession(socket, { eventId });

    expect(auth.requests).toEqual([
      {
        headers: {
          authorization: "Bearer provider-token"
        },
        cookies: {}
      }
    ]);
    expect(service.brotherJoins).toEqual([{ principal: brotherPrincipal, id: eventId }]);
    expect(ack).toMatchObject({
      event: SILENT_PRAYER_SOCKET_EVENTS.joined,
      data: {
        presence: {
          activeCount: 1,
          socketRoom: room
        }
      }
    });
    expect(JSON.stringify([ack, server.broadcasts, socket.emitted])).not.toContain(brotherId);
  });

  it("resolves brother socket auth from the session cookie path", async () => {
    const auth = new FakeAuthSessionService(brotherPrincipal);
    const socket = new FakeSocket(undefined, {
      cookie: "jp2_session=session-cookie%201; other=value"
    });
    const gateway = gatewayWith(new FakeSilentPrayerService(), auth);

    await gateway.joinBrotherSession(socket, { eventId });

    expect(auth.requests).toEqual([
      {
        headers: {
          cookie: "jp2_session=session-cookie%201; other=value"
        },
        cookies: {
          jp2_session: "session-cookie 1",
          other: "value"
        }
      }
    ]);
  });

  it("parses array cookie headers for brother socket auth", async () => {
    const auth = new FakeAuthSessionService(brotherPrincipal);
    const socket = new FakeSocket(undefined, {
      cookie: ["flag; jp2_session=session-cookie"]
    });
    const gateway = gatewayWith(new FakeSilentPrayerService(), auth);

    await gateway.joinBrotherSession(socket, { eventId });

    expect(auth.requests[0]?.cookies).toEqual({
      flag: "",
      jp2_session: "session-cookie"
    });
  });

  it("refreshes heartbeat only after a socket has joined the session", async () => {
    const service = new FakeSilentPrayerService();
    const socket = new FakeSocket();
    const gateway = gatewayWith(service);

    await gateway.joinPublicSession(socket, {
      eventId,
      anonymousSessionId: "guest-session-1"
    });
    const ack = await gateway.heartbeat(socket, { eventId });

    expect(service.publicRefreshes).toEqual([
      { id: eventId, anonymousSessionId: "guest-session-1" }
    ]);
    expect(ack).toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.presence,
      data: presence(1)
    });
  });

  it("returns a socket error for invalid or unauthorized socket actions", async () => {
    const service = new FakeSilentPrayerService();
    const socket = new FakeSocket();
    const gateway = gatewayWith(service, new FakeAuthSessionService(null));

    await expect(gateway.joinPublicSession(socket, { eventId: "not-a-uuid" })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Invalid public silent-prayer join payload."
      }
    });
    await expect(gateway.joinBrotherSession(socket, { eventId })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "FORBIDDEN",
        message: "Authentication is required."
      }
    });
    expect(socket.emitted.map((entry) => entry.event)).toEqual([
      SILENT_PRAYER_SOCKET_EVENTS.error,
      SILENT_PRAYER_SOCKET_EVENTS.error
    ]);
  });

  it("rejects inactive brother socket principals before joining private rooms", async () => {
    const gateway = gatewayWith(
      new FakeSilentPrayerService(),
      new FakeAuthSessionService({
        ...brotherPrincipal,
        status: "inactive"
      })
    );

    await expect(gateway.joinBrotherSession(new FakeSocket(), { eventId })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "FORBIDDEN",
        message: "Inactive principals cannot access protected app modes."
      }
    });
  });

  it("returns validation errors when heartbeat or leave is requested before joining", async () => {
    const socket = new FakeSocket();
    const gateway = gatewayWith();

    await expect(gateway.heartbeat(socket, { eventId })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Socket has not joined this silent-prayer session."
      }
    });
    await expect(gateway.leave(socket, { eventId })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Socket has not joined this silent-prayer session."
      }
    });
  });

  it("returns validation errors for malformed event payloads", async () => {
    const socket = new FakeSocket();
    const gateway = gatewayWith();

    await expect(gateway.heartbeat(socket, "not-an-object")).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Invalid silent-prayer socket payload."
      }
    });
    await expect(gateway.leave(socket, { eventId: "not-a-uuid" })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Invalid silent-prayer socket payload."
      }
    });
  });

  it("leaves a joined room and emits the updated aggregate count", async () => {
    const service = new FakeSilentPrayerService();
    const socket = new FakeSocket();
    const gateway = gatewayWith(service);

    await gateway.joinPublicSession(socket, {
      eventId,
      anonymousSessionId: "guest-session-1"
    });
    const ack = await gateway.leave(socket, { eventId });

    expect(service.leaves).toEqual([
      {
        id: eventId,
        participant: {
          type: "anonymous",
          sessionId: "guest-session-1"
        }
      }
    ]);
    expect(socket.leftRooms).toEqual([room]);
    expect(ack).toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.presence,
      data: presence(0)
    });
  });

  it("refreshes brother heartbeat through the scoped service path", async () => {
    const service = new FakeSilentPrayerService();
    const socket = new FakeSocket({ token: "provider-token" });
    const gateway = gatewayWith(service);

    await gateway.joinBrotherSession(socket, { eventId });
    const ack = await gateway.heartbeat(socket, { eventId });

    expect(service.brotherRefreshes).toEqual([{ principal: brotherPrincipal, id: eventId }]);
    expect(ack).toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.presence,
      data: presence(1)
    });
  });

  it("clears local socket room metadata on disconnect while TTL remains the cleanup boundary", async () => {
    const socket = new FakeSocket();
    const gateway = gatewayWith();

    await gateway.joinPublicSession(socket, {
      eventId,
      anonymousSessionId: "guest-session-1"
    });

    expect(socket.data.silentPrayerParticipations?.size).toBe(1);

    gateway.handleDisconnect(socket);

    expect(socket.data.silentPrayerParticipations?.size).toBe(0);
  });

  it("maps service visibility denials to aggregate-only socket errors", async () => {
    const service = new FakeSilentPrayerService({
      publicJoinError: new NotFoundException("Public silent-prayer session was not found."),
      brotherJoinError: new ForbiddenException("Brother access is required.")
    });
    const gateway = gatewayWith(service, new FakeAuthSessionService(brotherPrincipal));

    await expect(
      gateway.joinPublicSession(new FakeSocket(), {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "NOT_FOUND",
        message: "Public silent-prayer session was not found."
      }
    });
    await expect(gateway.joinBrotherSession(new FakeSocket(), { eventId })).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "FORBIDDEN",
        message: "Brother access is required."
      }
    });
  });

  it("maps unauthorized and malformed exception responses to safe socket errors", async () => {
    await expect(
      gatewayWith(
        new FakeSilentPrayerService({
          publicJoinError: new UnauthorizedException()
        })
      ).joinPublicSession(new FakeSocket(), {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "UNAUTHORIZED",
        message: "Unauthorized"
      }
    });
    await expect(
      gatewayWith(
        new FakeSilentPrayerService({
          publicJoinError: new BadRequestException({ detail: "missing message" })
        })
      ).joinPublicSession(new FakeSocket(), {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "VALIDATION_ERROR",
        message: "Silent-prayer socket request failed."
      }
    });
  });

  it("maps unexpected service failures to internal socket errors without leaking details", async () => {
    const gateway = gatewayWith(
      new FakeSilentPrayerService({
        publicJoinError: new Error("database password leaked")
      })
    );

    await expect(
      gateway.joinPublicSession(new FakeSocket(), {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "INTERNAL_ERROR",
        message: "Silent-prayer socket request failed."
      }
    });
  });

  it("maps internal HTTP exceptions with string responses to safe socket errors", async () => {
    const gateway = gatewayWith(
      new FakeSilentPrayerService({
        publicJoinError: new HttpException("String failure", 500)
      })
    );

    await expect(
      gateway.joinPublicSession(new FakeSocket(), {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual({
      event: SILENT_PRAYER_SOCKET_EVENTS.error,
      data: {
        code: "INTERNAL_ERROR",
        message: "String failure"
      }
    });
  });
});

function gatewayWith(
  service = new FakeSilentPrayerService(),
  auth = new FakeAuthSessionService(brotherPrincipal)
): SilentPrayerGateway {
  return new SilentPrayerGateway(
    service as unknown as SilentPrayerService,
    auth as unknown as AuthSessionService
  );
}

const brotherPrincipal: CurrentUserPrincipal = {
  id: brotherId,
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnitId]
};

class FakeSilentPrayerService {
  readonly publicJoins: Array<{ readonly id: string; readonly anonymousSessionId: string }> = [];
  readonly brotherJoins: Array<{
    readonly principal: CurrentUserPrincipal;
    readonly id: string;
  }> = [];
  readonly publicRefreshes: Array<{
    readonly id: string;
    readonly anonymousSessionId: string;
  }> = [];
  readonly brotherRefreshes: Array<{
    readonly principal: CurrentUserPrincipal;
    readonly id: string;
  }> = [];
  readonly leaves: Array<{ readonly id: string; readonly participant: SilentPrayerParticipant }> =
    [];

  constructor(
    private readonly options: {
      readonly publicJoinError?: Error;
      readonly brotherJoinError?: Error;
    } = {}
  ) {}

  joinPublicSession(id: string, anonymousSessionId: string) {
    if (this.options.publicJoinError) {
      return Promise.reject(this.options.publicJoinError);
    }

    this.publicJoins.push({ id, anonymousSessionId });

    return Promise.resolve({
      session: {
        id,
        title: "Public Silent Prayer",
        intention: null,
        startsAt: "2026-05-26T10:00:00.000Z",
        endsAt: null,
        visibility: "PUBLIC",
        activeCount: 1
      },
      presence: presence(1)
    });
  }

  joinBrotherSession(principal: CurrentUserPrincipal, id: string) {
    if (this.options.brotherJoinError) {
      return Promise.reject(this.options.brotherJoinError);
    }

    this.brotherJoins.push({ principal, id });

    return Promise.resolve({
      session: {
        id,
        title: "Brother Silent Prayer",
        intention: null,
        startsAt: "2026-05-26T10:00:00.000Z",
        endsAt: null,
        visibility: "BROTHER",
        targetOrganizationUnitId: null,
        activeCount: 1
      },
      presence: presence(1)
    });
  }

  refreshPublicSessionPresence(id: string, anonymousSessionId: string) {
    this.publicRefreshes.push({ id, anonymousSessionId });

    return Promise.resolve(presence(1));
  }

  refreshBrotherSessionPresence(principal: CurrentUserPrincipal, id: string) {
    this.brotherRefreshes.push({ principal, id });

    return Promise.resolve(presence(1));
  }

  leaveSessionPresence(id: string, participant: SilentPrayerParticipant) {
    this.leaves.push({ id, participant });

    return Promise.resolve(presence(0));
  }
}

class FakeAuthSessionService {
  readonly requests: RequestWithPrincipal[] = [];

  constructor(private readonly principal: CurrentUserPrincipal | null) {}

  resolveCurrentUser(request: RequestWithPrincipal): Promise<CurrentUserPrincipal | null> {
    this.requests.push(request);

    return Promise.resolve(this.principal);
  }
}

class FakeSocket {
  readonly id = "socket-1";
  readonly data: {
    silentPrayerParticipations?: Map<
      string,
      {
        readonly eventId: string;
        readonly room: string;
        readonly participant: SilentPrayerParticipant;
        readonly principal?: CurrentUserPrincipal;
      }
    >;
  } = {};
  readonly joinedRooms: string[] = [];
  readonly leftRooms: string[] = [];
  readonly emitted: Array<{ readonly event: string; readonly data: unknown }> = [];
  readonly handshake?: {
    readonly auth?: {
      readonly token?: string;
    };
    readonly headers?: Record<string, string | string[] | undefined>;
  };

  constructor(
    auth?: { readonly token: string },
    headers: Record<string, string | string[] | undefined> = {}
  ) {
    this.handshake = auth
      ? {
          auth,
          headers
        }
      : {
          headers
        };
  }

  join(roomName: string): void {
    this.joinedRooms.push(roomName);
  }

  leave(roomName: string): void {
    this.leftRooms.push(roomName);
  }

  emit(event: string, data: unknown): boolean {
    this.emitted.push({ event, data });

    return true;
  }
}

class FakeServer {
  readonly broadcasts: Array<{
    readonly room: string;
    readonly event: string;
    readonly data: unknown;
  }> = [];

  to(roomName: string) {
    return {
      emit: (event: string, data: unknown): boolean => {
        this.broadcasts.push({ room: roomName, event, data });

        return true;
      }
    };
  }
}

function presence(activeCount: number): SilentPrayerSocketPresence {
  return {
    eventId,
    activeCount,
    expiresAt: "2026-05-26T12:00:45.000Z",
    socketRoom: room
  };
}
