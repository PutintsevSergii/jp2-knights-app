import type { Prisma } from "@prisma/client";

export const DATABASE_RUNTIME_CONFIG = Symbol("DATABASE_RUNTIME_CONFIG");

export interface DatabaseRuntimeConfig {
  databaseUrl?: string;
  connectOnBoot: boolean;
  connectionLimit: number;
  poolTimeoutSeconds: number;
  startupRetryAttempts: number;
  startupRetryDelayMs: number;
}

const DEFAULT_CONNECTION_LIMIT = 5;
const DEFAULT_POOL_TIMEOUT_SECONDS = 10;
const DEFAULT_STARTUP_RETRY_ATTEMPTS = 5;
const DEFAULT_STARTUP_RETRY_DELAY_MS = 1_000;

export function readDatabaseRuntimeConfig(
  env: Record<string, unknown> = process.env
): DatabaseRuntimeConfig {
  const nodeEnv = readEnvString(env, "NODE_ENV");
  const databaseUrl = withPoolQueryParams(readEnvString(env, "DATABASE_URL"), {
    connectionLimit: readPositiveInteger(
      env,
      "PRISMA_CONNECTION_LIMIT",
      DEFAULT_CONNECTION_LIMIT
    ),
    poolTimeoutSeconds: readPositiveInteger(
      env,
      "PRISMA_POOL_TIMEOUT_SECONDS",
      DEFAULT_POOL_TIMEOUT_SECONDS
    )
  });

  return {
    ...optionalObjectProperty("databaseUrl", databaseUrl),
    connectOnBoot:
      readBoolean(env, "PRISMA_CONNECT_ON_BOOT") ??
      readBoolean(env, "DATABASE_CONNECT_ON_BOOT") ??
      nodeEnv === "production",
    connectionLimit: readPositiveInteger(
      env,
      "PRISMA_CONNECTION_LIMIT",
      DEFAULT_CONNECTION_LIMIT
    ),
    poolTimeoutSeconds: readPositiveInteger(
      env,
      "PRISMA_POOL_TIMEOUT_SECONDS",
      DEFAULT_POOL_TIMEOUT_SECONDS
    ),
    startupRetryAttempts: readPositiveInteger(
      env,
      "PRISMA_STARTUP_RETRY_ATTEMPTS",
      DEFAULT_STARTUP_RETRY_ATTEMPTS
    ),
    startupRetryDelayMs: readPositiveInteger(
      env,
      "PRISMA_STARTUP_RETRY_DELAY_MS",
      DEFAULT_STARTUP_RETRY_DELAY_MS
    )
  };
}

export function createPrismaClientOptions(
  config: DatabaseRuntimeConfig
): Prisma.PrismaClientOptions {
  if (!config.databaseUrl) {
    return {};
  }

  return {
    datasources: {
      db: {
        url: config.databaseUrl
      }
    }
  };
}

export async function connectWithRetry(
  connect: () => Promise<void>,
  options: {
    attempts: number;
    delayMs: number;
    sleep?: (delayMs: number) => Promise<void>;
  }
): Promise<void> {
  const attempts = Math.max(1, options.attempts);
  const sleep = options.sleep ?? delay;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await connect();
      return;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await sleep(options.delayMs);
      }
    }
  }

  throw lastError;
}

function withPoolQueryParams(
  databaseUrl: string | undefined,
  options: {
    connectionLimit: number;
    poolTimeoutSeconds: number;
  }
): string | undefined {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);

    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", String(options.connectionLimit));
    }

    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", String(options.poolTimeoutSeconds));
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function readPositiveInteger(
  env: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const value = readEnvString(env, key);

  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(env: Record<string, unknown>, key: string): boolean | undefined {
  const value = readEnvString(env, key)?.toLowerCase();

  if (value === "true" || value === "1" || value === "yes") {
    return true;
  }

  if (value === "false" || value === "0" || value === "no") {
    return false;
  }

  return undefined;
}

function optionalObjectProperty<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined
): Partial<Record<TKey, TValue>> {
  return value ? ({ [key]: value } as Partial<Record<TKey, TValue>>) : {};
}

function delay(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
