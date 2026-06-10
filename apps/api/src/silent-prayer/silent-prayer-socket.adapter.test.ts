import type { INestApplication, INestApplicationContext } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureSilentPrayerSocketIoAdapter,
  SilentPrayerRedisSocketIoAdapter,
  type RedisSocketAdapterClient,
  type SocketIoRedisAdapterFactory
} from "./silent-prayer-socket.adapter.js";

describe("SilentPrayerRedisSocketIoAdapter", () => {
  it("connects duplicated Redis clients and closes both clients", async () => {
    const pubClient = new FakeRedisSocketAdapterClient("pub");
    const subClient = new FakeRedisSocketAdapterClient("sub");
    pubClient.duplicateClient = subClient;
    const adapter = new SilentPrayerRedisSocketIoAdapter(
      {} as INestApplicationContext,
      "redis://example.test:6379",
      () => pubClient,
      (pub, sub) => {
        expect(pub).toBe(pubClient);
        expect(sub).toBe(subClient);

        return (() => undefined) as unknown as ReturnType<SocketIoRedisAdapterFactory>;
      }
    );

    await adapter.connectToRedis();

    expect(pubClient.connectCount).toBe(1);
    expect(subClient.connectCount).toBe(1);

    await adapter.closeRedisConnections();

    expect(pubClient.quitCount).toBe(1);
    expect(subClient.quitCount).toBe(1);
  });

});

describe("configureSilentPrayerSocketIoAdapter", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRedisUrl = process.env.REDIS_URL;
  const originalRealtimeProvider = process.env.SILENT_PRAYER_REALTIME_PROVIDER;

  afterEach(() => {
    setOptionalEnv("NODE_ENV", originalNodeEnv);
    setOptionalEnv("REDIS_URL", originalRedisUrl);
    setOptionalEnv("SILENT_PRAYER_REALTIME_PROVIDER", originalRealtimeProvider);
  });

  it("keeps local/test socket wiring in process when Redis is not configured", async () => {
    setOptionalEnv("REDIS_URL", undefined);
    setOptionalEnv("NODE_ENV", "test");

    await expect(configureSilentPrayerSocketIoAdapter(fakeApp())).resolves.toBeNull();
  });

  it("fails fast in production when Redis socket wiring is missing", async () => {
    setOptionalEnv("REDIS_URL", undefined);
    setOptionalEnv("NODE_ENV", "production");
    setOptionalEnv("SILENT_PRAYER_REALTIME_PROVIDER", "redis-socket");

    await expect(configureSilentPrayerSocketIoAdapter(fakeApp())).rejects.toThrow(
      "REDIS_URL is required for production silent-prayer sockets."
    );
  });

  it("skips Socket.IO Redis wiring in production when RTDB realtime is selected", async () => {
    const app = fakeApp();
    setOptionalEnv("REDIS_URL", undefined);
    setOptionalEnv("NODE_ENV", "production");
    setOptionalEnv("SILENT_PRAYER_REALTIME_PROVIDER", "firebase-rtdb");

    await expect(configureSilentPrayerSocketIoAdapter(app)).resolves.toBeNull();
    expect(app.useWebSocketAdapter).not.toHaveBeenCalled();
  });

  it("configures the Socket.IO Redis adapter when Redis is configured", async () => {
    const app = fakeApp();
    let connectCount = 0;
    const adapter = {
      connectToRedis() {
        connectCount += 1;

        return Promise.resolve();
      }
    } as unknown as SilentPrayerRedisSocketIoAdapter;
    setOptionalEnv("REDIS_URL", "redis://example.test:6379");
    setOptionalEnv("NODE_ENV", "production");

    await expect(
      configureSilentPrayerSocketIoAdapter(app, (_app, redisUrl) => {
        expect(redisUrl).toBe("redis://example.test:6379");

        return adapter;
      })
    ).resolves.toBe(adapter);
    expect(connectCount).toBe(1);
    expect(app.useWebSocketAdapter).toHaveBeenCalledWith(adapter);
  });
});

class FakeRedisSocketAdapterClient implements RedisSocketAdapterClient {
  isOpen = false;
  connectCount = 0;
  quitCount = 0;
  duplicateClient: RedisSocketAdapterClient | null = null;

  constructor(readonly name: string) {}

  connect(): Promise<void> {
    this.connectCount += 1;
    this.isOpen = true;

    return Promise.resolve();
  }

  duplicate(): RedisSocketAdapterClient {
    if (!this.duplicateClient) {
      throw new Error(`Missing duplicate client for ${this.name}`);
    }

    return this.duplicateClient;
  }

  quit(): Promise<void> {
    this.quitCount += 1;
    this.isOpen = false;

    return Promise.resolve();
  }
}

function fakeApp(): INestApplication & {
  useWebSocketAdapter: ReturnType<typeof vi.fn>;
} {
  return {
    useWebSocketAdapter: vi.fn()
  } as unknown as INestApplication & {
    useWebSocketAdapter: ReturnType<typeof vi.fn>;
  };
}

function setOptionalEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
