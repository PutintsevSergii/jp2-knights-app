import { io } from "socket.io-client";
import {
  brotherSilentPrayerJoinResponseSchema,
  publicSilentPrayerJoinResponseSchema,
  silentPrayerPresenceSchema,
  type BrotherSilentPrayerJoinResponseDto,
  type PublicSilentPrayerJoinResponseDto,
  type SilentPrayerPresenceDto
} from "@jp2/shared-validation";
import { normalizeBaseUrl } from "./mobile-api-client.js";

export const SILENT_PRAYER_SOCKET_NAMESPACE = "silent-prayer";

export const SILENT_PRAYER_SOCKET_EVENTS = {
  publicJoin: "silent-prayer:public:join",
  brotherJoin: "silent-prayer:brother:join",
  heartbeat: "silent-prayer:heartbeat",
  leave: "silent-prayer:leave",
  joined: "silent-prayer:joined",
  presence: "silent-prayer:presence",
  error: "silent-prayer:error",
  connect: "connect"
} as const;

export interface SilentPrayerSocketError {
  code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_ERROR";
  message: string;
}

export interface SilentPrayerSocketTransport {
  connect(): void;
  disconnect(): void;
  emit(event: string, payload: unknown): void;
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
}

export type SilentPrayerSocketFactory = (
  url: string,
  options: {
    auth?: { token: string };
    autoConnect: boolean;
    transports: ["websocket"];
  }
) => SilentPrayerSocketTransport;

export interface SilentPrayerRealtimeSession {
  leave(): void;
  disconnect(): void;
}

export interface SilentPrayerRealtimeCallbacks<TJoined> {
  onJoined?: (response: TJoined) => void;
  onPresence?: (presence: SilentPrayerPresenceDto) => void;
  onError?: (error: SilentPrayerSocketError) => void;
}

export interface StartPublicSilentPrayerRealtimeOptions
  extends SilentPrayerRealtimeCallbacks<PublicSilentPrayerJoinResponseDto> {
  baseUrl: string;
  eventId: string;
  anonymousSessionId: string;
  heartbeatIntervalMs?: number;
  socketFactory?: SilentPrayerSocketFactory;
}

export interface StartBrotherSilentPrayerRealtimeOptions
  extends SilentPrayerRealtimeCallbacks<BrotherSilentPrayerJoinResponseDto> {
  baseUrl: string;
  eventId: string;
  authToken: string;
  heartbeatIntervalMs?: number;
  socketFactory?: SilentPrayerSocketFactory;
}

export function buildSilentPrayerSocketUrl(baseUrl: string): string {
  return new URL(SILENT_PRAYER_SOCKET_NAMESPACE, normalizeBaseUrl(baseUrl)).toString();
}

export function startPublicSilentPrayerRealtime(
  options: StartPublicSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  const socket = createSilentPrayerSocketTransport(options);

  return startSilentPrayerRealtime({
    socket,
    eventId: options.eventId,
    joinEvent: SILENT_PRAYER_SOCKET_EVENTS.publicJoin,
    joinPayload: {
      eventId: options.eventId,
      anonymousSessionId: options.anonymousSessionId
    },
    parseJoined: (payload) => publicSilentPrayerJoinResponseSchema.parse(payload),
    heartbeatIntervalMs: options.heartbeatIntervalMs,
    onJoined: options.onJoined,
    onPresence: options.onPresence,
    onError: options.onError
  });
}

export function startBrotherSilentPrayerRealtime(
  options: StartBrotherSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  const socket = createSilentPrayerSocketTransport(options);

  return startSilentPrayerRealtime({
    socket,
    eventId: options.eventId,
    joinEvent: SILENT_PRAYER_SOCKET_EVENTS.brotherJoin,
    joinPayload: {
      eventId: options.eventId
    },
    parseJoined: (payload) => brotherSilentPrayerJoinResponseSchema.parse(payload),
    heartbeatIntervalMs: options.heartbeatIntervalMs,
    onJoined: options.onJoined,
    onPresence: options.onPresence,
    onError: options.onError
  });
}

