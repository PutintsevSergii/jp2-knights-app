import type { INestApplication, INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server, ServerOptions } from "socket.io";

export interface RedisSocketAdapterClient {
  readonly isOpen: boolean;
  connect(): Promise<unknown>;
  duplicate(): RedisSocketAdapterClient;
  quit(): Promise<unknown>;
}

export type RedisSocketAdapterClientFactory = () => RedisSocketAdapterClient;
export type SocketIoRedisAdapterFactory = (
  pubClient: RedisSocketAdapterClient,
  subClient: RedisSocketAdapterClient
) => ReturnType<typeof createAdapter>;

export type SilentPrayerSocketIoAdapterFactory = (
  app: INestApplication,
  redisUrl: string
) => SilentPrayerRedisSocketIoAdapter;

export class SilentPrayerRedisSocketIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: RedisSocketAdapterClient | null = null;
  private subClient: RedisSocketAdapterClient | null = null;

  constructor(
    app: INestApplicationContext,
    private readonly redisUrl: string,
    private readonly createRedisClient: RedisSocketAdapterClientFactory = () =>
      createClient({ url: redisUrl }),
    private readonly createRedisAdapter: SocketIoRedisAdapterFactory = (pubClient, subClient) =>
      createAdapter(
        pubClient as Parameters<typeof createAdapter>[0],
        subClient as Parameters<typeof createAdapter>[1]
      )
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    this.pubClient = this.createRedisClient();
    this.subClient = this.pubClient.duplicate();

    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    this.adapterConstructor = this.createRedisAdapter(this.pubClient, this.subClient);
  }

  /* v8 ignore start */
  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
  /* v8 ignore stop */

  async closeRedisConnections(): Promise<void> {
    await Promise.all([
      this.pubClient?.isOpen ? this.pubClient.quit() : Promise.resolve(),
      this.subClient?.isOpen ? this.subClient.quit() : Promise.resolve()
    ]);
  }
}

export async function configureSilentPrayerSocketIoAdapter(
  app: INestApplication,
  /* v8 ignore next */
  createAdapterForRedis: SilentPrayerSocketIoAdapterFactory = (nestApp, redisUrl) =>
    new SilentPrayerRedisSocketIoAdapter(nestApp, redisUrl)
): Promise<SilentPrayerRedisSocketIoAdapter | null> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL is required for production silent-prayer sockets.");
    }

    return null;
  }

  const adapter = createAdapterForRedis(app, redisUrl);
  await adapter.connectToRedis();
  app.useWebSocketAdapter(adapter);

  return adapter;
}
