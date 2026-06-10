import type {
  BrotherSilentPrayerJoinResponseDto,
  PublicSilentPrayerJoinResponseDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";
import type { ExpoFirebaseOptions } from "./mobile-firebase-google-provider-core.js";
import type { SilentPrayerFetch } from "./silent-prayer-api.js";
import {
  heartbeatBrotherSilentPrayerSession,
  heartbeatPublicSilentPrayerSession,
  leaveBrotherSilentPrayerSession,
  leavePublicSilentPrayerSession
} from "./silent-prayer-api.js";
import { createFirebaseSilentPrayerCountClient } from "./silent-prayer-rtdb.js";
import {
  startBrotherSilentPrayerRealtime as startBrotherSilentPrayerSocketRealtime,
  startPublicSilentPrayerRealtime as startPublicSilentPrayerSocketRealtime,
  type SilentPrayerRealtimeSession,
  type SilentPrayerSocketError,
  type SilentPrayerSocketFactory
} from "./silent-prayer-socket.js";

export type { SilentPrayerRealtimeSession } from "./silent-prayer-socket.js";
export type SilentPrayerRealtimeError = SilentPrayerSocketError;
export type SilentPrayerRealtimeProvider = "redis-socket" | "firebase-rtdb" | "in-memory";

export interface SilentPrayerFirebaseRealtimeConfig extends ExpoFirebaseOptions {
  databaseURL: string;
}

export type SilentPrayerRealtimeConfig =
  | {
      provider: "firebase-rtdb";
      firebase: SilentPrayerFirebaseRealtimeConfig | null;
    }
  | {
      provider: "redis-socket" | "in-memory";
      firebase?: undefined;
    };

export interface SilentPrayerRealtimeCountClient {
  subscribeCount(
    path: string,
    onCount: (activeCount: number) => void,
    onError?: (error: unknown) => void
  ): () => void;
}

export interface SilentPrayerRealtimeCallbacks<TJoined> {
  onJoined?: (response: TJoined) => void;
  onPresence?: (presence: SilentPrayerPresenceDto) => void;
  onError?: (error: SilentPrayerRealtimeError) => void;
}

export interface StartPublicSilentPrayerRealtimeOptions
  extends SilentPrayerRealtimeCallbacks<PublicSilentPrayerJoinResponseDto> {
  baseUrl: string;
  eventId: string;
  anonymousSessionId: string;
  heartbeatIntervalMs?: number;
  socketFactory?: SilentPrayerSocketFactory;
  provider?: SilentPrayerRealtimeProvider;
  realtimeConfig?: SilentPrayerRealtimeConfig;
  countClient?: SilentPrayerRealtimeCountClient;
  fetchImpl?: SilentPrayerFetch;
}

export interface StartBrotherSilentPrayerRealtimeOptions
  extends SilentPrayerRealtimeCallbacks<BrotherSilentPrayerJoinResponseDto> {
  baseUrl: string;
  eventId: string;
  authToken: string;
  heartbeatIntervalMs?: number;
  socketFactory?: SilentPrayerSocketFactory;
  provider?: SilentPrayerRealtimeProvider;
  realtimeConfig?: SilentPrayerRealtimeConfig;
  countClient?: SilentPrayerRealtimeCountClient;
  fetchImpl?: SilentPrayerFetch;
}

export function startPublicSilentPrayerRealtime(
  options: StartPublicSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  if (resolveRealtimeConfig(options).provider !== "firebase-rtdb") {
    return startPublicSilentPrayerSocketRealtime(options);
  }

  return startPublicSilentPrayerRtdbRealtime(options);
}

export function startBrotherSilentPrayerRealtime(
  options: StartBrotherSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  if (resolveRealtimeConfig(options).provider !== "firebase-rtdb") {
    return startBrotherSilentPrayerSocketRealtime(options);
  }

  return startBrotherSilentPrayerRtdbRealtime(options);
}

export function buildSilentPrayerRtdbCountPath(
  audience: "public" | "private",
  eventId: string
): string {
  const root = audience === "public" ? "silentPrayerPublicCounts" : "silentPrayerPrivateCounts";

  return `${root}/${eventId}`;
}

export function readSilentPrayerRealtimeConfig(
  env: Record<string, unknown> = process.env
): SilentPrayerRealtimeConfig {
  const provider = readRealtimeProvider(env);

  if (provider !== "firebase-rtdb") {
    return { provider };
  }

  return {
    provider,
    firebase: readFirebaseRealtimeConfig(env)
  };
}

function startPublicSilentPrayerRtdbRealtime(
  options: StartPublicSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  return startSilentPrayerRtdbRealtime({
    audience: "public",
    baseUrl: options.baseUrl,
    eventId: options.eventId,
    heartbeatIntervalMs: options.heartbeatIntervalMs,
    countClient: resolveCountClient(options),
    heartbeat: () =>
      heartbeatPublicSilentPrayerSession({
        id: options.eventId,
        anonymousSessionId: options.anonymousSessionId,
        baseUrl: options.baseUrl,
        ...optionalObjectProperty("fetchImpl", options.fetchImpl)
      }),
    leave: () =>
      leavePublicSilentPrayerSession({
        id: options.eventId,
        anonymousSessionId: options.anonymousSessionId,
        baseUrl: options.baseUrl,
        ...optionalObjectProperty("fetchImpl", options.fetchImpl)
      }),
    onPresence: options.onPresence,
    onError: options.onError
  });
}

function startBrotherSilentPrayerRtdbRealtime(
  options: StartBrotherSilentPrayerRealtimeOptions
): SilentPrayerRealtimeSession {
  return startSilentPrayerRtdbRealtime({
    audience: "private",
    baseUrl: options.baseUrl,
    eventId: options.eventId,
    heartbeatIntervalMs: options.heartbeatIntervalMs,
    countClient: resolveCountClient(options),
    heartbeat: () =>
      heartbeatBrotherSilentPrayerSession({
        id: options.eventId,
        baseUrl: options.baseUrl,
        authToken: options.authToken,
        ...optionalObjectProperty("fetchImpl", options.fetchImpl)
      }),
    leave: () =>
      leaveBrotherSilentPrayerSession({
        id: options.eventId,
        baseUrl: options.baseUrl,
        authToken: options.authToken,
        ...optionalObjectProperty("fetchImpl", options.fetchImpl)
      }),
    onPresence: options.onPresence,
    onError: options.onError
  });
}

function startSilentPrayerRtdbRealtime(options: {
  audience: "public" | "private";
  baseUrl: string;
  eventId: string;
  heartbeatIntervalMs: number | undefined;
  countClient: SilentPrayerRealtimeCountClient | null;
  heartbeat: () => Promise<{ presence: { activeCount: number; expiresAt: string } }>;
  leave: () => Promise<{ presence: { activeCount: number; expiresAt: string } }>;
  onPresence: ((presence: SilentPrayerPresenceDto) => void) | undefined;
  onError: ((error: SilentPrayerRealtimeError) => void) | undefined;
}): SilentPrayerRealtimeSession {
  let closed = false;
  let latestExpiresAt = new Date(Date.now() + 30_000).toISOString();
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  const unsubscribe = options.countClient?.subscribeCount(
    buildSilentPrayerRtdbCountPath(options.audience, options.eventId),
    (activeCount) => {
      options.onPresence?.(toSilentPrayerPresence(options.eventId, activeCount, latestExpiresAt));
    },
    () => {
      options.onError?.({
        code: "INTERNAL_ERROR",
        message: "Silent-prayer realtime count listener failed."
      });
    }
  );

  if (!options.countClient) {
    options.onError?.({
      code: "INTERNAL_ERROR",
      message: "Silent-prayer Firebase RTDB listener is not configured."
    });
  }

  function updatePresenceFromApi(response: {
    presence: { activeCount: number; expiresAt: string };
  }): void {
    latestExpiresAt = response.presence.expiresAt;
    options.onPresence?.(
      toSilentPrayerPresence(options.eventId, response.presence.activeCount, latestExpiresAt)
    );
  }

  function sendHeartbeat(): void {
    void options
      .heartbeat()
      .then(updatePresenceFromApi)
      .catch(() => {
        options.onError?.({
          code: "INTERNAL_ERROR",
          message: "Silent-prayer heartbeat failed."
        });
      });
  }

  function stopHeartbeat(): void {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  }

  sendHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, options.heartbeatIntervalMs ?? 25_000);

  function close(emitLeave: boolean): void {
    if (closed) {
      return;
    }

    closed = true;
    stopHeartbeat();
    unsubscribe?.();

    if (emitLeave) {
      void options
        .leave()
        .then(updatePresenceFromApi)
        .catch(() => {
          options.onError?.({
            code: "INTERNAL_ERROR",
            message: "Silent-prayer leave failed."
          });
        });
    }
  }

  return {
    leave: () => close(true),
    disconnect: () => close(false)
  };
}

