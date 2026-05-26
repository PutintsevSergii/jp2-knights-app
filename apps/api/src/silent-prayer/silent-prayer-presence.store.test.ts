import { afterEach, describe, expect, it } from "vitest";
import {
  createConfiguredSilentPrayerPresenceStore,
  InMemorySilentPrayerPresenceStore,
  RedisSilentPrayerPresenceStore,
  type RedisPresenceClient
} from "./silent-prayer-presence.store.js";

describe("RedisSilentPrayerPresenceStore", () => {
  it("uses Redis TTL keys for aggregate presence without storing identities in values", async () => {
    const client = new FakeRedisPresenceClient();
    const store = new RedisSilentPrayerPresenceStore("redis://example.test:6379", () => client);

    await store.upsertPresence("silent-prayer:event-1:presence:anonymous:guest-1", 45_000);
    await store.upsertPresence("silent-prayer:event-1:presence:authenticated:user-1", 45_000);
    await store.upsertPresence("silent-prayer:event-2:presence:anonymous:guest-2", 45_000);

    await expect(store.countPresence("silent-prayer:event-1:presence:")).resolves.toBe(2);
    expect(client.values).toEqual(["1", "1", "1"]);
    expect(client.ttls).toEqual([45_000, 45_000, 45_000]);

    await store.deletePresence("silent-prayer:event-1:presence:anonymous:guest-1");
    await expect(store.countPresence("silent-prayer:event-1:presence:")).resolves.toBe(1);
  });

  it("closes its Redis client on module shutdown", async () => {
    const client = new FakeRedisPresenceClient();
    const store = new RedisSilentPrayerPresenceStore("redis://example.test:6379", () => client);

    await store.countPresence("silent-prayer:event-1:presence:");
    await store.onModuleDestroy();

    expect(client.quitCount).toBe(1);
    expect(client.isOpen).toBe(false);
  });
});

describe("createConfiguredSilentPrayerPresenceStore", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRedisUrl = process.env.REDIS_URL;

  afterEach(() => {
    setOptionalEnv("NODE_ENV", originalNodeEnv);
    setOptionalEnv("REDIS_URL", originalRedisUrl);
  });

  it("keeps the deterministic in-memory store when Redis is not configured outside production", () => {
    delete process.env.REDIS_URL;
    process.env.NODE_ENV = "test";

    expect(createConfiguredSilentPrayerPresenceStore()).toBeInstanceOf(
      InMemorySilentPrayerPresenceStore
    );
  });

  it("fails fast in production when Redis presence is missing", () => {
    delete process.env.REDIS_URL;
    process.env.NODE_ENV = "production";

    expect(() => createConfiguredSilentPrayerPresenceStore()).toThrow(
      "REDIS_URL is required for production silent-prayer presence."
    );
  });

  it("selects the Redis store when Redis is configured", () => {
    process.env.REDIS_URL = "redis://example.test:6379";
    process.env.NODE_ENV = "test";

    expect(createConfiguredSilentPrayerPresenceStore()).toBeInstanceOf(
      RedisSilentPrayerPresenceStore
    );
  });

  it("fails fast when the Redis store is constructed without a Redis URL", () => {
    delete process.env.REDIS_URL;

    expect(() => new RedisSilentPrayerPresenceStore()).toThrow(
      "REDIS_URL is required for Redis silent-prayer presence."
    );
  });
});

class FakeRedisPresenceClient implements RedisPresenceClient {
  isOpen = false;
  readonly values: string[] = [];
  readonly ttls: number[] = [];
  quitCount = 0;
  private readonly keys = new Set<string>();

  connect(): Promise<void> {
    this.isOpen = true;

    return Promise.resolve();
  }

  set(key: string, value: string, options: { readonly PX: number }): Promise<void> {
    this.keys.add(key);
    this.values.push(value);
    this.ttls.push(options.PX);

    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.keys.delete(key);

    return Promise.resolve();
  }

  async *scanIterator(options: { readonly MATCH: string }): AsyncIterable<string[]> {
    const prefix = options.MATCH.endsWith("*") ? options.MATCH.slice(0, -1) : options.MATCH;
    await Promise.resolve();

    yield [...this.keys].filter((key) => key.startsWith(prefix));
  }

  quit(): Promise<void> {
    this.quitCount += 1;
    this.isOpen = false;

    return Promise.resolve();
  }
}

function setOptionalEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