function startSilentPrayerRealtime<TJoined>(options: {
  socket: SilentPrayerSocketTransport;
  eventId: string;
  joinEvent: string;
  joinPayload: Record<string, string>;
  parseJoined: (payload: unknown) => TJoined;
  heartbeatIntervalMs: number | undefined;
  onJoined: ((response: TJoined) => void) | undefined;
  onPresence: ((presence: SilentPrayerPresenceDto) => void) | undefined;
  onError: ((error: SilentPrayerSocketError) => void) | undefined;
}): SilentPrayerRealtimeSession {
  let closed = false;
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

  function emitJoin() {
    options.socket.emit(options.joinEvent, options.joinPayload);
  }

  function emitHeartbeat() {
    options.socket.emit(SILENT_PRAYER_SOCKET_EVENTS.heartbeat, { eventId: options.eventId });
  }

  function startHeartbeat() {
    if (!heartbeatTimer) {
      heartbeatTimer = setInterval(emitHeartbeat, options.heartbeatIntervalMs ?? 25_000);
    }
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  }

  function handleJoined(payload: unknown) {
    try {
      const response = options.parseJoined(payload);
      options.onJoined?.(response);
      startHeartbeat();
    } catch {
      options.onError?.({
        code: "INTERNAL_ERROR",
        message: "Invalid silent-prayer joined payload."
      });
    }
  }

  function handlePresence(payload: unknown) {
    try {
      const presence = silentPrayerPresenceSchema.parse(payload);
      options.onPresence?.(presence);
    } catch {
      options.onError?.({
        code: "INTERNAL_ERROR",
        message: "Invalid silent-prayer presence payload."
      });
    }
  }

  function handleError(payload: unknown) {
    options.onError?.(parseSocketError(payload));
  }

  function close(emitLeave: boolean) {
    if (closed) {
      return;
    }

    closed = true;
    stopHeartbeat();
    options.socket.off(SILENT_PRAYER_SOCKET_EVENTS.connect, emitJoin);
    options.socket.off(SILENT_PRAYER_SOCKET_EVENTS.joined, handleJoined);
    options.socket.off(SILENT_PRAYER_SOCKET_EVENTS.presence, handlePresence);
    options.socket.off(SILENT_PRAYER_SOCKET_EVENTS.error, handleError);

    if (emitLeave) {
      options.socket.emit(SILENT_PRAYER_SOCKET_EVENTS.leave, { eventId: options.eventId });
    }

    options.socket.disconnect();
  }

  options.socket.on(SILENT_PRAYER_SOCKET_EVENTS.connect, emitJoin);
  options.socket.on(SILENT_PRAYER_SOCKET_EVENTS.joined, handleJoined);
  options.socket.on(SILENT_PRAYER_SOCKET_EVENTS.presence, handlePresence);
  options.socket.on(SILENT_PRAYER_SOCKET_EVENTS.error, handleError);
  options.socket.connect();

  return {
    leave: () => close(true),
    disconnect: () => close(false)
  };
}

function createSilentPrayerSocketTransport(options: {
  baseUrl: string;
  authToken?: string | undefined;
  socketFactory?: SilentPrayerSocketFactory | undefined;
}): SilentPrayerSocketTransport {
  const factory = options.socketFactory ?? defaultSilentPrayerSocketFactory;
  const socketOptions: Parameters<SilentPrayerSocketFactory>[1] = {
    autoConnect: false,
    transports: ["websocket"]
  };

  if (options.authToken) {
    socketOptions.auth = { token: options.authToken };
  }

  return factory(buildSilentPrayerSocketUrl(options.baseUrl), socketOptions);
}

function defaultSilentPrayerSocketFactory(
  url: string,
  options: Parameters<SilentPrayerSocketFactory>[1]
): SilentPrayerSocketTransport {
  return io(url, options);
}

function parseSocketError(payload: unknown): SilentPrayerSocketError {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload &&
    isSilentPrayerSocketErrorCode(payload.code) &&
    typeof payload.message === "string"
  ) {
    return {
      code: payload.code,
      message: payload.message
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Silent-prayer socket request failed."
  };
}

function isSilentPrayerSocketErrorCode(value: unknown): value is SilentPrayerSocketError["code"] {
  return (
    value === "VALIDATION_ERROR" ||
    value === "UNAUTHORIZED" ||
    value === "FORBIDDEN" ||
    value === "NOT_FOUND" ||
    value === "INTERNAL_ERROR"
  );
}
