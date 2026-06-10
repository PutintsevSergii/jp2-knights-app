import { describe, expect, it, vi } from "vitest";
import {
  connectWithRetry,
  createPrismaClientOptions,
  readDatabaseRuntimeConfig
} from "./database-runtime.config.js";
import { PrismaService } from "./prisma.service.js";

describe("PrismaService", () => {
  it("disconnects the Prisma client during module shutdown", async () => {
    const service = new PrismaService();
    const disconnect = vi.spyOn(service, "$disconnect").mockResolvedValue(undefined);

    await expect(service.onModuleDestroy()).resolves.toBeUndefined();

    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("does not connect on boot when startup connection is disabled", async () => {
    const service = new PrismaService({
      connectOnBoot: false,
      connectionLimit: 5,
      poolTimeoutSeconds: 10,
      startupRetryAttempts: 3,
      startupRetryDelayMs: 0
    });
    const connect = vi.spyOn(service, "$connect").mockResolvedValue(undefined);

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(connect).not.toHaveBeenCalled();
  });

  it("connects with retry when startup connection is enabled", async () => {
    const service = new PrismaService({
      connectOnBoot: true,
      connectionLimit: 5,
      poolTimeoutSeconds: 10,
      startupRetryAttempts: 3,
      startupRetryDelayMs: 0
    });
    const connect = vi
      .spyOn(service, "$connect")
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(undefined);

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(connect).toHaveBeenCalledTimes(2);
  });
});

describe("database runtime config", () => {
  it("adds low-cost Cloud Run Prisma pool parameters without overriding explicit URL values", () => {
    const config = readDatabaseRuntimeConfig({
      NODE_ENV: "production",
      DATABASE_URL:
        "postgresql://user:pass@127.0.0.1:5432/jp2?schema=public&connection_limit=9",
      PRISMA_CONNECTION_LIMIT: "3",
      PRISMA_POOL_TIMEOUT_SECONDS: "7"
    });

    expect(config.connectOnBoot).toBe(true);
    expect(config.connectionLimit).toBe(3);
    expect(config.poolTimeoutSeconds).toBe(7);
    expect(config.databaseUrl).toContain("connection_limit=9");
    expect(config.databaseUrl).toContain("pool_timeout=7");
  });

  it("allows non-production smoke checks to keep health shallow without a database", () => {
    const config = readDatabaseRuntimeConfig({
      NODE_ENV: "development"
    });

    expect(config).toEqual({
      connectOnBoot: false,
      connectionLimit: 5,
      poolTimeoutSeconds: 10,
      startupRetryAttempts: 5,
      startupRetryDelayMs: 1000
    });
    expect(createPrismaClientOptions(config)).toEqual({});
  });

  it("honors explicit boot connection and retry controls", () => {
    const config = readDatabaseRuntimeConfig({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:pass@db.example.test:5432/jp2",
      PRISMA_CONNECT_ON_BOOT: "true",
      PRISMA_STARTUP_RETRY_ATTEMPTS: "8",
      PRISMA_STARTUP_RETRY_DELAY_MS: "250"
    });

    expect(config.connectOnBoot).toBe(true);
    expect(config.startupRetryAttempts).toBe(8);
    expect(config.startupRetryDelayMs).toBe(250);
    expect(createPrismaClientOptions(config)).toEqual({
      datasources: {
        db: {
          url: "postgresql://user:pass@db.example.test:5432/jp2?connection_limit=5&pool_timeout=10"
        }
      }
    });
  });

  it("retries connection attempts and rethrows the final failure", async () => {
    const connect = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("still down"));
    const sleep = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    await expect(
      connectWithRetry(connect, {
        attempts: 2,
        delayMs: 25,
        sleep
      })
    ).rejects.toThrow("still down");

    expect(connect).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledOnce();
    expect(sleep).toHaveBeenCalledWith(25);
  });
});
