import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable
} from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import {
  publicSilentPrayerJoinRequestSchema,
  publicSilentPrayerSocketJoinPayloadSchema,
  silentPrayerSocketEventPayloadSchema
} from "@jp2/shared-validation";
import { AuthSessionService } from "../auth/auth-session.service.js";
import type { CurrentUserPrincipal, RequestWithPrincipal } from "../auth/current-user.types.js";
import type { SilentPrayerParticipant } from "./silent-prayer-presence.types.js";
import { SilentPrayerService, type SilentPrayerSocketPresence } from "./silent-prayer.service.js";

interface SilentPrayerSocket {
  readonly id: string;
  readonly handshake?: {
    readonly auth?: {
      readonly token?: unknown;
    };
    readonly headers?: Record<string, string | string[] | undefined>;
  };
  readonly data: {
    silentPrayerParticipations?: Map<string, JoinedSilentPrayerPresence>;
  };
  join(room: string): Promise<void> | void;
  leave(room: string): Promise<void> | void;
  emit(event: string, data: unknown): boolean;
}

interface SilentPrayerServer {
  to(room: string): {
    emit(event: string, data: unknown): boolean;
  };
}

interface JoinedSilentPrayerPresence {
  readonly eventId: string;
  readonly room: string;
  readonly participant: SilentPrayerParticipant;
  readonly principal?: CurrentUserPrincipal;
}

interface SocketAck<T> {
  readonly event: string;
  readonly data: T;
}

interface SilentPrayerSocketError {
  readonly code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_ERROR";
  readonly message: string;
}

export const SILENT_PRAYER_SOCKET_NAMESPACE = "silent-prayer";

export const SILENT_PRAYER_SOCKET_EVENTS = {
  publicJoin: "silent-prayer:public:join",
  brotherJoin: "silent-prayer:brother:join",
  heartbeat: "silent-prayer:heartbeat",
  leave: "silent-prayer:leave",
  joined: "silent-prayer:joined",
  presence: "silent-prayer:presence",
  error: "silent-prayer:error"
} as const;

@Injectable()
@WebSocketGateway({
  namespace: SILENT_PRAYER_SOCKET_NAMESPACE,
  cors: {
    origin: true,
    credentials: true
  }
})
export class SilentPrayerGateway implements OnGatewayDisconnect<SilentPrayerSocket> {
  @WebSocketServer()
  server?: SilentPrayerServer;

  constructor(
    private readonly silentPrayerService: SilentPrayerService,
    private readonly authSessionService: AuthSessionService
  ) {}

  @SubscribeMessage(SILENT_PRAYER_SOCKET_EVENTS.publicJoin)
  joinPublicSession(
    @ConnectedSocket() client: SilentPrayerSocket,
    @MessageBody() payload: unknown
  ): Promise<SocketAck<unknown>> {
    return this.withSocketErrors(client, async () => {
      const data = parsePublicJoinPayload(payload);
      const response = await this.silentPrayerService.joinPublicSession(
        data.eventId,
        data.anonymousSessionId
      );

      await this.rememberPresence(client, {
        eventId: data.eventId,
        room: response.presence.socketRoom,
        participant: {
          type: "anonymous",
          sessionId: data.anonymousSessionId
        }
      });
      this.broadcastPresence(response.presence);

      return {
        event: SILENT_PRAYER_SOCKET_EVENTS.joined,
        data: response
      };
    });
  }

  @SubscribeMessage(SILENT_PRAYER_SOCKET_EVENTS.brotherJoin)
  joinBrotherSession(
    @ConnectedSocket() client: SilentPrayerSocket,
    @MessageBody() payload: unknown
  ): Promise<SocketAck<unknown>> {
    return this.withSocketErrors(client, async () => {
      const data = parseEventPayload(payload);
      const principal = await this.requirePrincipal(client);
      const response = await this.silentPrayerService.joinBrotherSession(principal, data.eventId);

      await this.rememberPresence(client, {
        eventId: data.eventId,
        room: response.presence.socketRoom,
        participant: {
          type: "authenticated",
          userId: principal.id
        },
        principal
      });
      this.broadcastPresence(response.presence);

      return {
        event: SILENT_PRAYER_SOCKET_EVENTS.joined,
        data: response
      };
    });
  }

  @SubscribeMessage(SILENT_PRAYER_SOCKET_EVENTS.heartbeat)
  heartbeat(
    @ConnectedSocket() client: SilentPrayerSocket,
    @MessageBody() payload: unknown
  ): Promise<SocketAck<unknown>> {
    return this.withSocketErrors(client, async () => {
      const data = parseEventPayload(payload);
      const joined = this.requireJoinedPresence(client, data.eventId);
      const presence =
        joined.participant.type === "anonymous"
          ? await this.silentPrayerService.refreshPublicSessionPresence(
              data.eventId,
              joined.participant.sessionId
            )
          : await this.silentPrayerService.refreshBrotherSessionPresence(
              joined.principal ?? (await this.requirePrincipal(client)),
              data.eventId
            );

      this.broadcastPresence(presence);

      return {
        event: SILENT_PRAYER_SOCKET_EVENTS.presence,
        data: presence
      };
    });
  }

