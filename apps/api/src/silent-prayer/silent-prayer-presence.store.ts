import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createClient } from "redis";
import type { SilentPrayerPresenceStore } from "./silent-prayer-presence.types.js";

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

export function createConfiguredSilentPrayerPresenceStore(): SilentPrayerPresenceStore {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return new RedisSilentPrayerPresenceStore(redisUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_URL is required for production silent-prayer presence.");
  }

  return new InMemorySilentPrayerPresenceStore();
}

function requireSilentPrayerRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is required for Redis silent-prayer presence.");
  }

  return redisUrl;
}