function resolveRealtimeConfig(options: {
  provider?: SilentPrayerRealtimeProvider;
  realtimeConfig?: SilentPrayerRealtimeConfig;
}): SilentPrayerRealtimeConfig {
  if (options.realtimeConfig) {
    return options.realtimeConfig;
  }

  if (options.provider) {
    return options.provider === "firebase-rtdb"
      ? { provider: "firebase-rtdb", firebase: null }
      : { provider: options.provider };
  }

  return readSilentPrayerRealtimeConfig();
}

function resolveCountClient(options: {
  countClient?: SilentPrayerRealtimeCountClient;
  provider?: SilentPrayerRealtimeProvider;
  realtimeConfig?: SilentPrayerRealtimeConfig;
}): SilentPrayerRealtimeCountClient | null {
  if (options.countClient) {
    return options.countClient;
  }

  const config = resolveRealtimeConfig(options);

  if (config.provider !== "firebase-rtdb" || !config.firebase) {
    return null;
  }

  return createFirebaseSilentPrayerCountClient(config.firebase);
}

function toSilentPrayerPresence(
  eventId: string,
  activeCount: number,
  expiresAt: string
): SilentPrayerPresenceDto {
  return {
    eventId,
    activeCount,
    expiresAt,
    socketRoom: `silent-prayer:${eventId}`
  };
}