  @SubscribeMessage(SILENT_PRAYER_SOCKET_EVENTS.leave)
  leave(
    @ConnectedSocket() client: SilentPrayerSocket,
    @MessageBody() payload: unknown
  ): Promise<SocketAck<unknown>> {
    return this.withSocketErrors(client, async () => {
      const data = parseEventPayload(payload);
      const joined = this.requireJoinedPresence(client, data.eventId);
      const presence = await this.silentPrayerService.leaveSessionPresence(
        data.eventId,
        joined.participant
      );

      await client.leave(joined.room);
      this.joinedPresences(client).delete(data.eventId);
      this.broadcastPresence(presence);

      return {
        event: SILENT_PRAYER_SOCKET_EVENTS.presence,
        data: presence
      };
    });
  }

  handleDisconnect(client: SilentPrayerSocket): void {
    client.data.silentPrayerParticipations?.clear();
  }

  private async rememberPresence(
    client: SilentPrayerSocket,
    joined: JoinedSilentPrayerPresence
  ): Promise<void> {
    await client.join(joined.room);
    this.joinedPresences(client).set(joined.eventId, joined);
  }

  private requireJoinedPresence(
    client: SilentPrayerSocket,
    eventId: string
  ): JoinedSilentPrayerPresence {
    const joined = this.joinedPresences(client).get(eventId);

    if (!joined) {
      throw new BadRequestException("Socket has not joined this silent-prayer session.");
    }

    return joined;
  }

  private joinedPresences(client: SilentPrayerSocket): Map<string, JoinedSilentPrayerPresence> {
    if (!client.data.silentPrayerParticipations) {
      client.data.silentPrayerParticipations = new Map();
    }

    return client.data.silentPrayerParticipations;
  }

  private async requirePrincipal(client: SilentPrayerSocket): Promise<CurrentUserPrincipal> {
    const principal = await this.authSessionService.resolveCurrentUser(toAuthRequest(client));

    if (!principal) {
      throw new ForbiddenException("Authentication is required.");
    }

    if (principal.status === "inactive" || principal.status === "archived") {
      throw new ForbiddenException("Inactive principals cannot access protected app modes.");
    }

    return principal;
  }

  private broadcastPresence(presence: SilentPrayerSocketPresence): void {
    this.server?.to(presence.socketRoom).emit(SILENT_PRAYER_SOCKET_EVENTS.presence, presence);
  }

  private async withSocketErrors<T>(
    client: SilentPrayerSocket,
    operation: () => Promise<SocketAck<T>>
  ): Promise<SocketAck<T | SilentPrayerSocketError>> {
    try {
      return await operation();
    } catch (error) {
      const socketError = toSocketError(error);
      client.emit(SILENT_PRAYER_SOCKET_EVENTS.error, socketError);

      return {
        event: SILENT_PRAYER_SOCKET_EVENTS.error,
        data: socketError
      };
    }
  }
}

function parsePublicJoinPayload(payload: unknown) {
  try {
    const record = requirePayloadRecord(payload);
    const eventId = parseSocketEventId(record.eventId);
    const body = publicSilentPrayerJoinRequestSchema.parse({
      anonymousSessionId: record.anonymousSessionId
    });

    publicSilentPrayerSocketJoinPayloadSchema.parse({
      ...body,
      eventId
    });

    return {
      eventId,
      anonymousSessionId: body.anonymousSessionId
    };
  } catch {
    throw new BadRequestException("Invalid public silent-prayer join payload.");
  }
}

function parseEventPayload(payload: unknown) {
  try {
    const record = requirePayloadRecord(payload);
    const eventId = parseSocketEventId(record.eventId);

    silentPrayerSocketEventPayloadSchema.parse({ eventId });

    return { eventId };
  } catch {
    throw new BadRequestException("Invalid silent-prayer socket payload.");
  }
}

function parseSocketEventId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value
    )
  ) {
    throw new BadRequestException("silent prayer event id must be a UUID.");
  }

  return value;
}

function requirePayloadRecord(payload: unknown): Record<string, unknown> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new BadRequestException("Socket payload must be an object.");
  }

  return payload as Record<string, unknown>;
}

function toAuthRequest(client: SilentPrayerSocket): RequestWithPrincipal {
  const headers = { ...(client.handshake?.headers ?? {}) };
  const token = client.handshake?.auth?.token;

  if (typeof token === "string" && token.trim().length > 0) {
    headers.authorization = `Bearer ${token.trim()}`;
  }

  return {
    headers,
    cookies: parseCookieHeader(headers.cookie)
  };
}

function parseCookieHeader(value: string | string[] | undefined): Record<string, string> {
  const cookieHeader = Array.isArray(value) ? value[0] : value;

  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        const key = separatorIndex >= 0 ? entry.slice(0, separatorIndex) : entry;
        const rawValue = separatorIndex >= 0 ? entry.slice(separatorIndex + 1) : "";

        return [key, decodeURIComponent(rawValue)];
      })
  );
}

function toSocketError(error: unknown): SilentPrayerSocketError {
  if (error instanceof HttpException) {
    return {
      code: toSocketErrorCode(error.getStatus()),
      message: toSocketErrorMessage(error)
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Silent-prayer socket request failed."
  };
}

function toSocketErrorCode(status: number): SilentPrayerSocketError["code"] {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    default:
      return "INTERNAL_ERROR";
  }
}

function toSocketErrorMessage(error: HttpException): string {
  const response = error.getResponse();

  if (typeof response === "string") {
    return response;
  }

  if (
    typeof response === "object" &&
    response !== null &&
    "message" in response &&
    typeof response.message === "string"
  ) {
    return response.message;
  }

  return "Silent-prayer socket request failed.";
}
