import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createHash } from "node:crypto";
import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getDatabaseWithUrl } from "firebase-admin/database";
import { createClient } from "redis";
import type { SilentPrayerPresenceStore } from "./silent-prayer-presence.types.js";
import { readSilentPrayerRealtimeProvider } from "./silent-prayer-realtime.config.js";

@Injectable()
export class InMemorySilentPrayerPresenceStore implements SilentPrayerPresenceStore {
  private readonly entries = new Map<string, { readonly expiresAtMs: number }>();

  upsertPresence(key: string, ttlMs: number, now: Date): Promise<void> {
    this.entries.set(key, {
      expiresAtMs: now.getTime() + ttlMs
    });

    return Promise.resolve();
  }

  deletePresence(key: string): Promise<void> {
    this.entries.delete(key);

    return Promise.resolve();
  }

  countPresence(prefix: string, now: Date): Promise<number> {
    this.purgeExpired(now);

    let count = 0;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        count += 1;
      }
    }

    return Promise.resolve(count);
  }

  private purgeExpired(now: Date): void {
    const nowMs = now.getTime();

    for (const [key, entry] of this.entries) {
      if (entry.expiresAtMs <= nowMs) {
        this.entries.delete(key);
      }
    }
  }
}

export interface RedisPresenceClient {
  readonly isOpen: boolean;
  connect(): Promise<unknown>;
  set(key: string, value: string, options: { readonly PX: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
  scanIterator(options: {
    readonly MATCH: string;
    readonly COUNT: number;
  }): AsyncIterable<string | string[]>;
  quit(): Promise<unknown>;
}

export type RedisPresenceClientFactory = () => RedisPresenceClient;

export interface SilentPrayerRtdbSnapshot {
  val(): unknown;
}

export interface SilentPrayerRtdbReference {
  set(value: unknown): Promise<unknown>;
  remove(): Promise<unknown>;
  once(eventType: "value"): Promise<SilentPrayerRtdbSnapshot>;
}

export interface SilentPrayerRtdbDatabase {
  ref(path: string): SilentPrayerRtdbReference;
}

@Injectable()
export class RedisSilentPrayerPresenceStore
  implements SilentPrayerPresenceStore, OnModuleDestroy
{
  private readonly redisUrl: string;
  private readonly createClient: RedisPresenceClientFactory;
  private client: RedisPresenceClient | null = null;

  constructor(
    redisUrl = requireSilentPrayerRedisUrl(),
    createClientFactory: RedisPresenceClientFactory = () => createClient({ url: redisUrl })
  ) {
    this.redisUrl = redisUrl;
    this.createClient = createClientFactory;
  }

  async upsertPresence(key: string, ttlMs: number): Promise<void> {
    await (await this.connectedClient()).set(key, "1", { PX: ttlMs });
  }

  async deletePresence(key: string): Promise<void> {
    await (await this.connectedClient()).del(key);
  }

  async countPresence(prefix: string): Promise<number> {
    const client = await this.connectedClient();
    let count = 0;

    for await (const chunk of client.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100
    })) {
      count += Array.isArray(chunk) ? chunk.length : 1;
    }

    return count;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  private async connectedClient(): Promise<RedisPresenceClient> {
    if (!this.client) {
      this.client = this.createClient();
    }

    if (!this.client.isOpen) {
      await this.client.connect();
    }

    return this.client;
  }
}

@Injectable()
export class FirebaseRtdbSilentPrayerPresenceStore implements SilentPrayerPresenceStore {
  constructor(
    private readonly database: SilentPrayerRtdbDatabase,
    private readonly hashSecret: string
  ) {}

  async upsertPresence(key: string, ttlMs: number, now: Date): Promise<void> {
    const parsed = parsePresenceKey(key);
    await this.database.ref(presencePath(parsed.eventId, this.participantKey(key))).set({
      expiresAt: now.getTime() + ttlMs,
      participantType: parsed.participantType,
      updatedAt: now.toISOString()
    });
  }

  async deletePresence(key: string): Promise<void> {
    const parsed = parsePresenceKey(key);
    await this.database.ref(presencePath(parsed.eventId, this.participantKey(key))).remove();
  }

