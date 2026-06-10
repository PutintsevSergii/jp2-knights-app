import { afterEach, describe, expect, it } from "vitest";
import {
  createConfiguredSilentPrayerPresenceStore,
  FirebaseRtdbSilentPrayerPresenceStore,
  InMemorySilentPrayerPresenceStore,
  RedisSilentPrayerPresenceStore,
  type SilentPrayerRtdbDatabase,
  type SilentPrayerRtdbReference,
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

describe("FirebaseRtdbSilentPrayerPresenceStore", () => {
  it("hashes participant keys and stores only aggregate-safe presence metadata", async () => {
    const database = new FakeSilentPrayerRtdbDatabase();
    const store = new FirebaseRtdbSilentPrayerPresenceStore(database, "presence-secret");
    const now = new Date("2026-06-09T12:00:00.000Z");

    await store.upsertPresence("silent-prayer:event-1:presence:anonymous:guest-1", 45_000, now);
    await store.upsertPresence(
      "silent-prayer:event-1:presence:authenticated:user-1",
      45_000,
      now
    );

    expect([...database.values.keys()]).toEqual([
      "silentPrayerPresence/event-1/59e794c906749f0ae45df1b4855448a307681bf783d08222c274e92a4c28b236",
      "silentPrayerPresence/event-1/5307dcf146f2bf12365a5f9aba7ae488e78d7747b74a8e2c517a2f5f0ed7c114"
    ]);
    expect(JSON.stringify([...database.values.values()])).not.toContain("guest-1");
    expect(JSON.stringify([...database.values.values()])).not.toContain("user-1");
    expect([...database.values.values()]).toEqual([
      {
        expiresAt: now.getTime() + 45_000,
        participantType: "anonymous",
        updatedAt: "2026-06-09T12:00:00.000Z"
      },
      {
        expiresAt: now.getTime() + 45_000,
        participantType: "authenticated",
        updatedAt: "2026-06-09T12:00:00.000Z"
      }
    ]);
  });

  it("counts non-expired records and removes stale RTDB presence rows opportunistically", async () => {
    const database = new FakeSilentPrayerRtdbDatabase();
    database.values.set("silentPrayerPresence/event-1/active", {
      expiresAt: new Date("2026-06-09T12:00:45.000Z").getTime(),
      participantType: "anonymous",
      updatedAt: "2026-06-09T12:00:00.000Z"
    });
    database.values.set("silentPrayerPresence/event-1/expired", {
      expiresAt: new Date("2026-06-09T11:59:59.000Z").getTime(),
      participantType: "authenticated",
      updatedAt: "2026-06-09T11:59:00.000Z"
    });
    database.values.set("silentPrayerPresence/event-1/malformed", {
      expiresAt: "should-not-count",
      participantType: "anonymous"
    });
    const store = new FirebaseRtdbSilentPrayerPresenceStore(database, "presence-secret");

    await expect(
      store.countPresence(
        "silent-prayer:event-1:presence:",
        new Date("2026-06-09T12:00:00.000Z")
      )
    ).resolves.toBe(1);

    expect(database.values.has("silentPrayerPresence/event-1/expired")).toBe(false);
    expect(database.values.has("silentPrayerPresence/event-1/malformed")).toBe(false);
  });

  it("removes the hashed RTDB presence key on leave", async () => {
    const database = new FakeSilentPrayerRtdbDatabase();
    const store = new FirebaseRtdbSilentPrayerPresenceStore(database, "presence-secret");
    const key = "silent-prayer:event-1:presence:anonymous:guest-1";

    await store.upsertPresence(key, 45_000, new Date("2026-06-09T12:00:00.000Z"));
    await store.deletePresence(key);

    expect(database.values.size).toBe(0);
  });
});

describe("createConfiguredSilentPrayerPresenceStore", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRedisUrl = process.env.REDIS_URL;
  const originalRealtimeProvider = process.env.SILENT_PRAYER_REALTIME_PROVIDER;
  const originalDatabaseUrl = process.env.FIREBASE_DATABASE_URL;
  const originalHashSecret = process.env.SILENT_PRAYER_PRESENCE_HASH_SECRET;

  afterEach(() => {
    setOptionalEnv("NODE_ENV", originalNodeEnv);
    setOptionalEnv("REDIS_URL", originalRedisUrl);
    setOptionalEnv("SILENT_PRAYER_REALTIME_PROVIDER", originalRealtimeProvider);
    setOptionalEnv("FIREBASE_DATABASE_URL", originalDatabaseUrl);
    setOptionalEnv("SILENT_PRAYER_PRESENCE_HASH_SECRET", originalHashSecret);
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

  it("rejects in-memory realtime in production when explicitly selected", () => {
    delete process.env.REDIS_URL;
    process.env.NODE_ENV = "production";
    process.env.SILENT_PRAYER_REALTIME_PROVIDER = "in-memory";

    expect(() => createConfiguredSilentPrayerPresenceStore()).toThrow(
      "SILENT_PRAYER_REALTIME_PROVIDER=in-memory is not allowed in production."
    );
  });

  it("requires RTDB configuration when firebase-rtdb is selected", () => {
    process.env.NODE_ENV = "test";
    process.env.SILENT_PRAYER_REALTIME_PROVIDER = "firebase-rtdb";
    delete process.env.FIREBASE_DATABASE_URL;
    process.env.SILENT_PRAYER_PRESENCE_HASH_SECRET = "presence-secret";

    expect(() => createConfiguredSilentPrayerPresenceStore()).toThrow(
      "FIREBASE_DATABASE_URL is required for firebase-rtdb silent-prayer presence."
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

class FakeSilentPrayerRtdbDatabase implements SilentPrayerRtdbDatabase {
  readonly values = new Map<string, unknown>();

  ref(path: string): SilentPrayerRtdbReference {
    return new FakeSilentPrayerRtdbReference(path, this.values);
  }
}

class FakeSilentPrayerRtdbReference implements SilentPrayerRtdbReference {
  constructor(
    private readonly path: string,
    private readonly values: Map<string, unknown>
  ) {}

  set(value: unknown): Promise<void> {
    this.values.set(this.path, value);

    return Promise.resolve();
  }

  remove(): Promise<void> {
    this.values.delete(this.path);

    return Promise.resolve();
  }

  once(eventType: "value"): Promise<{ val(): unknown }> {
    if (eventType !== "value") {
      throw new Error("Fake RTDB only supports value reads.");
    }

    const prefix = `${this.path}/`;
    const children = Object.fromEntries(
      [...this.values.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => [key.slice(prefix.length), value])
    );

    return Promise.resolve({
      val: () => children
    });
  }
}

function setOptionalEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