function readRealtimeProvider(env: Record<string, unknown>): SilentPrayerRealtimeProvider {
  const value =
    readEnvString(env, "EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER") ??
    readEnvString(env, "SILENT_PRAYER_REALTIME_PROVIDER");

  if (value === "firebase-rtdb" || value === "in-memory" || value === "redis-socket") {
    return value;
  }

  return "redis-socket";
}

function readFirebaseRealtimeConfig(
  env: Record<string, unknown>
): SilentPrayerFirebaseRealtimeConfig | null {
  const apiKey = readEnvString(env, "EXPO_PUBLIC_FIREBASE_API_KEY");
  const authDomain = readEnvString(env, "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = readEnvString(env, "EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  const appId = readEnvString(env, "EXPO_PUBLIC_FIREBASE_APP_ID");
  const databaseURL =
    readEnvString(env, "EXPO_PUBLIC_FIREBASE_DATABASE_URL") ??
    readEnvString(env, "FIREBASE_DATABASE_URL");

  if (!apiKey || !authDomain || !projectId || !appId || !databaseURL) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    databaseURL,
    ...optionalObjectProperty(
      "messagingSenderId",
      readEnvString(env, "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
    ),
    ...optionalObjectProperty(
      "storageBucket",
      readEnvString(env, "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET")
    )
  };
}

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalObjectProperty<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined
): Partial<Record<TKey, TValue>> {
  return value ? ({ [key]: value } as Partial<Record<TKey, TValue>>) : {};
}