  async countPresence(prefix: string, now: Date): Promise<number> {
    const eventId = parsePresencePrefix(prefix);
    const rootPath = `silentPrayerPresence/${rtdbPathSegment(eventId)}`;
    const snapshot = await this.database.ref(rootPath).once("value");
    const value = snapshot.val();

    if (!isPresenceRecordMap(value)) {
      return 0;
    }

    let activeCount = 0;
    await Promise.all(
      Object.entries(value).map(async ([participantKey, record]) => {
        if (isActivePresenceRecord(record, now)) {
          activeCount += 1;
          return;
        }

        await this.database.ref(`${rootPath}/${rtdbPathSegment(participantKey)}`).remove();
      })
    );

    return activeCount;
  }

  private participantKey(key: string): string {
    return createHash("sha256")
      .update(this.hashSecret)
      .update(":")
      .update(key)
      .digest("hex");
  }
}

export function createConfiguredSilentPrayerPresenceStore(): SilentPrayerPresenceStore {
  const provider = readSilentPrayerRealtimeProvider();

  if (provider === "redis-socket") {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("REDIS_URL is required for production silent-prayer presence.");
      }

      throw new Error("REDIS_URL is required for Redis silent-prayer presence.");
    }

    return new RedisSilentPrayerPresenceStore(redisUrl);
  }

  if (provider === "firebase-rtdb") {
    return new FirebaseRtdbSilentPrayerPresenceStore(
      createConfiguredSilentPrayerRtdbDatabase(),
      requirePresenceHashSecret()
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SILENT_PRAYER_REALTIME_PROVIDER=in-memory is not allowed in production.");
  }

  return new InMemorySilentPrayerPresenceStore();
}

export function createConfiguredSilentPrayerRtdbDatabase(): SilentPrayerRtdbDatabase {
  const databaseUrl = process.env.FIREBASE_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("FIREBASE_DATABASE_URL is required for firebase-rtdb silent-prayer presence.");
  }

  return getDatabaseWithUrl(databaseUrl, resolveFirebaseRtdbApp());
}

function resolveFirebaseRtdbApp(): App {
  const appName = "jp2-silent-prayer-rtdb";
  const existingApp = getApps().find((app) => app.name === appName);

  if (existingApp) {
    return existingApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credential = serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson) as Record<string, string>)
    : applicationDefault();

  return initializeApp(
    {
      credential,
      ...(process.env.FIREBASE_PROJECT_ID
        ? {
            projectId: process.env.FIREBASE_PROJECT_ID
          }
        : {})
    },
    appName
  );
}

function requirePresenceHashSecret(): string {
  const secret = process.env.SILENT_PRAYER_PRESENCE_HASH_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "SILENT_PRAYER_PRESENCE_HASH_SECRET is required for firebase-rtdb silent-prayer presence."
    );
  }

  return secret;
}

function presencePath(eventId: string, participantKey: string): string {
  return `silentPrayerPresence/${rtdbPathSegment(eventId)}/${rtdbPathSegment(participantKey)}`;
}

function parsePresenceKey(key: string): {
  readonly eventId: string;
  readonly participantType: "anonymous" | "authenticated";
} {
  const match = /^silent-prayer:([^:]+):presence:(anonymous|authenticated):.+$/.exec(key);

  if (!match) {
    throw new Error("Invalid silent-prayer presence key.");
  }

  return {
    eventId: decodeURIComponent(match[1]!),
    participantType: match[2] as "anonymous" | "authenticated"
  };
}

function parsePresencePrefix(prefix: string): string {
  const match = /^silent-prayer:([^:]+):presence:$/.exec(prefix);

  if (!match) {
    throw new Error("Invalid silent-prayer presence prefix.");
  }

  return decodeURIComponent(match[1]!);
}

function rtdbPathSegment(value: string): string {
  return encodeURIComponent(value);
}

function isPresenceRecordMap(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isActivePresenceRecord(record: unknown, now: Date): boolean {
  return (
    typeof record === "object" &&
    record !== null &&
    "expiresAt" in record &&
    typeof record.expiresAt === "number" &&
    Number.isFinite(record.expiresAt) &&
    record.expiresAt > now.getTime()
  );
}

function requireSilentPrayerRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is required for Redis silent-prayer presence.");
  }

  return redisUrl;
}
